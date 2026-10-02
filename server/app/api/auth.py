from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.models import User
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserResponse, SendOTPRequest, VerifyOTPRequest, ForgotPasswordRequest
from app.models.models import OTPVerification
import secrets
from datetime import datetime, timedelta
from app.core.email import send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-otp")
def send_otp(payload: SendOTPRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()

    # Clear any previous unused/expired OTPs for this email address
    db.query(OTPVerification).filter(OTPVerification.email == email_clean).delete()
    db.commit()
    
    # Generate cryptographically secure 6-digit OTP
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    new_otp = OTPVerification(
        email=email_clean,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=0
    )
    db.add(new_otp)
    db.commit()
    db.refresh(new_otp)
    
    try:
        send_otp_email(to_email=email_clean, otp_code=otp_code)
    except Exception as e:
        db.delete(new_otp)
        db.commit()
        # Re-raise the exception (send_otp_email raises descriptive HTTPExceptions)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deliver OTP email: {str(e)}"
        )
        
    return {
        "message": "OTP verification code sent successfully to your email! Please check your inbox.",
        "email": email_clean
    }

@router.post("/verify-otp")
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    otp_clean = payload.otp.strip()

    # Check for active valid OTP
    stored_otp = db.query(OTPVerification).filter(
        OTPVerification.email == email_clean,
        OTPVerification.otp_code == otp_clean,
        OTPVerification.is_used == 0,
        OTPVerification.expires_at > datetime.utcnow()
    ).first()
    
    if not stored_otp:
        # Check if already verified/used
        already_used = db.query(OTPVerification).filter(
            OTPVerification.email == email_clean,
            OTPVerification.otp_code == otp_clean,
            OTPVerification.is_used != 0
        ).first()
        if already_used:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This OTP has already been used. Please request a new code."
            )

        # Check if expired
        expired = db.query(OTPVerification).filter(
            OTPVerification.email == email_clean,
            OTPVerification.otp_code == otp_clean,
            OTPVerification.expires_at <= datetime.utcnow()
        ).first()
        if expired:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This verification code has expired. Please request a new one."
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check and try again."
        )
        
    # Mark OTP as verified
    stored_otp.is_used = 1
    db.commit()
        
    return {"message": "OTP verified successfully!", "verified": True}

@router.post("/register", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if not payload.otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP verification is required")

    email_clean = payload.email.strip().lower()
    otp_clean = payload.otp.strip()

    stored_otp = db.query(OTPVerification).filter(
        OTPVerification.email == email_clean,
        OTPVerification.otp_code == otp_clean,
        OTPVerification.is_used == 1,
        OTPVerification.expires_at > datetime.utcnow()
    ).first()
    
    if not stored_otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please verify your email OTP first")
            
    # Check if username exists
    if db.query(User).filter(User.username == payload.username.strip()).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is already taken")
    
    # Check if email exists
    if db.query(User).filter(User.email == email_clean).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")

    user_role = "ADMIN" if payload.role and payload.role.upper() == "ADMIN" else "USER"

    user = User(
        name=f"{payload.firstName.strip()} {payload.lastName.strip()}",
        first_name=payload.firstName.strip(),
        last_name=payload.lastName.strip(),
        username=payload.username.strip(),
        email=email_clean,
        age=payload.age,
        role=user_role,
        password_hash=get_password_hash(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Invalidate / remove the used OTP so it cannot be reused
    if stored_otp:
        db.delete(stored_otp)
        db.commit()

    access_token = create_access_token(data={"sub": str(user.id), "username": user.username, "role": user.role})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role
        )
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.username)
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    access_token = create_access_token(data={"sub": str(user.id), "username": user.username, "role": user.role})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            first_name=user.first_name or "",
            last_name=user.last_name or "",
            role=user.role
        )
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        first_name=current_user.first_name or "",
        last_name=current_user.last_name or "",
        role=current_user.role
    )

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    otp_clean = payload.otp.strip()

    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No account registered with this email")
        
    if not otp_clean:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP verification is required")

    stored_otp = db.query(OTPVerification).filter(
        OTPVerification.email == email_clean,
        OTPVerification.otp_code == otp_clean,
        OTPVerification.is_used == 1,
        OTPVerification.expires_at > datetime.utcnow()
    ).first()
    
    if not stored_otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please verify your OTP first")
        
    db.delete(stored_otp)

    user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password has been successfully reset! You can now login.", "success": True}

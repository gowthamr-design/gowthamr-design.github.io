import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token, get_current_active_user, get_optional_current_user
from app.core.email import send_admin_booking_notification_email
from app.models.models import Booking, User
from app.schemas.schemas import BookingCalculateRequest, BookingCalculateResponse, BookingCreateRequest, BookingResponse

router = APIRouter(prefix="/bookings", tags=["Bookings"])

BASE_PRICES = {
    "high": 150000.0,
    "medium": 75000.0,
    "low": 30000.0
}

NEEDS_COST_MAP = {
    "Food": 40000,
    "Catering": 25000,
    "Decorations": 35000,
    "Cosmetics": 15000,
    "DJ Music": 20000,
    "Photography": 30000,
    "Videography": 35000,
    "Lighting": 15000
}

@router.post("/calculate", response_model=BookingCalculateResponse)
def calculate_booking_price(payload: BookingCalculateRequest):
    tier = payload.package_tier.lower()
    base_price = BASE_PRICES.get(tier, 150000.0)
    add_ons = sum(payload.needs_values)

    diff_days = 1
    if payload.from_date and payload.to_date:
        try:
            d1 = datetime.strptime(payload.from_date, "%Y-%m-%d")
            d2 = datetime.strptime(payload.to_date, "%Y-%m-%d")
            delta = (d2 - d1).days + 1
            if delta > 1:
                diff_days = delta
        except Exception:
            diff_days = 1

    total = (base_price + add_ons) * diff_days if diff_days > 1 else (base_price + add_ons)

    return BookingCalculateResponse(
        duration_days=diff_days,
        base_amount=base_price,
        add_ons_total=add_ons,
        total_estimated_amount=float(total),
        formatted_total=f"₹ {total:,.0f}"
    )

@router.post("")
def create_booking(
    payload: BookingCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    tier = payload.package_tier.lower()
    base_price = BASE_PRICES.get(tier, 150000.0)

    # Calculate needs sum
    needs_sum = 0
    for need in payload.needs:
        needs_sum += NEEDS_COST_MAP.get(need, 0)

    diff_days = 1
    if payload.fromDate and payload.toDate:
        try:
            d1 = datetime.strptime(payload.fromDate, "%Y-%m-%d")
            d2 = datetime.strptime(payload.toDate, "%Y-%m-%d")
            delta = (d2 - d1).days + 1
            if delta > 1:
                diff_days = delta
        except Exception:
            diff_days = 1

    total_amount = (base_price + needs_sum) * diff_days if diff_days > 1 else (base_price + needs_sum)
    booking_ref = f"BB-2026-{uuid.uuid4().hex[:6].upper()}"

    booking = Booking(
        booking_reference=booking_ref,
        user_id=current_user.id,
        package_tier=payload.package_tier,
        full_name=payload.fullName or current_user.name or current_user.username,
        mobile_no=payload.mobileNo or current_user.phone or "",
        alt_mobile_no=payload.altMobileNo,
        email=payload.emailAddr or current_user.email,
        function_category=payload.functionType,
        district=payload.districtSelect,
        place_area=payload.place,
        full_address=payload.fullAddress,
        pincode=payload.pincode,
        from_date=payload.fromDate,
        to_date=payload.toDate,
        from_time=payload.fromTime,
        to_time=payload.toTime,
        duration_days=diff_days,
        map_location_url=payload.mapLocation,
        selected_needs=", ".join(payload.needs),
        total_amount=total_amount,
        status="UPCOMING",
        event_type=payload.functionType,
        date=f"{payload.fromDate} to {payload.toDate}" if diff_days > 1 else payload.fromDate,
        location=f"{payload.place}, {payload.districtSelect}"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Send admin notification email (non-blocking, failure-safe)
    send_admin_booking_notification_email(booking=booking)

    return {
        "success": True,
        "message": f"Your {payload.package_tier.capitalize()} Package Order has been placed successfully!",
        "booking_reference": booking_ref,
        "total_amount": float(total_amount),
        "formatted_amount": f"₹ {total_amount:,.0f}",
        "booking_id": booking.id
    }

@router.get("/{identifier}", response_model=BookingResponse)
def get_booking_by_id_or_ref(
    identifier: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_current_user)
):
    if identifier.isdigit():
        booking = db.query(Booking).filter(Booking.id == int(identifier)).first()
    else:
        booking = db.query(Booking).filter(Booking.booking_reference == identifier).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Access Control:
    # 1. Admin & Super Admin have full access
    if current_user and (current_user.role or "").upper() in ["ADMIN", "SUPER_ADMIN"]:
        pass
    # 2. Authenticated standard user can only access their own bookings
    elif current_user:
        is_owner = (
            (booking.user_id is not None and booking.user_id == current_user.id) or
            (booking.email and booking.email.strip().lower() == current_user.email.strip().lower())
        )
        if not is_owner:
            raise HTTPException(
                status_code=403,
                detail="Access denied: You do not have permission to view this booking."
            )
    # 3. Unauthenticated access is only allowed for the unique booking reference token (e.g. immediately after checkout)
    else:
        if identifier.isdigit():
            raise HTTPException(
                status_code=401,
                detail="Authentication required to access booking details by ID."
            )

    return BookingResponse(
        id=booking.id,
        booking_reference=booking.booking_reference,
        package_tier=booking.package_tier,
        full_name=booking.full_name,
        mobile_no=booking.mobile_no,
        alt_mobile_no=booking.alt_mobile_no,
        email=booking.email,
        function_category=booking.function_category,
        district=booking.district,
        place_area=booking.place_area,
        full_address=booking.full_address,
        pincode=booking.pincode,
        from_date=booking.from_date,
        to_date=booking.to_date,
        from_time=booking.from_time,
        to_time=booking.to_time,
        duration_days=booking.duration_days,
        map_location_url=booking.map_location_url,
        selected_needs=booking.selected_needs,
        status=booking.status,
        total_amount=float(booking.total_amount or 0.0),
        created_at=booking.created_at.isoformat() if booking.created_at else None
    )

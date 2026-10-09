from typing import List
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import decode_token
from app.models.models import Booking, User

router = APIRouter(prefix="/events", tags=["Events"])

DEFAULT_EVENTS = [
    {
        "id": 1,
        "title": "Grand Royal Wedding",
        "category": "Wedding (Thirumanam)",
        "status": "UPCOMING",
        "date": "15 Nov 2026",
        "location": "Chennai, Tamil Nadu",
        "description": "Full traditional wedding setup with imported floral backdrop, cinematic 4K videography, and lavish multi-course feast.",
        "image_url": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
        "total_amount": 350000.0
    },
    {
        "id": 2,
        "title": "Corporate Annual Gala",
        "category": "Corporate Events",
        "status": "UPCOMING",
        "date": "02 Dec 2026",
        "location": "Coimbatore, Tamil Nadu",
        "description": "Executive conference setup with high-end audio-visual systems, ambient lighting, and executive catering buffet.",
        "image_url": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
        "total_amount": 180000.0
    },
    {
        "id": 3,
        "title": "1st Birthday Celebration",
        "category": "Birthday Parties",
        "status": "COMPLETED",
        "date": "24 Aug 2026",
        "location": "Madurai, Tamil Nadu",
        "description": "Themed balloon arch decorations, custom cake table arrangement, sound system, and fun entertainment activities.",
        "image_url": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
        "total_amount": 45000.0
    }
]

@router.get("/my-events")
def get_my_events(authorization: str = Header(None), db: Session = Depends(get_db)):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        decoded = decode_token(token)
        if decoded and "sub" in decoded:
            try:
                user_id = int(decoded["sub"])
            except Exception:
                user_id = None

    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        user_email = user.email.strip().lower() if user and user.email else None

        if user_email:
            bookings = db.query(Booking).filter(
                (Booking.user_id == user_id) | (func.lower(Booking.email) == user_email)
            ).order_by(Booking.id.desc()).all()
        else:
            bookings = db.query(Booking).filter(Booking.user_id == user_id).order_by(Booking.id.desc()).all()

        if bookings:
            return [
                {
                    "id": b.id,
                    "title": f"{b.function_category or 'Custom Event'} ({b.package_tier.capitalize() if b.package_tier else 'Standard'})",
                    "category": b.function_category or "Event",
                    "status": b.status or "UPCOMING",
                    "date": f"{b.from_date}" if b.from_date else (b.date or "Scheduled Date"),
                    "location": f"{b.place_area or ''}, {b.district or 'Tamil Nadu'}",
                    "description": f"Booked for {b.full_name or 'Customer'}. Needs: {b.selected_needs or 'Complete event management'}.",
                    "image_url": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
                    "total_amount": float(b.total_amount or 0.0),
                    "booking_reference": b.booking_reference
                }
                for b in bookings
            ]

    # Return default events if not authenticated or no prior bookings
    return DEFAULT_EVENTS

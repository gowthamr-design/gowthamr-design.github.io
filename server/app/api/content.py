import json
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import PageContent
from app.schemas.schemas import PageContentResponse

router = APIRouter(prefix="/content", tags=["Site Content"])

DEFAULT_PAGE_CONTENTS = {
    "home": {
        "hero": {
            "tag": "Banana Brothers Events",
            "badge_text": "Banana Brothers Events",
            "title": "Where Moments Become Memories.",
            "lead": "From thoughtful planning to grand celebrations, we bring your vision to life with seamless execution. Every detail is managed with care to create unforgettable moments.",
            "description": "From thoughtful planning to grand celebrations, we bring your vision to life with seamless execution. Every detail is managed with care to create unforgettable moments.",
            "primaryBtnText": "Explore Packages",
            "primary_btn_text": "Explore Packages",
            "primaryBtnLink": "/packages",
            "primary_btn_url": "/packages",
            "secondaryBtnText": "Book Event",
            "secondary_btn_text": "Book Event",
            "secondaryBtnLink": "/packages",
            "secondary_btn_url": "/packages"
        },
        "metrics": {
            "events": 1200,
            "events_count": 1200,
            "satisfaction": 98,
            "satisfaction_pct": 98,
            "specialists": 50,
            "specialists_count": 50,
            "experience": 15,
            "experience_years": 15
        },
        "highlights": [
            {
                "id": 1,
                "tag": "Luxury Weddings",
                "title": "The Grand Imperial Wedding",
                "desc": "Bespoke grand mandap setups, ethereal floral canopies & regal crystal chandeliers.",
                "image": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=75"
            },
            {
                "id": 2,
                "tag": "Corporate Summits",
                "title": "Global Leadership Summit",
                "desc": "Cutting-edge panoramic staging, intelligent beam lighting & executive keynote production.",
                "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=75"
            },
            {
                "id": 3,
                "tag": "Milestone Celebrations",
                "title": "Opulent Golden Soirée",
                "desc": "Luxe marquee illuminations, artisanal decor arrangements & VIP celebratory hosting.",
                "image": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=75"
            },
            {
                "id": 4,
                "tag": "Concerts & Festivals",
                "title": "Electrifying Arena Stage",
                "desc": "Concert line-array acoustics, dynamic synchronized laser fixtures & stadium energy.",
                "image": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=75"
            },
            {
                "id": 5,
                "tag": "Destination Galas",
                "title": "Ethereal Sunset Pavilion",
                "desc": "Panoramic beachfront florals, fairy-light canopies & timeless romantic elegance.",
                "image": "https://images.unsplash.com/photo-1545232979-fbf69c362143?auto=format&fit=crop&w=800&q=75"
            },
            {
                "id": 6,
                "tag": "Royal Banquets",
                "title": "Prestige Ballroom Honors",
                "desc": "Black-tie dining staging, majestic ceiling drapery & world-class banquet coordination.",
                "image": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=75"
            }
        ]
    },
    "about": {
        "title": "Crafting Tamil Nadu's Finest Moments",
        "description": "Banana Brothers began with a passionate vision: to transform standard event hosting into high-art sensory celebrations. Serving Chennai, Coimbatore, Madurai, Trichy, and destination hubs across South India.",
        "phone": "+91 98765 43210",
        "email": "contact@bananabrothers.com",
        "headquarters": "Banana Brothers Creative Studio, Anna Nagar, Chennai - 600040"
    },
    "contact": {
        "support_phone": "+91 98765 43210",
        "support_email": "hello@bananabrothers.com",
        "office_hours": "Mon - Sun: 08:00 AM - 10:00 PM IST",
        "address": "Banana Brothers Events Hub, No. 45 Grand Avenue, Chennai, Tamil Nadu 600040"
    }
}

@router.get("/{page_key}")
def get_page_content(page_key: str, db: Session = Depends(get_db)):
    key_clean = page_key.strip().lower()
    
    # Initialize with default if available
    content_dict = {}
    if key_clean in DEFAULT_PAGE_CONTENTS:
        content_dict = json.loads(json.dumps(DEFAULT_PAGE_CONTENTS[key_clean]))

    records = db.query(PageContent).filter(PageContent.page_key == key_clean).all()
    if records:
        for r in records:
            try:
                content_dict[r.section_key] = json.loads(r.content_json)
            except Exception:
                content_dict[r.section_key] = r.content_json

    return content_dict

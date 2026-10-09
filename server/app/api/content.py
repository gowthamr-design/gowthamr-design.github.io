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
            "badge_text": "EST. 2018 • EXCELLENCE IN EVENT CRAFTSMANSHIP",
            "title_line_1": "Bespoke Celebrations,",
            "title_line_2": "Unforgettable Memories",
            "description": "Tamil Nadu's premier event management company. From magnificent weddings and milestone galas to high-impact corporate summits, we engineer extraordinary experiences with flawless execution.",
            "primary_btn_text": "Explore Packages",
            "primary_btn_url": "/packages",
            "secondary_btn_text": "View Our Work",
            "secondary_btn_url": "/gallery"
        },
        "metrics": {
            "events_count": 1200,
            "events_label": "Celebrations Delivered",
            "satisfaction_pct": 98,
            "satisfaction_label": "Client Satisfaction",
            "specialists_count": 50,
            "specialists_label": "In-House Specialists",
            "experience_years": 15,
            "experience_label": "Years Industry Mastery"
        },
        "highlights": [
            {
                "id": 1,
                "title": "Turnkey Event Execution",
                "desc": "End-to-end management from concept, 3D design, staging, catering to post-event teardown."
            },
            {
                "id": 2,
                "title": "Bespoke Decor & Production",
                "desc": "Custom handcrafted stages, ethereal lighting rigs, and floral architecture tailored to your theme."
            },
            {
                "id": 3,
                "title": "Transparent Guaranteed Pricing",
                "desc": "Itemized add-on calculations with zero hidden fees. Premium service guaranteed at every tier."
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

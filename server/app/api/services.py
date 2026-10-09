from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Service
from app.schemas.schemas import ServiceResponse

router = APIRouter(prefix="/services", tags=["Services"])

DEFAULT_SERVICES = [
    {
        "id": 1,
        "name": "Wedding Planners",
        "category": "Weddings",
        "description": "Complete end-to-end wedding management with traditional arrangements, themed setups, and seamless coordination.",
        "starting_price": 150000.0,
        "price_unit": "flat",
        "image_url": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": 2,
        "name": "Reception & Engagement",
        "category": "Weddings",
        "description": "Grand ring ceremony setups, luxury stage entrances, floral backdrops, and complete guest hospitality.",
        "starting_price": 80000.0,
        "price_unit": "flat",
        "image_url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": 3,
        "name": "Corporate Events",
        "category": "Corporate",
        "description": "Professional business conferences, product launches, annual company meets, and team celebrations.",
        "starting_price": 75000.0,
        "price_unit": "flat",
        "image_url": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": 4,
        "name": "Cultural Events",
        "category": "Corporate",
        "description": "Vibrant college fest execution, traditional performance stages, sound systems, and lighting management.",
        "starting_price": 50000.0,
        "price_unit": "flat",
        "image_url": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": 5,
        "name": "Birthday Parties",
        "category": "Birthdays",
        "description": "Customized themed birthday setups for children and adults with fun activities and decorative cake tables.",
        "starting_price": 25000.0,
        "price_unit": "flat",
        "image_url": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": 6,
        "name": "Baby Shower",
        "category": "Birthdays",
        "description": "Traditional and modern baby shower themes, decorated cradle setups, photo booths, and event management.",
        "starting_price": 35000.0,
        "price_unit": "flat",
        "image_url": "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": 7,
        "name": "Surprise Events",
        "category": "Entertainment",
        "description": "Memorable romantic proposals, anniversary surprises, secret birthday celebrations, and custom setups.",
        "starting_price": 15000.0,
        "price_unit": "flat",
        "image_url": "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": 8,
        "name": "Stage Decorations",
        "category": "Weddings",
        "description": "Elegant flower arc stages, custom balloon backdrops, ambient lighting, and modern thematic decorations.",
        "starting_price": 20000.0,
        "price_unit": "flat",
        "image_url": "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": 9,
        "name": "Catering Services",
        "category": "Weddings",
        "description": "Delicious vegetarian and non-vegetarian buffet spreads, traditional banana leaf feasts, and live counters.",
        "starting_price": 250.0,
        "price_unit": "plate",
        "image_url": "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": 10,
        "name": "Photography",
        "category": "Entertainment",
        "description": "High-resolution candid photography, traditional portraits, pre-wedding photoshoots, and premium albums.",
        "starting_price": 30000.0,
        "price_unit": "flat",
        "image_url": "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": 11,
        "name": "Videography",
        "category": "Entertainment",
        "description": "Cinematic 4K video coverage, aerial drone shots, live event streaming setups, and highlight editing.",
        "starting_price": 40000.0,
        "price_unit": "flat",
        "image_url": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": 12,
        "name": "Entertainment & DJ",
        "category": "Entertainment",
        "description": "High-energy live DJ performances, concert-grade sound setups, LED dance floors, and event anchors.",
        "starting_price": 18000.0,
        "price_unit": "flat",
        "image_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80"
    }
]

@router.get("", response_model=List[ServiceResponse])
def get_services(category: Optional[str] = Query(None), q: Optional[str] = Query(None), db: Session = Depends(get_db)):
    # Query only published database services or fallback to defaults
    services = db.query(Service).filter(Service.is_published == 1).order_by(Service.display_order.asc(), Service.id.asc()).all()
    if not services:
        res = DEFAULT_SERVICES
    else:
        res = [
            {
                "id": s.id,
                "name": s.name,
                "category": s.category or "Weddings",
                "description": s.description or "",
                "starting_price": float(s.starting_price or s.base_price or 10000.0),
                "price_unit": s.price_unit or "flat",
                "image_url": s.image_url or "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"
            }
            for s in services
        ]

    # Filter by category if supplied and not 'All Services'
    if category and category != "All Services":
        res = [s for s in res if s["category"].lower() == category.lower()]

    # Filter by keyword search
    if q:
        term = q.strip().lower()
        res = [s for s in res if term in s["name"].lower() or term in s["description"].lower()]

    return res

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import GalleryItem
from app.schemas.schemas import GalleryResponse

router = APIRouter(prefix="/gallery", tags=["Gallery"])

DEFAULT_GALLERY_ITEMS = [
    {"title": "Traditional Ceremony", "media_type": "image", "src": "/f214bc94-72b6-4202-9a01-2cece637fc3d.png", "category": "Weddings", "display_order": 1, "is_published": 1},
    {"title": "Stage Decoration", "media_type": "image", "src": "/f7cabbcd-e205-4b02-9924-97ccfe667442.png", "category": "Decor", "display_order": 2, "is_published": 1},
    {"title": "Golden Soirée", "media_type": "image", "src": "/bg.png", "category": "Highlights", "display_order": 3, "is_published": 1},
    {"title": "Reception Grand Entrance", "media_type": "image", "src": "/bg1.png", "category": "Weddings", "display_order": 4, "is_published": 1},
    {"title": "Corporate Gala Illumination", "media_type": "image", "src": "/bg_blue.png", "category": "Corporate", "display_order": 5, "is_published": 1},
    {"title": "Celebration Moments", "media_type": "image", "src": "/videos/571166326_18053531924313917_6459894921198886133_n.webp", "category": "Celebrations", "display_order": 6, "is_published": 1},
    {"title": "Wedding Highlights Reel", "media_type": "video", "src": "/videos/reel-wedding-highlights.mp4", "poster_url": "/bg1.png", "category": "Reels", "display_order": 7, "is_published": 1},
    {"title": "Grand Couple Entry", "media_type": "video", "src": "/videos/reel-grand-entry.mp4", "poster_url": "/bg.png", "category": "Reels", "display_order": 8, "is_published": 1},
    {"title": "Celebration Highlights", "media_type": "video", "src": "/videos/reel-celebration-event.mp4", "poster_url": "/bg_blue.png", "category": "Reels", "display_order": 9, "is_published": 1},
    {"title": "Chenda Melam Cultural", "media_type": "video", "src": "/videos/reel-chenda-cultural.mp4", "poster_url": "/bg1.png", "category": "Cultural", "display_order": 10, "is_published": 1},
    {"title": "Stage Concert Energy", "media_type": "video", "src": "/videos/reel-stage-concert.mp4", "poster_url": "/bg.png", "category": "Concerts", "display_order": 11, "is_published": 1},
    {"title": "Badaga Tradition Dance", "media_type": "video", "src": "/videos/reel-badaga-tradition.mp4", "poster_url": "/bg1.png", "category": "Cultural", "display_order": 12, "is_published": 1},
    {"title": "DJ Beats & Laser Show", "media_type": "video", "src": "/videos/reel-dj-lights.mp4", "poster_url": "/bg_blue.png", "category": "DJ & Music", "display_order": 13, "is_published": 1},
    {"title": "Candid Joyous Moments", "media_type": "video", "src": "/videos/reel-candid-entry.mp4", "poster_url": "/bg.png", "category": "Highlights", "display_order": 14, "is_published": 1},
    {"title": "Luxury Reception Floral Decor", "media_type": "video", "src": "/videos/reel-reception-decor.mp4", "poster_url": "/bg1.png", "category": "Decor", "display_order": 15, "is_published": 1},
    {"title": "Cinematic Teaser", "media_type": "video", "src": "/videos/reel-short-teaser.mp4", "poster_url": "/bg_blue.png", "category": "Reels", "display_order": 16, "is_published": 1}
]

@router.get("", response_model=List[GalleryResponse])
def get_public_gallery(
    media_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    count = db.query(GalleryItem).count()
    if count == 0:
        for item_data in DEFAULT_GALLERY_ITEMS:
            db_item = GalleryItem(**item_data)
            db.add(db_item)
        db.commit()

    query = db.query(GalleryItem).filter(GalleryItem.is_published == 1)
    if media_type:
        query = query.filter(GalleryItem.media_type == media_type.lower())
    if category and category.lower() != "all":
        query = query.filter(GalleryItem.category.ilike(f"%{category.strip()}%"))
        
    return query.order_by(GalleryItem.display_order.asc(), GalleryItem.id.asc()).all()

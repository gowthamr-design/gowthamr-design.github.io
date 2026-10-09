import os
import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import require_admin, require_super_admin, get_password_hash
from app.models.models import Booking, User, Service, Package, GalleryItem, EventItem, PageContent
from app.schemas.schemas import (
    AdminStatsResponse,
    BookingResponse,
    StatusUpdateRequest,
    UserResponse,
    AdminCreateRequest,
    UserRoleUpdateRequest,
    UserStatusUpdateRequest,
    ServiceCreateRequest,
    ServiceUpdateRequest,
    ServiceResponse,
    PackageCreateRequest,
    PackageUpdateRequest,
    PackageResponse,
    GalleryCreateRequest,
    GalleryUpdateRequest,
    GalleryReorderRequest,
    GalleryResponse,
    EventCreateRequest,
    EventUpdateRequest,
    EventResponse,
    PageContentSaveRequest,
    PageContentResponse
)

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

UPLOAD_DIR = os.path.abspath("uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================================================================
# 1. MEDIA FILE UPLOADS
# =========================================================================

ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg",
    ".mp4", ".webm", ".mov"
}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB

@router.post("/upload-media")
async def upload_media_file(
    file: UploadFile = File(...),
    current_admin: User = Depends(require_admin)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File exceeds the maximum upload limit of 50 MB."
        )

    unique_filename = f"{uuid.uuid4().hex[:12]}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    media_type = "video" if ext in {".mp4", ".webm", ".mov"} else "image"
    public_url = f"/uploads/{unique_filename}"

    return {
        "success": True,
        "url": public_url,
        "filename": unique_filename,
        "media_type": media_type,
        "size_bytes": len(content)
    }

# =========================================================================
# 2. DASHBOARD OVERVIEW & STATS
# =========================================================================

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    total_bookings = db.query(Booking).count()
    upcoming_bookings = db.query(Booking).filter(Booking.status == "UPCOMING").count()
    completed_bookings = db.query(Booking).filter(Booking.status == "COMPLETED").count()
    cancelled_bookings = db.query(Booking).filter(Booking.status == "CANCELLED").count()
    
    total_rev = db.query(func.sum(Booking.total_amount)).filter(Booking.status != "CANCELLED").scalar() or 0.0
    total_customers = db.query(User).filter(User.role == "USER").count()

    return AdminStatsResponse(
        total_bookings=total_bookings,
        total_revenue=float(total_rev),
        upcoming_bookings=upcoming_bookings,
        completed_bookings=completed_bookings,
        cancelled_bookings=cancelled_bookings,
        total_customers=total_customers
    )

# =========================================================================
# 3. SERVICES MANAGEMENT (CRUD)
# =========================================================================

@router.get("/services", response_model=List[ServiceResponse])
def admin_get_services(
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    query = db.query(Service)
    if category and category.lower() != "all":
        query = query.filter(Service.category == category)
    if q:
        search = f"%{q.strip()}%"
        query = query.filter((Service.name.ilike(search)) | (Service.description.ilike(search)))
    return query.order_by(Service.display_order.asc(), Service.id.asc()).all()

@router.post("/services", response_model=ServiceResponse)
def admin_create_service(
    payload: ServiceCreateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    new_svc = Service(
        name=payload.name.strip(),
        category=payload.category.strip(),
        description=payload.description,
        starting_price=payload.starting_price,
        base_price=payload.base_price if payload.base_price is not None else payload.starting_price,
        price_unit=payload.price_unit or "flat",
        image_url=payload.image_url,
        display_order=payload.display_order or 0,
        is_published=payload.is_published if payload.is_published is not None else 1
    )
    db.add(new_svc)
    db.commit()
    db.refresh(new_svc)
    return new_svc

@router.put("/services/{service_id}", response_model=ServiceResponse)
def admin_update_service(
    service_id: int,
    payload: ServiceUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")

    if payload.name is not None: svc.name = payload.name.strip()
    if payload.category is not None: svc.category = payload.category.strip()
    if payload.description is not None: svc.description = payload.description
    if payload.starting_price is not None: svc.starting_price = payload.starting_price
    if payload.base_price is not None: svc.base_price = payload.base_price
    if payload.price_unit is not None: svc.price_unit = payload.price_unit
    if payload.image_url is not None: svc.image_url = payload.image_url
    if payload.display_order is not None: svc.display_order = payload.display_order
    if payload.is_published is not None: svc.is_published = payload.is_published

    db.commit()
    db.refresh(svc)
    return svc

@router.patch("/services/{service_id}/publish")
def admin_toggle_publish_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")

    svc.is_published = 0 if getattr(svc, "is_published", 1) == 1 else 1
    db.commit()
    return {"id": svc.id, "is_published": svc.is_published}

@router.delete("/services/{service_id}")
def admin_delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")

    db.delete(svc)
    db.commit()
    return {"success": True, "status": "deleted", "message": f"Service '{svc.name}' deleted successfully."}

# =========================================================================
# 4. PACKAGES MANAGEMENT (CRUD)
# =========================================================================

@router.get("/packages", response_model=List[PackageResponse])
def admin_get_packages(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    return db.query(Package).order_by(Package.display_order.asc(), Package.id.asc()).all()

@router.post("/packages", response_model=PackageResponse)
def admin_create_package(
    payload: PackageCreateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    pkg_name = (payload.name or payload.tier_name or "Custom Tier").strip()
    services_inc = payload.services_included
    if not services_inc and payload.features_list:
        services_inc = ", ".join(payload.features_list) if isinstance(payload.features_list, list) else str(payload.features_list)

    pkg = Package(
        name=pkg_name,
        tier_slug=payload.tier_slug or pkg_name.lower().replace(" ", "-"),
        badge_text=payload.badge_text,
        starting_price=payload.starting_price,
        base_price=payload.base_price if payload.base_price is not None else payload.starting_price,
        description=payload.description,
        services_included=services_inc,
        image_url=payload.image_url,
        display_order=payload.display_order or 0,
        is_published=int(payload.is_published) if payload.is_published is not None else 1
    )
    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return pkg

@router.put("/packages/{package_id}", response_model=PackageResponse)
def admin_update_package(
    package_id: int,
    payload: PackageUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    pkg = db.query(Package).filter(Package.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found.")

    pkg_name = payload.name or payload.tier_name
    if pkg_name is not None: pkg.name = pkg_name.strip()
    if payload.tier_slug is not None: pkg.tier_slug = payload.tier_slug.strip()
    if payload.badge_text is not None: pkg.badge_text = payload.badge_text
    if payload.starting_price is not None: pkg.starting_price = payload.starting_price
    if payload.base_price is not None: pkg.base_price = payload.base_price
    if payload.description is not None: pkg.description = payload.description
    
    if payload.services_included is not None:
        pkg.services_included = payload.services_included
    elif payload.features_list is not None:
        pkg.services_included = ", ".join(payload.features_list) if isinstance(payload.features_list, list) else str(payload.features_list)

    if payload.image_url is not None: pkg.image_url = payload.image_url
    if payload.display_order is not None: pkg.display_order = payload.display_order
    if payload.is_published is not None: pkg.is_published = int(payload.is_published)

    db.commit()
    db.refresh(pkg)
    return pkg

@router.patch("/packages/{package_id}/publish")
def admin_toggle_publish_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    pkg = db.query(Package).filter(Package.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found.")

    pkg.is_published = 0 if getattr(pkg, "is_published", 1) == 1 else 1
    db.commit()
    return {"id": pkg.id, "is_published": pkg.is_published}

@router.delete("/packages/{package_id}")
def admin_delete_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    pkg = db.query(Package).filter(Package.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found.")

    db.delete(pkg)
    db.commit()
    return {"success": True, "status": "deleted", "message": f"Package '{pkg.name}' deleted successfully."}

# =========================================================================
# 5. GALLERY MANAGEMENT (CRUD)
# =========================================================================

@router.get("/gallery", response_model=List[GalleryResponse])
def admin_get_gallery(
    media_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    from app.api.gallery import DEFAULT_GALLERY_ITEMS
    count = db.query(GalleryItem).count()
    if count == 0:
        for item_data in DEFAULT_GALLERY_ITEMS:
            db_item = GalleryItem(**item_data)
            db.add(db_item)
        db.commit()

    query = db.query(GalleryItem)
    if media_type:
        query = query.filter(GalleryItem.media_type == media_type.lower())
    if category and category.lower() != "all":
        query = query.filter(GalleryItem.category.ilike(f"%{category.strip()}%"))

    return query.order_by(GalleryItem.display_order.asc(), GalleryItem.id.asc()).all()

@router.post("/gallery", response_model=GalleryResponse)
def admin_create_gallery_item(
    payload: GalleryCreateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    # Determine display order if not provided
    display_order = payload.display_order
    if display_order is None or display_order == 0:
        max_order = db.query(func.max(GalleryItem.display_order)).scalar() or 0
        display_order = max_order + 1

    item = GalleryItem(
        title=payload.title,
        media_type=payload.media_type.lower(),
        src=payload.src.strip(),
        poster_url=payload.poster_url,
        category=payload.category or "Highlights",
        caption=payload.caption,
        display_order=display_order,
        is_published=payload.is_published if payload.is_published is not None else 1
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/gallery/{item_id}", response_model=GalleryResponse)
def admin_update_gallery_item(
    item_id: int,
    payload: GalleryUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found.")

    if payload.title is not None: item.title = payload.title
    if payload.media_type is not None: item.media_type = payload.media_type.lower()
    if payload.src is not None: item.src = payload.src.strip()
    if payload.poster_url is not None: item.poster_url = payload.poster_url
    if payload.category is not None: item.category = payload.category
    if payload.caption is not None: item.caption = payload.caption
    if payload.display_order is not None: item.display_order = payload.display_order
    if payload.is_published is not None: item.is_published = payload.is_published

    db.commit()
    db.refresh(item)
    return item

@router.patch("/gallery/{item_id}/publish")
def admin_toggle_publish_gallery(
    item_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found.")

    item.is_published = 0 if item.is_published == 1 else 1
    db.commit()
    return {"id": item.id, "is_published": item.is_published}

@router.post("/gallery/reorder")
def admin_reorder_gallery(
    payload: GalleryReorderRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    for order, item_id in enumerate(payload.item_ids, start=1):
        db.query(GalleryItem).filter(GalleryItem.id == item_id).update({"display_order": order})
    db.commit()
    return {"success": True, "message": "Gallery items reordered successfully."}

@router.delete("/gallery/{item_id}")
def admin_delete_gallery_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found.")

    db.delete(item)
    db.commit()
    return {"success": True, "message": "Gallery item deleted successfully."}

# =========================================================================
# 6. EVENTS MANAGEMENT (CRUD)
# =========================================================================

@router.get("/events", response_model=List[EventResponse])
def admin_get_events(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    return db.query(EventItem).order_by(EventItem.display_order.asc(), EventItem.id.desc()).all()

@router.post("/events", response_model=EventResponse)
def admin_create_event(
    payload: EventCreateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    event = EventItem(
        title=payload.title.strip(),
        category=payload.category or "Custom Event",
        status=payload.status or "UPCOMING",
        date=payload.date,
        location=payload.location,
        description=payload.description,
        image_url=payload.image_url,
        total_amount=payload.total_amount or 0.0,
        display_order=payload.display_order or 0,
        is_published=payload.is_published if payload.is_published is not None else 1
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.put("/events/{event_id}", response_model=EventResponse)
def admin_update_event(
    event_id: int,
    payload: EventUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    event = db.query(EventItem).filter(EventItem.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    if payload.title is not None: event.title = payload.title.strip()
    if payload.category is not None: event.category = payload.category
    if payload.status is not None: event.status = payload.status
    if payload.date is not None: event.date = payload.date
    if payload.location is not None: event.location = payload.location
    if payload.description is not None: event.description = payload.description
    if payload.image_url is not None: event.image_url = payload.image_url
    if payload.total_amount is not None: event.total_amount = payload.total_amount
    if payload.display_order is not None: event.display_order = payload.display_order
    if payload.is_published is not None: event.is_published = payload.is_published

    db.commit()
    db.refresh(event)
    return event

@router.patch("/events/{event_id}/publish")
def admin_toggle_publish_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    event = db.query(EventItem).filter(EventItem.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    event.is_published = 0 if event.is_published == 1 else 1
    db.commit()
    return {"id": event.id, "is_published": event.is_published}

@router.delete("/events/{event_id}")
def admin_delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    event = db.query(EventItem).filter(EventItem.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    db.delete(event)
    db.commit()
    return {"success": True, "message": f"Event '{event.title}' deleted successfully."}

# =========================================================================
# 7. PAGE CONTENT CMS
# =========================================================================

@router.get("/content/{page_key}")
def admin_get_page_content(
    page_key: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    key_clean = page_key.strip().lower()
    records = db.query(PageContent).filter(PageContent.page_key == key_clean).all()
    out = {}
    for r in records:
        try:
            out[r.section_key] = json.loads(r.content_json)
        except Exception:
            out[r.section_key] = r.content_json
    return out

@router.put("/content/{page_key}")
def admin_save_page_content(
    page_key: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    key_clean = page_key.strip().lower()
    if "section_key" in payload and "content_json" in payload:
        sections = {payload["section_key"]: payload["content_json"]}
    else:
        sections = payload

    for section_key, content_val in sections.items():
        val_str = json.dumps(content_val) if not isinstance(content_val, str) else content_val
        record = db.query(PageContent).filter(
            PageContent.page_key == key_clean,
            PageContent.section_key == section_key
        ).first()
        if record:
            record.content_json = val_str
        else:
            record = PageContent(
                page_key=key_clean,
                section_key=section_key,
                content_json=val_str
            )
            db.add(record)
    db.commit()
    return {"success": True, "message": f"Page content for '{page_key}' saved successfully."}

# =========================================================================
# 8. BOOKINGS MANAGEMENT
# =========================================================================

@router.get("/bookings", response_model=List[BookingResponse])
def get_all_bookings(
    status_filter: Optional[str] = Query(None, alias="status"),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    query = db.query(Booking)
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Booking.status == status_filter.upper())
    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            (Booking.booking_reference.ilike(search_term)) |
            (Booking.full_name.ilike(search_term)) |
            (Booking.email.ilike(search_term)) |
            (Booking.mobile_no.ilike(search_term)) |
            (Booking.district.ilike(search_term)) |
            (Booking.function_category.ilike(search_term))
        )
    bookings = query.order_by(Booking.id.desc()).all()
    return [
        BookingResponse(
            id=b.id,
            booking_reference=b.booking_reference,
            package_tier=b.package_tier,
            full_name=b.full_name,
            mobile_no=b.mobile_no,
            alt_mobile_no=b.alt_mobile_no,
            email=b.email,
            function_category=b.function_category,
            district=b.district,
            place_area=b.place_area,
            full_address=b.full_address,
            pincode=b.pincode,
            from_date=b.from_date,
            to_date=b.to_date,
            from_time=b.from_time,
            to_time=b.to_time,
            duration_days=b.duration_days,
            map_location_url=b.map_location_url,
            selected_needs=b.selected_needs,
            status=b.status,
            total_amount=float(b.total_amount or 0.0),
            created_at=b.created_at.isoformat() if b.created_at else None
        )
        for b in bookings
    ]

@router.get("/bookings/{booking_id}", response_model=BookingResponse)
def get_booking_detail(
    booking_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
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

@router.patch("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    new_status = payload.status.upper()
    if new_status not in ["UPCOMING", "COMPLETED", "CANCELLED"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status. Must be UPCOMING, COMPLETED, or CANCELLED.")
    
    booking.status = new_status
    db.commit()
    db.refresh(booking)
    
    return {
        "success": True,
        "message": f"Booking {booking.booking_reference} status updated to {new_status}",
        "booking_id": booking.id,
        "status": booking.status
    }

# =========================================================================
# 9. USER DIRECTORY & ROLES
# =========================================================================

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    users = db.query(User).order_by(User.id.desc()).all()
    return [
        UserResponse(
            id=u.id,
            username=u.username,
            email=u.email,
            first_name=u.first_name,
            last_name=u.last_name,
            role=u.role,
            is_active=getattr(u, "is_active", 1)
        )
        for u in users
    ]

# =========================================================================
# 10. SUPER ADMIN EXCLUSIVE RBAC ENDPOINTS
# =========================================================================

@router.get("/admins", response_model=List[UserResponse])
def get_all_admins(
    db: Session = Depends(get_db),
    current_super_admin: User = Depends(require_super_admin)
):
    admins = db.query(User).filter(User.role.in_(["ADMIN", "SUPER_ADMIN"])).order_by(User.id.desc()).all()
    return [
        UserResponse(
            id=u.id,
            username=u.username,
            email=u.email,
            first_name=u.first_name,
            last_name=u.last_name,
            role=u.role,
            is_active=getattr(u, "is_active", 1)
        )
        for u in admins
    ]

@router.post("/create-admin", response_model=UserResponse)
def create_admin_account(
    payload: AdminCreateRequest,
    db: Session = Depends(get_db),
    current_super_admin: User = Depends(require_super_admin)
):
    target_role = payload.role.upper() if payload.role else "ADMIN"
    if target_role not in ["ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Can only create ADMIN or SUPER_ADMIN accounts."
        )

    email_clean = payload.email.strip().lower()
    username_clean = payload.username.strip()

    if db.query(User).filter(User.username == username_clean).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken."
        )

    if db.query(User).filter(User.email == email_clean).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    first_n = (payload.firstName or "").strip()
    last_n = (payload.lastName or "").strip()
    full_n = (payload.full_name or "").strip()
    if not full_n and (first_n or last_n):
        full_n = f"{first_n} {last_n}".strip()
    elif full_n and not first_n:
        parts = full_n.split(" ", 1)
        first_n = parts[0]
        last_n = parts[1] if len(parts) > 1 else ""

    new_admin = User(
        name=full_n or username_clean,
        first_name=first_n or username_clean,
        last_name=last_n or "",
        phone=payload.phone_number,
        username=username_clean,
        email=email_clean,
        age=payload.age or 25,
        role=target_role,
        is_active=1,
        password_hash=get_password_hash(payload.password)
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return UserResponse(
        id=new_admin.id,
        username=new_admin.username,
        email=new_admin.email,
        first_name=new_admin.first_name,
        last_name=new_admin.last_name,
        role=new_admin.role,
        is_active=new_admin.is_active
    )

@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    payload: UserRoleUpdateRequest,
    db: Session = Depends(get_db),
    current_super_admin: User = Depends(require_super_admin)
):
    target_role = payload.role.upper()
    if target_role not in ["USER", "ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be USER, ADMIN, or SUPER_ADMIN."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.role == "SUPER_ADMIN" and target_role != "SUPER_ADMIN":
        super_admin_count = db.query(User).filter(
            User.role == "SUPER_ADMIN",
            User.is_active == 1
        ).count()
        if super_admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot demote the only active SUPER_ADMIN in the system."
            )

    user.role = target_role
    db.commit()
    db.refresh(user)

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        is_active=getattr(user, "is_active", 1)
    )

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: UserStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_super_admin: User = Depends(require_super_admin)
):
    if payload.is_active not in [0, 1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="is_active must be 1 (active) or 0 (inactive)."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.id == current_super_admin.id and payload.is_active == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own SUPER_ADMIN account."
        )

    if user.role == "SUPER_ADMIN" and payload.is_active == 0:
        active_super_admins = db.query(User).filter(
            User.role == "SUPER_ADMIN",
            User.is_active == 1
        ).count()
        if active_super_admins <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate the only active SUPER_ADMIN account."
            )

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)

    status_str = "activated" if user.is_active == 1 else "deactivated"
    return {
        "success": True,
        "message": f"User {user.username} has been {status_str}.",
        "user_id": user.id,
        "is_active": user.is_active
    }



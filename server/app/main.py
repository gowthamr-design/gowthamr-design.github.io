import os
import json
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal, sync_database_schema
from app.models.models import User, Package, Service, Booking, OTPVerification, GalleryItem, EventItem, PageContent
from app.core.security import get_password_hash
from app.api.auth import router as auth_router
from app.api.services import router as services_router, DEFAULT_SERVICES
from app.api.packages import router as packages_router, DEFAULT_PACKAGES
from app.api.bookings import router as bookings_router
from app.api.events import router as events_router, DEFAULT_EVENTS
from app.api.gallery import router as gallery_router, DEFAULT_GALLERY_ITEMS
from app.api.content import router as content_router, DEFAULT_PAGE_CONTENTS
from app.api.admin import router as admin_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("banana_brothers")

# Ensure uploads directory exists
UPLOAD_DIR = os.path.abspath("uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create database tables and synchronize columns
sync_database_schema(engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs"
)

# CORS configuration allowing React frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for media uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

from fastapi.responses import RedirectResponse

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        # 1. Seed default Admin account if not existing
        admin_user = db.query(User).filter(
            (User.username == "admin") | (User.email == "admin@bananabrothers.com")
        ).first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@bananabrothers.com",
                name="System Administrator",
                first_name="Admin",
                last_name="Manager",
                age=30,
                role="ADMIN",
                is_active=1,
                password_hash=get_password_hash("Admin@123")
            )
            db.add(admin_user)
            db.commit()
            logger.info("Created default administrator account (username: admin, email: admin@bananabrothers.com)")

        # 1b. Ensure Super Admin account exists
        sa_user = db.query(User).filter(
            (User.username == "bananabrothers") | (User.email == "bananabrothers@gmail.com")
        ).first()
        if not sa_user:
            sa_user = User(
                username="bananabrothers",
                email="bananabrothers@gmail.com",
                name="Banana Brothers Super Admin",
                first_name="Banana",
                last_name="Brothers",
                age=30,
                role="SUPER_ADMIN",
                is_active=1,
                password_hash=get_password_hash("bananabrothers@123")
            )
            db.add(sa_user)
            db.commit()
            logger.info("Created default super admin account (username: bananabrothers)")

        # 2. Seed default services if empty
        if db.query(Service).count() == 0:
            for s in DEFAULT_SERVICES:
                svc = Service(
                    name=s["name"],
                    category=s["category"],
                    description=s["description"],
                    starting_price=s["starting_price"],
                    price_unit=s.get("price_unit", "flat"),
                    image_url=s["image_url"],
                    is_published=1
                )
                db.add(svc)
            db.commit()
            logger.info("Seeded default catalog services into MySQL database")

        # 3. Seed default packages if empty
        if db.query(Package).count() == 0:
            for p in DEFAULT_PACKAGES:
                pkg = Package(
                    name=p["name"],
                    tier_slug=p["tier_slug"],
                    badge_text=p["badge_text"],
                    starting_price=p["starting_price"],
                    base_price=p["base_price"],
                    description=p["description"],
                    image_url=p["image_url"],
                    is_published=1
                )
                db.add(pkg)
            db.commit()
            logger.info("Seeded default package tiers into MySQL database")

        # 4. Seed default gallery items if empty
        if db.query(GalleryItem).count() == 0:
            for idx, g in enumerate(DEFAULT_GALLERY_ITEMS, start=1):
                item = GalleryItem(
                    title=g.get("title", f"Gallery Media #{idx}"),
                    media_type=g["media_type"],
                    src=g["src"],
                    poster_url=g.get("poster_url"),
                    category=g.get("category", "Highlights"),
                    display_order=g.get("display_order", idx),
                    is_published=1
                )
                db.add(item)
            db.commit()
            logger.info("Seeded default gallery items into MySQL database")

        # 5. Seed default showcase events if empty
        if db.query(EventItem).count() == 0:
            for idx, ev in enumerate(DEFAULT_EVENTS, start=1):
                event = EventItem(
                    title=ev["title"],
                    category=ev.get("category", "Custom Event"),
                    status=ev.get("status", "UPCOMING"),
                    date=ev.get("date"),
                    location=ev.get("location"),
                    description=ev.get("description"),
                    image_url=ev.get("image_url"),
                    total_amount=ev.get("total_amount", 0.0),
                    display_order=idx,
                    is_published=1
                )
                db.add(event)
            db.commit()
            logger.info("Seeded default event showcases into MySQL database")

        # 6. Seed default page content settings if empty
        if db.query(PageContent).count() == 0:
            for page_key, sections in DEFAULT_PAGE_CONTENTS.items():
                for section_key, content_val in sections.items():
                    val_str = json.dumps(content_val)
                    pc = PageContent(
                        page_key=page_key,
                        section_key=section_key,
                        content_json=val_str
                    )
                    db.add(pc)
            db.commit()
            logger.info("Seeded default CMS page content settings into MySQL database")

    except Exception as e:
        logger.error(f"Startup seeding notice: {e}")
        db.rollback()
    finally:
        db.close()

# Include API v1 routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(services_router, prefix=settings.API_V1_STR)
app.include_router(packages_router, prefix=settings.API_V1_STR)
app.include_router(bookings_router, prefix=settings.API_V1_STR)
app.include_router(events_router, prefix=settings.API_V1_STR)
app.include_router(gallery_router, prefix=settings.API_V1_STR)
app.include_router(content_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to Banana Brothers Events API",
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "healthy"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/docs", include_in_schema=False)
def docs_redirect():
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")



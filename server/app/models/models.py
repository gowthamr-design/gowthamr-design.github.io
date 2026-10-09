from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=True)
    username = Column(String(100), unique=True, nullable=True, index=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    email = Column(String(120), unique=True, nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    role = Column(String(50), default="USER", nullable=False)
    is_active = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings = relationship("Booking", back_populates="user")

class Package(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    services_included = Column(Text, nullable=True)
    total_price = Column(Numeric(10, 2), default=0.0)
    starting_price = Column(Numeric(12, 2), nullable=True)
    base_price = Column(Numeric(12, 2), nullable=True)
    tier_slug = Column(String(50), nullable=True)
    badge_text = Column(String(50), nullable=True)
    image_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    is_published = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)
    base_price = Column(Numeric(10, 2), nullable=True)
    starting_price = Column(Numeric(12, 2), nullable=True)
    price_unit = Column(String(50), default="flat")
    image_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    is_published = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(50), unique=True, nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    package_tier = Column(String(50), nullable=True)
    full_name = Column(String(150), nullable=True)
    mobile_no = Column(String(20), nullable=True)
    alt_mobile_no = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    function_category = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    place_area = Column(String(150), nullable=True)
    full_address = Column(Text, nullable=True)
    pincode = Column(String(10), nullable=True)
    from_date = Column(String(50), nullable=True)
    to_date = Column(String(50), nullable=True)
    from_time = Column(String(20), nullable=True)
    to_time = Column(String(20), nullable=True)
    duration_days = Column(Integer, default=1)
    map_location_url = Column(Text, nullable=True)
    selected_needs = Column(Text, nullable=True)  # Comma-separated or JSON list
    total_amount = Column(Numeric(12, 2), nullable=True)
    status = Column(String(50), default="UPCOMING")
    
    # Backward-compatible fields
    event_type = Column(String(100), nullable=True)
    date = Column(String(50), nullable=True)
    guests = Column(Integer, default=100)
    location = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="bookings")

class OTPVerification(Base):
    __tablename__ = "password_reset_otps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    email = Column(String(150), nullable=True)
    otp_code = Column(String(10), nullable=False)
    is_used = Column(Integer, default=0) # Using Integer (0/1) since some DBs lack Boolean
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=True)
    media_type = Column(String(50), default="image", nullable=False) # "image" or "video"
    src = Column(String(500), nullable=False)
    poster_url = Column(String(500), nullable=True)
    category = Column(String(100), default="Highlights", nullable=True)
    caption = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)
    is_published = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EventItem(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100), nullable=True)
    status = Column(String(50), default="UPCOMING", nullable=False)
    date = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    total_amount = Column(Numeric(12, 2), default=0.0)
    display_order = Column(Integer, default=0)
    is_published = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PageContent(Base):
    __tablename__ = "page_contents"

    id = Column(Integer, primary_key=True, index=True)
    page_key = Column(String(100), nullable=False, index=True) # e.g. "home", "about", "contact"
    section_key = Column(String(100), nullable=False, index=True) # e.g. "hero", "metrics", "testimonials"
    content_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


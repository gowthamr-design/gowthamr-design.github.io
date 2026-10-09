from typing import List, Optional, Any, Union
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserRegister(BaseModel):
    firstName: str
    lastName: str
    username: str
    email: EmailStr
    age: int
    password: str
    confirmPassword: Optional[str] = None
    otp: Optional[str] = None
    role: Optional[str] = "USER"

class UserLogin(BaseModel):
    username: str  # Can be username or email
    password: str

class UserResponse(BaseModel):
    id: int
    username: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "USER"
    is_active: int = 1

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# RBAC Management Schemas
class AdminCreateRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    username: str
    email: EmailStr
    age: Optional[int] = 25
    password: str
    role: Optional[str] = "ADMIN"

class UserRoleUpdateRequest(BaseModel):
    role: str  # USER, ADMIN, SUPER_ADMIN

class UserStatusUpdateRequest(BaseModel):
    is_active: int  # 1 for active, 0 for inactive

# Catalog & CMS Schemas
class ServiceCreateRequest(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    starting_price: float
    base_price: Optional[float] = None
    price_unit: Optional[str] = "flat"
    image_url: Optional[str] = None
    display_order: Optional[int] = 0
    is_published: Optional[int] = 1

class ServiceUpdateRequest(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    starting_price: Optional[float] = None
    base_price: Optional[float] = None
    price_unit: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_published: Optional[int] = None

class ServiceResponse(BaseModel):
    id: int
    name: str
    category: Optional[str] = "Weddings"
    description: Optional[str] = None
    starting_price: Optional[float] = 0.0
    base_price: Optional[float] = None
    price_unit: Optional[str] = "flat"
    image_url: Optional[str] = None
    display_order: Optional[int] = 0
    is_published: Optional[int] = 1

    class Config:
        from_attributes = True

class PackageCreateRequest(BaseModel):
    name: Optional[str] = None
    tier_name: Optional[str] = None
    tier_slug: Optional[str] = None
    badge_text: Optional[str] = None
    starting_price: float
    base_price: Optional[float] = None
    description: Optional[str] = None
    features_list: Optional[Union[List[str], str]] = None
    services_included: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = 0
    is_published: Optional[Union[int, bool]] = 1

class PackageUpdateRequest(BaseModel):
    name: Optional[str] = None
    tier_name: Optional[str] = None
    tier_slug: Optional[str] = None
    badge_text: Optional[str] = None
    starting_price: Optional[float] = None
    base_price: Optional[float] = None
    description: Optional[str] = None
    features_list: Optional[Union[List[str], str]] = None
    services_included: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_published: Optional[Union[int, bool]] = None

class PackageResponse(BaseModel):
    id: int
    name: str
    tier_name: Optional[str] = None
    tier_slug: Optional[str] = None
    badge_text: Optional[str] = None
    starting_price: Optional[float] = 0.0
    base_price: Optional[float] = None
    description: Optional[str] = None
    features_list: Optional[Union[List[str], str]] = None
    services_included: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = 0
    is_published: Optional[int] = 1

    class Config:
        from_attributes = True

# Gallery Schemas
class GalleryCreateRequest(BaseModel):
    title: Optional[str] = None
    media_type: str = "image"  # "image" or "video"
    src: str
    poster_url: Optional[str] = None
    category: Optional[str] = "Highlights"
    caption: Optional[str] = None
    display_order: Optional[int] = 0
    is_published: Optional[int] = 1

class GalleryUpdateRequest(BaseModel):
    title: Optional[str] = None
    media_type: Optional[str] = None
    src: Optional[str] = None
    poster_url: Optional[str] = None
    category: Optional[str] = None
    caption: Optional[str] = None
    display_order: Optional[int] = None
    is_published: Optional[int] = None

class GalleryReorderRequest(BaseModel):
    item_ids: List[int]

class GalleryResponse(BaseModel):
    id: int
    title: Optional[str] = None
    media_type: str = "image"
    src: str
    poster_url: Optional[str] = None
    category: Optional[str] = "Highlights"
    caption: Optional[str] = None
    display_order: Optional[int] = 0
    is_published: Optional[int] = 1

    class Config:
        from_attributes = True

# Event Showcase Schemas
class EventCreateRequest(BaseModel):
    title: str
    category: Optional[str] = "Custom Event"
    status: Optional[str] = "UPCOMING"
    date: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    total_amount: Optional[float] = 0.0
    display_order: Optional[int] = 0
    is_published: Optional[int] = 1

class EventUpdateRequest(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    total_amount: Optional[float] = None
    display_order: Optional[int] = None
    is_published: Optional[int] = None

class EventResponse(BaseModel):
    id: int
    title: str
    category: Optional[str] = None
    status: str = "UPCOMING"
    date: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    total_amount: Optional[float] = 0.0
    display_order: Optional[int] = 0
    is_published: Optional[int] = 1

    class Config:
        from_attributes = True

# Page Content CMS Schemas
class PageContentSaveRequest(BaseModel):
    page_key: str
    section_key: str
    content_json: str

class PageContentResponse(BaseModel):
    id: int
    page_key: str
    section_key: str
    content_json: str
    updated_at: Optional[Any] = None

    class Config:
        from_attributes = True

# Booking Schemas
class BookingCalculateRequest(BaseModel):
    package_tier: str  # "high", "medium", "low"
    needs_values: List[int] = []
    from_date: Optional[str] = None
    to_date: Optional[str] = None

class BookingCalculateResponse(BaseModel):
    duration_days: int
    base_amount: float
    add_ons_total: float
    total_estimated_amount: float
    formatted_total: str

class BookingCreateRequest(BaseModel):
    package_tier: str
    fullName: str
    mobileNo: str
    altMobileNo: Optional[str] = None
    emailAddr: EmailStr
    functionType: str
    needs: List[str] = []
    districtSelect: str
    place: str
    fullAddress: str
    pincode: str
    fromDate: str
    toDate: str
    fromTime: str
    toTime: str
    mapLocation: Optional[str] = None
    estimatedAmount: Optional[float] = None

class BookingResponse(BaseModel):
    id: int
    booking_reference: Optional[str] = None
    package_tier: Optional[str] = None
    full_name: Optional[str] = None
    mobile_no: Optional[str] = None
    alt_mobile_no: Optional[str] = None
    email: Optional[str] = None
    function_category: Optional[str] = None
    district: Optional[str] = None
    place_area: Optional[str] = None
    full_address: Optional[str] = None
    pincode: Optional[str] = None
    from_date: Optional[str] = None
    to_date: Optional[str] = None
    from_time: Optional[str] = None
    to_time: Optional[str] = None
    duration_days: Optional[int] = 1
    map_location_url: Optional[str] = None
    selected_needs: Optional[str] = None
    status: str = "UPCOMING"
    total_amount: Optional[float] = 0.0
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True

class StatusUpdateRequest(BaseModel):
    status: str  # UPCOMING, COMPLETED, CANCELLED

class AdminStatsResponse(BaseModel):
    total_bookings: int
    total_revenue: float
    upcoming_bookings: int
    completed_bookings: int
    cancelled_bookings: int
    total_customers: int

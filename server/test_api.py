import sys
import unittest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.models import User, Booking
from app.core.security import get_password_hash

class TestBananaBrothersPlatformRBAC(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        
        # Ensure default test users exist in DB
        db = SessionLocal()
        try:
            # 1. Super Admin
            super_admin = db.query(User).filter(User.username == "test_superadmin").first()
            if not super_admin:
                super_admin = User(
                    username="test_superadmin",
                    email="test_superadmin@bananabrothers.com",
                    password_hash=get_password_hash("SuperAdmin@123"),
                    name="Test Super Administrator",
                    role="SUPER_ADMIN",
                    is_active=1
                )
                db.add(super_admin)
            else:
                super_admin.role = "SUPER_ADMIN"
                super_admin.is_active = 1

            # 2. Regular Admin
            admin = db.query(User).filter(User.username == "test_admin").first()
            if not admin:
                admin = User(
                    username="test_admin",
                    email="test_admin@bananabrothers.com",
                    password_hash=get_password_hash("Admin@123"),
                    name="Test Operations Admin",
                    role="ADMIN",
                    is_active=1
                )
                db.add(admin)
            else:
                admin.role = "ADMIN"
                admin.is_active = 1

            # 3. Regular User A
            user_a = db.query(User).filter(User.username == "test_user_a").first()
            if not user_a:
                user_a = User(
                    username="test_user_a",
                    email="test_user_a@example.com",
                    password_hash=get_password_hash("UserA@123"),
                    name="Customer User A",
                    role="USER",
                    is_active=1
                )
                db.add(user_a)
            else:
                user_a.role = "USER"
                user_a.is_active = 1

            # 4. Regular User B
            user_b = db.query(User).filter(User.username == "test_user_b").first()
            if not user_b:
                user_b = User(
                    username="test_user_b",
                    email="test_user_b@example.com",
                    password_hash=get_password_hash("UserB@123"),
                    name="Customer User B",
                    role="USER",
                    is_active=1
                )
                db.add(user_b)
            else:
                user_b.role = "USER"
                user_b.is_active = 1

            db.commit()
        finally:
            db.close()

    def test_01_health_and_root(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json(), {"status": "ok"})

        res_root = self.client.get("/")
        self.assertEqual(res_root.status_code, 200)
        self.assertEqual(res_root.json()["status"], "healthy")

    def test_02_services_and_packages_catalog(self):
        res = self.client.get("/api/v1/services")
        self.assertEqual(res.status_code, 200)
        services = res.json()
        self.assertGreaterEqual(len(services), 12)

        res_filtered = self.client.get("/api/v1/services?category=Weddings")
        self.assertEqual(res_filtered.status_code, 200)
        for s in res_filtered.json():
            self.assertEqual(s["category"], "Weddings")

        res_pkg = self.client.get("/api/v1/packages")
        self.assertEqual(res_pkg.status_code, 200)
        packages = res_pkg.json()
        self.assertGreaterEqual(len(packages), 3)

    def test_03_booking_calculation(self):
        calc_payload = {
            "package_tier": "high",
            "needs_values": [40000, 20000],
            "from_date": "2026-11-10",
            "to_date": "2026-11-10"
        }
        res = self.client.post("/api/v1/bookings/calculate", json=calc_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["duration_days"], 1)
        self.assertEqual(data["base_amount"], 150000.0)
        self.assertEqual(data["total_estimated_amount"], 210000.0)

    def test_04_public_registration_prevents_privilege_escalation(self):
        # Attempt to register with elevated role 'SUPER_ADMIN' in payload
        unique_suffix = uuid.uuid4().hex[:6]
        test_email = f"hacker_{unique_suffix}@example.com"
        
        # Seed verified OTP for registration
        from datetime import datetime, timedelta
        from app.models.models import OTPVerification
        db = SessionLocal()
        try:
            otp_record = OTPVerification(
                email=test_email,
                otp_code="999888",
                expires_at=datetime.utcnow() + timedelta(minutes=10),
                is_used=1
            )
            db.add(otp_record)
            db.commit()
        finally:
            db.close()

        reg_payload = {
            "firstName": "Hacker",
            "lastName": "Attempt",
            "username": f"hacker_{unique_suffix}",
            "email": test_email,
            "age": 25,
            "password": "Password@123",
            "confirmPassword": "Password@123",
            "otp": "999888",
            "role": "SUPER_ADMIN"  # Attempted privilege escalation
        }
        res = self.client.post("/api/v1/auth/register", json=reg_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        # Role must be strictly forced to 'USER' server-side
        self.assertEqual(data["user"]["role"], "USER")

    def test_05_unauthenticated_requests_rejected(self):
        # Admin endpoints must reject unauthenticated requests with 401
        res = self.client.get("/api/v1/admin/stats")
        self.assertEqual(res.status_code, 401)

        res2 = self.client.get("/api/v1/admin/bookings")
        self.assertEqual(res2.status_code, 401)

        # Invalid or malformed token must return 401
        res3 = self.client.get("/api/v1/admin/stats", headers={"Authorization": "Bearer invalid_garbage_token"})
        self.assertEqual(res3.status_code, 401)

    def test_06_user_role_forbidden_from_admin_endpoints(self):
        # Login as User A
        login_res = self.client.post("/api/v1/auth/login", json={
            "username": "test_user_a",
            "password": "UserA@123"
        })
        self.assertEqual(login_res.status_code, 200)
        user_token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {user_token}"}

        # User profile succeeds
        me_res = self.client.get("/api/v1/auth/me", headers=headers)
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["role"], "USER")

        # Admin stats forbidden (403)
        res_stats = self.client.get("/api/v1/admin/stats", headers=headers)
        self.assertEqual(res_stats.status_code, 403)

        # Admin bookings list forbidden (403)
        res_bookings = self.client.get("/api/v1/admin/bookings", headers=headers)
        self.assertEqual(res_bookings.status_code, 403)

        # Admin users directory forbidden (403)
        res_users = self.client.get("/api/v1/admin/users", headers=headers)
        self.assertEqual(res_users.status_code, 403)

        # Admin team forbidden (403)
        res_admins = self.client.get("/api/v1/admin/admins", headers=headers)
        self.assertEqual(res_admins.status_code, 403)

        # Create admin forbidden (403)
        res_create = self.client.post("/api/v1/admin/create-admin", json={
            "username": "fake_admin",
            "email": "fake@bananabrothers.com",
            "password": "Password@123"
        }, headers=headers)
        self.assertEqual(res_create.status_code, 403)

    def test_07_admin_role_permissions_and_super_admin_boundaries(self):
        # Login as Admin
        admin_login = self.client.post("/api/v1/auth/login", json={
            "username": "test_admin",
            "password": "Admin@123"
        })
        self.assertEqual(admin_login.status_code, 200)
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 1. Admin can access stats (200)
        stats_res = self.client.get("/api/v1/admin/stats", headers=admin_headers)
        self.assertEqual(stats_res.status_code, 200)
        self.assertIn("total_bookings", stats_res.json())

        # 2. Admin can access all bookings (200)
        bookings_res = self.client.get("/api/v1/admin/bookings", headers=admin_headers)
        self.assertEqual(bookings_res.status_code, 200)

        # 3. Admin can view users list (200)
        users_res = self.client.get("/api/v1/admin/users", headers=admin_headers)
        self.assertEqual(users_res.status_code, 200)

        # 4. Admin CANNOT view admin management list (403 Forbidden)
        admins_res = self.client.get("/api/v1/admin/admins", headers=admin_headers)
        self.assertEqual(admins_res.status_code, 403)

        # 5. Admin CANNOT create new admin accounts (403 Forbidden)
        create_res = self.client.post("/api/v1/admin/create-admin", json={
            "username": "illegal_admin",
            "email": "illegal@bananabrothers.com",
            "password": "Password@123"
        }, headers=admin_headers)
        self.assertEqual(create_res.status_code, 403)

        # 6. Admin CANNOT change user roles (403 Forbidden)
        role_res = self.client.patch("/api/v1/admin/users/1/role", json={"role": "SUPER_ADMIN"}, headers=admin_headers)
        self.assertEqual(role_res.status_code, 403)

        # 7. Admin CANNOT deactivate user accounts (403 Forbidden)
        status_res = self.client.patch("/api/v1/admin/users/1/status", json={"is_active": 0}, headers=admin_headers)
        self.assertEqual(status_res.status_code, 403)

    def test_08_super_admin_full_privileges(self):
        # Login as Super Admin
        sa_login = self.client.post("/api/v1/auth/login", json={
            "username": "test_superadmin",
            "password": "SuperAdmin@123"
        })
        self.assertEqual(sa_login.status_code, 200)
        sa_token = sa_login.json()["access_token"]
        sa_headers = {"Authorization": f"Bearer {sa_token}"}
        self.assertEqual(sa_login.json()["user"]["role"], "SUPER_ADMIN")

        # 1. Super Admin can view admins list
        admins_res = self.client.get("/api/v1/admin/admins", headers=sa_headers)
        self.assertEqual(admins_res.status_code, 200)
        self.assertTrue(any(a["username"] == "test_superadmin" for a in admins_res.json()))

        # 2. Super Admin provisions a new Admin account
        new_admin_username = f"manager_{uuid.uuid4().hex[:6]}"
        create_admin_payload = {
            "username": new_admin_username,
            "email": f"{new_admin_username}@bananabrothers.com",
            "password": "ManagerPass@123",
            "full_name": "Regional Event Manager",
            "role": "ADMIN"
        }
        create_res = self.client.post("/api/v1/admin/create-admin", json=create_admin_payload, headers=sa_headers)
        self.assertEqual(create_res.status_code, 200)
        self.assertEqual(create_res.json()["role"], "ADMIN")

        # 3. Verify newly created Admin can log in
        new_admin_login = self.client.post("/api/v1/auth/login", json={
            "username": new_admin_username,
            "password": "ManagerPass@123"
        })
        self.assertEqual(new_admin_login.status_code, 200)
        self.assertEqual(new_admin_login.json()["user"]["role"], "ADMIN")

        # 4. Super Admin changes user role
        users = self.client.get("/api/v1/admin/users", headers=sa_headers).json()
        target_user = next((u for u in users if u["username"] == "test_user_a"), None)
        self.assertIsNotNone(target_user)

        # Promote User A to ADMIN
        promote_res = self.client.patch(
            f"/api/v1/admin/users/{target_user['id']}/role",
            json={"role": "ADMIN"},
            headers=sa_headers
        )
        self.assertEqual(promote_res.status_code, 200)
        self.assertEqual(promote_res.json()["role"], "ADMIN")

        # Demote User A back to USER
        demote_res = self.client.patch(
            f"/api/v1/admin/users/{target_user['id']}/role",
            json={"role": "USER"},
            headers=sa_headers
        )
        self.assertEqual(demote_res.status_code, 200)
        self.assertEqual(demote_res.json()["role"], "USER")

        # 5. Super Admin deactivates and reactivates an account
        deactivate_res = self.client.patch(
            f"/api/v1/admin/users/{target_user['id']}/status",
            json={"is_active": 0},
            headers=sa_headers
        )
        self.assertEqual(deactivate_res.status_code, 200)
        self.assertEqual(deactivate_res.json()["is_active"], 0)

        # Inactive user cannot log in (403 Forbidden)
        inactive_login = self.client.post("/api/v1/auth/login", json={
            "username": "test_user_a",
            "password": "UserA@123"
        })
        self.assertEqual(inactive_login.status_code, 403)

        # Reactivate User A
        reactivate_res = self.client.patch(
            f"/api/v1/admin/users/{target_user['id']}/status",
            json={"is_active": 1},
            headers=sa_headers
        )
        self.assertEqual(reactivate_res.status_code, 200)
        self.assertEqual(reactivate_res.json()["is_active"], 1)

    def test_09_booking_ownership_protection(self):
        # 1. Unauthenticated booking creation MUST be rejected with 401 Unauthorized
        booking_payload = {
            "package_tier": "medium",
            "fullName": "Customer User A",
            "mobileNo": "9876543210",
            "emailAddr": "test_user_a@example.com",
            "functionType": "Birthday Celebration",
            "needs": ["Food", "Decoration"],
            "districtSelect": "Chennai",
            "place": "Anna Nagar",
            "fullAddress": "Plot 10, 2nd Avenue, Anna Nagar",
            "pincode": "600040",
            "fromDate": "2026-12-20",
            "toDate": "2026-12-20",
            "fromTime": "10:00",
            "toTime": "18:00"
        }
        res_anon_create = self.client.post("/api/v1/bookings", json=booking_payload)
        self.assertEqual(res_anon_create.status_code, 401)

        # 2. Login User A
        user_a_tok = self.client.post("/api/v1/auth/login", json={
            "username": "test_user_a",
            "password": "UserA@123"
        }).json()["access_token"]
        headers_a = {"Authorization": f"Bearer {user_a_tok}"}

        # 3. Authenticated booking creation succeeds (200)
        res = self.client.post("/api/v1/bookings", json=booking_payload, headers=headers_a)
        self.assertEqual(res.status_code, 200)
        booking_id = res.json()["booking_id"]
        booking_ref = res.json()["booking_reference"]

        # User A can view their own booking
        res_a = self.client.get(f"/api/v1/bookings/{booking_id}", headers=headers_a)
        self.assertEqual(res_a.status_code, 200)
        self.assertEqual(res_a.json()["id"], booking_id)

        # 2. Login User B
        user_b_tok = self.client.post("/api/v1/auth/login", json={
            "username": "test_user_b",
            "password": "UserB@123"
        }).json()["access_token"]
        headers_b = {"Authorization": f"Bearer {user_b_tok}"}

        # User B attempts to view User A's booking by ID -> MUST return 403 Forbidden
        res_b = self.client.get(f"/api/v1/bookings/{booking_id}", headers=headers_b)
        self.assertEqual(res_b.status_code, 403)

        # 3. Unauthenticated request with numeric ID -> MUST return 401 Unauthorized
        res_anon = self.client.get(f"/api/v1/bookings/{booking_id}")
        self.assertEqual(res_anon.status_code, 401)

        # 4. Anyone with exact booking reference can track status (public tracking)
        res_ref = self.client.get(f"/api/v1/bookings/{booking_ref}")
        self.assertEqual(res_ref.status_code, 200)
        self.assertEqual(res_ref.json()["booking_reference"], booking_ref)

        # 5. Admin can inspect the booking
        admin_tok = self.client.post("/api/v1/auth/login", json={
            "username": "test_admin",
            "password": "Admin@123"
        }).json()["access_token"]
        res_admin = self.client.get(f"/api/v1/bookings/{booking_id}", headers={"Authorization": f"Bearer {admin_tok}"})
        self.assertEqual(res_admin.status_code, 200)

    def test_10_services_cms_crud_and_publishing(self):
        admin_tok = self.client.post("/api/v1/auth/login", json={
            "username": "test_admin",
            "password": "Admin@123"
        }).json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_tok}"}

        # 1. Create Service
        create_payload = {
            "name": "Luxury LED Kinetic Stage Rig",
            "description": "Custom programmable kinetic beam ball grid for royal stages.",
            "category": "Stage Production",
            "starting_price": 75000.0,
            "price_unit": "day",
            "image_url": "/f214bc94-72b6-4202-9a01-2cece637fc3d.png",
            "display_order": 99,
            "is_published": True
        }
        res_create = self.client.post("/api/v1/admin/services", json=create_payload, headers=admin_headers)
        self.assertEqual(res_create.status_code, 200)
        svc_id = res_create.json()["id"]
        self.assertEqual(res_create.json()["name"], "Luxury LED Kinetic Stage Rig")

        # 2. Read Service from Admin list
        res_list = self.client.get("/api/v1/admin/services", headers=admin_headers)
        self.assertEqual(res_list.status_code, 200)
        self.assertTrue(any(s["id"] == svc_id for s in res_list.json()))

        # 3. Update Service
        update_payload = {
            "name": "Royal Imperial Kinetic Stage Rig",
            "starting_price": 85000.0
        }
        res_update = self.client.put(f"/api/v1/admin/services/{svc_id}", json=update_payload, headers=admin_headers)
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(res_update.json()["name"], "Royal Imperial Kinetic Stage Rig")
        self.assertEqual(res_update.json()["starting_price"], 85000.0)

        # 4. Toggle Publish (Unpublish)
        res_pub = self.client.patch(f"/api/v1/admin/services/{svc_id}/publish", json={"is_published": False}, headers=admin_headers)
        self.assertEqual(res_pub.status_code, 200)
        self.assertEqual(res_pub.json()["is_published"], False)

        # Verify not in public list
        pub_services = self.client.get("/api/v1/services").json()
        self.assertFalse(any(s["id"] == svc_id for s in pub_services))

        # Re-publish
        self.client.patch(f"/api/v1/admin/services/{svc_id}/publish", json={"is_published": True}, headers=admin_headers)
        pub_services_again = self.client.get("/api/v1/services").json()
        self.assertTrue(any(s["id"] == svc_id for s in pub_services_again))

        # 5. Delete Service
        res_del = self.client.delete(f"/api/v1/admin/services/{svc_id}", headers=admin_headers)
        self.assertEqual(res_del.status_code, 200)
        self.assertEqual(res_del.json()["status"], "deleted")

    def test_11_packages_cms_crud_and_publishing(self):
        admin_tok = self.client.post("/api/v1/auth/login", json={
            "username": "test_admin",
            "password": "Admin@123"
        }).json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_tok}"}

        # 1. Create Package
        pkg_payload = {
            "tier_name": "Platinum Elite Tier",
            "tier_slug": "platinum-elite",
            "badge_text": "VIP Exclusive",
            "starting_price": 350000.0,
            "description": "The quintessential luxury bespoke experience.",
            "features_list": ["Helicopter Groom Entry", "Celebrity Emcee", "360 Panoramic LED"],
            "image_url": "/bg.png",
            "display_order": 10,
            "is_published": True
        }
        res_create = self.client.post("/api/v1/admin/packages", json=pkg_payload, headers=admin_headers)
        self.assertEqual(res_create.status_code, 200)
        pkg_id = res_create.json()["id"]
        self.assertEqual(res_create.json()["tier_slug"], "platinum-elite")

        # 2. Read Package by Slug publicly
        res_get_slug = self.client.get("/api/v1/packages/platinum-elite")
        self.assertEqual(res_get_slug.status_code, 200)
        self.assertEqual(res_get_slug.json()["tier_name"], "Platinum Elite Tier")

        # 3. Update Package
        res_update = self.client.put(f"/api/v1/admin/packages/{pkg_id}", json={
            "starting_price": 400000.0,
            "badge_text": "Royal Crown Signature"
        }, headers=admin_headers)
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(res_update.json()["starting_price"], 400000.0)

        # 4. Toggle Publish
        res_pub = self.client.patch(f"/api/v1/admin/packages/{pkg_id}/publish", json={"is_published": False}, headers=admin_headers)
        self.assertEqual(res_pub.status_code, 200)
        self.assertEqual(res_pub.json()["is_published"], False)

        # 5. Delete Package
        res_del = self.client.delete(f"/api/v1/admin/packages/{pkg_id}", headers=admin_headers)
        self.assertEqual(res_del.status_code, 200)
        self.assertEqual(res_del.json()["status"], "deleted")

    def test_12_gallery_cms_crud_and_filtering(self):
        admin_tok = self.client.post("/api/v1/auth/login", json={
            "username": "test_admin",
            "password": "Admin@123"
        }).json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_tok}"}

        # 1. Create Gallery Item
        gallery_payload = {
            "title": "Grand Mandap Celestial Night",
            "media_type": "image",
            "src": "/f7cabbcd-e205-4b02-9924-97ccfe667442.png",
            "category": "WEDDINGS",
            "caption": "Ethereal night lighting mandap",
            "display_order": 1,
            "is_published": True
        }
        res_create = self.client.post("/api/v1/admin/gallery", json=gallery_payload, headers=admin_headers)
        self.assertEqual(res_create.status_code, 200)
        item_id = res_create.json()["id"]

        # 2. Read public gallery
        res_pub = self.client.get("/api/v1/gallery?media_type=image")
        self.assertEqual(res_pub.status_code, 200)
        self.assertTrue(any(g["id"] == item_id for g in res_pub.json()))

        # 3. Update Gallery Item
        res_update = self.client.put(f"/api/v1/admin/gallery/{item_id}", json={
            "title": "Celestial Grand Royal Mandap"
        }, headers=admin_headers)
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(res_update.json()["title"], "Celestial Grand Royal Mandap")

        # 4. Toggle Publish status
        res_pub_toggle = self.client.patch(f"/api/v1/admin/gallery/{item_id}/publish", headers=admin_headers)
        self.assertEqual(res_pub_toggle.status_code, 200)
        self.assertEqual(res_pub_toggle.json()["is_published"], 0)

        # 5. Reorder items
        res_reorder = self.client.post("/api/v1/admin/gallery/reorder", json={"item_ids": [item_id]}, headers=admin_headers)
        self.assertEqual(res_reorder.status_code, 200)

        # 6. Delete Gallery Item
        res_del = self.client.delete(f"/api/v1/admin/gallery/{item_id}", headers=admin_headers)
        self.assertEqual(res_del.status_code, 200)

    def test_13_events_showcase_crud(self):
        admin_tok = self.client.post("/api/v1/auth/login", json={
            "username": "test_admin",
            "password": "Admin@123"
        }).json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_tok}"}

        # 1. Create Showcase Event
        event_payload = {
            "title": "Leela Palace Golden Reception",
            "category": "Royal Wedding",
            "status": "COMPLETED",
            "date": "2026-04-10",
            "location": "Leela Palace, Chennai",
            "description": "A 1,200 guest majestic reception with live symphony.",
            "image_url": "/bg1.png",
            "total_amount": 550000.0,
            "display_order": 1,
            "is_published": True
        }
        res_create = self.client.post("/api/v1/admin/events", json=event_payload, headers=admin_headers)
        self.assertEqual(res_create.status_code, 200)
        evt_id = res_create.json()["id"]

        # 2. Read Admin Events
        res_list = self.client.get("/api/v1/admin/events", headers=admin_headers)
        self.assertEqual(res_list.status_code, 200)
        self.assertTrue(any(e["id"] == evt_id for e in res_list.json()))

        # 3. Update Event
        res_update = self.client.put(f"/api/v1/admin/events/{evt_id}", json={
            "title": "The Leela Palace Royal Symphony Reception"
        }, headers=admin_headers)
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(res_update.json()["title"], "The Leela Palace Royal Symphony Reception")

        # 4. Delete Event
        res_del = self.client.delete(f"/api/v1/admin/events/{evt_id}", headers=admin_headers)
        self.assertEqual(res_del.status_code, 200)

    def test_14_page_content_cms_persistence(self):
        admin_tok = self.client.post("/api/v1/auth/login", json={
            "username": "test_admin",
            "password": "Admin@123"
        }).json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_tok}"}

        # Save Home Hero section content
        hero_content = {
            "tag": "Banana Brothers Royal CMS",
            "title": "Unrivaled Event Excellence",
            "lead": "Crafting extraordinary memories with bespoke precision.",
            "primaryBtnText": "View Packages",
            "primaryBtnLink": "/packages"
        }
        res_save = self.client.put("/api/v1/admin/content/home", json={
            "page_key": "home",
            "section_key": "hero",
            "content_json": hero_content
        }, headers=admin_headers)
        self.assertEqual(res_save.status_code, 200)

        # Retrieve public content
        res_pub_content = self.client.get("/api/v1/content/home")
        self.assertEqual(res_pub_content.status_code, 200)
        self.assertEqual(res_pub_content.json()["hero"]["tag"], "Banana Brothers Royal CMS")

    def test_15_media_upload_endpoint(self):
        admin_tok = self.client.post("/api/v1/auth/login", json={
            "username": "test_admin",
            "password": "Admin@123"
        }).json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_tok}"}

        # Test uploading a mock PNG image
        fake_png_data = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        files = {"file": ("test_banner.png", fake_png_data, "image/png")}
        res_upload = self.client.post("/api/v1/admin/upload-media", files=files, headers=admin_headers)
        self.assertEqual(res_upload.status_code, 200)
        self.assertIn("url", res_upload.json())
        self.assertTrue(res_upload.json()["url"].startswith("/uploads/"))

    def test_16_rbac_enforcement_on_all_cms_endpoints(self):
        user_tok = self.client.post("/api/v1/auth/login", json={
            "username": "test_user_a",
            "password": "UserA@123"
        }).json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_tok}"}

        # USER cannot create services (403)
        res_svc = self.client.post("/api/v1/admin/services", json={"name": "Hacked Service"}, headers=user_headers)
        self.assertEqual(res_svc.status_code, 403)

        # USER cannot create packages (403)
        res_pkg = self.client.post("/api/v1/admin/packages", json={"tier_name": "Hacked Package"}, headers=user_headers)
        self.assertEqual(res_pkg.status_code, 403)

        # USER cannot create gallery items (403)
        res_gal = self.client.post("/api/v1/admin/gallery", json={"title": "Hacked Gallery"}, headers=user_headers)
        self.assertEqual(res_gal.status_code, 403)

        # USER cannot edit content (403)
        res_cnt = self.client.put("/api/v1/admin/content/home", json={"page_key": "home", "section_key": "hero", "content_json": {}}, headers=user_headers)
        self.assertEqual(res_cnt.status_code, 403)

        # USER cannot upload media via admin API (403)
        files = {"file": ("test.png", b"test", "image/png")}
        res_up = self.client.post("/api/v1/admin/upload-media", files=files, headers=user_headers)
        self.assertEqual(res_up.status_code, 403)

    def test_17_admin_email_notifications_and_failure_resilience(self):
        from unittest.mock import patch
        from datetime import datetime, timedelta
        from app.core.email import (
            create_admin_registration_email_content,
            create_admin_booking_email_content,
            send_admin_user_registration_email,
            send_admin_booking_notification_email
        )
        from app.models.models import User, Booking

        # 1. Test Content Generation for Admin Registration Email
        mock_user = User(
            id=999,
            name="Alexander Graham",
            first_name="Alexander",
            last_name="Graham",
            username="alexander_g",
            email="alexander@example.com",
            age=30,
            role="USER",
            created_at=datetime(2026, 10, 9, 12, 0, 0)
        )
        msg_reg = create_admin_registration_email_content(mock_user)
        self.assertIn("Alexander Graham", msg_reg["Subject"])
        self.assertIn("alexander@example.com", msg_reg["Subject"])
        payloads_reg = "".join([part.get_payload(decode=True).decode('utf-8') for part in msg_reg.get_payload()])
        self.assertIn("Alexander Graham", payloads_reg)
        self.assertIn("alexander@example.com", payloads_reg)
        self.assertIn("alexander_g", payloads_reg)

        # 2. Test Content Generation for Admin Booking Email
        mock_booking = Booking(
            id=888,
            booking_reference="BB-2026-TEST99",
            user_id=999,
            package_tier="high",
            full_name="Princess Jasmine",
            mobile_no="9840123456",
            alt_mobile_no="9840654321",
            email="jasmine@agrabah.com",
            function_category="Royal Wedding",
            district="Chennai",
            place_area="Adyar",
            full_address="Palace Grounds, Adyar",
            pincode="600020",
            from_date="2026-11-15",
            to_date="2026-11-16",
            from_time="09:00",
            to_time="22:00",
            duration_days=2,
            selected_needs="Food, Catering, Decorations, Photography, DJ Music",
            total_amount=375000.0,
            status="UPCOMING"
        )
        msg_booking = create_admin_booking_email_content(mock_booking)
        self.assertIn("BB-2026-TEST99", msg_booking["Subject"])
        self.assertIn("Princess Jasmine", msg_booking["Subject"])
        payloads_booking = "".join([part.get_payload(decode=True).decode('utf-8') for part in msg_booking.get_payload()])
        self.assertIn("BB-2026-TEST99", payloads_booking)
        self.assertIn("Princess Jasmine", payloads_booking)
        self.assertIn("HIGH", payloads_booking)
        self.assertIn("375,000", payloads_booking)

        # 3. Test SMTP Failure Resilience (Registration still succeeds if SMTP throws error)
        from app.models.models import OTPVerification
        test_email_fail = f"fail_smtp_{uuid.uuid4().hex[:6]}@example.com"
        db = SessionLocal()
        db.add(OTPVerification(
            email=test_email_fail,
            otp_code="123456",
            is_used=1,
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        ))
        db.commit()
        db.close()

        with patch("app.core.email.send_smtp_message", side_effect=Exception("Simulated SMTP network connection timeout")):
            reg_res = self.client.post("/api/v1/auth/register", json={
                "firstName": "Resilient",
                "lastName": "User",
                "username": f"resilient_{uuid.uuid4().hex[:6]}",
                "email": test_email_fail,
                "age": 28,
                "password": "Password@123",
                "confirmPassword": "Password@123",
                "otp": "123456"
            })
            # Registration must succeed (200) regardless of SMTP error
            self.assertEqual(reg_res.status_code, 200)
            self.assertIn("access_token", reg_res.json())

        # 4. Test SMTP Failure Resilience (Booking creation still succeeds if SMTP throws error)
        user_tok = self.client.post("/api/v1/auth/login", json={
            "username": "test_user_a",
            "password": "UserA@123"
        }).json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_tok}"}

        with patch("app.core.email.send_smtp_message", side_effect=Exception("Simulated SMTP mail server error")):
            booking_res = self.client.post("/api/v1/bookings", json={
                "package_tier": "low",
                "fullName": "Resilient Booking Customer",
                "mobileNo": "9998887770",
                "emailAddr": "test_user_a@example.com",
                "functionType": "Milestone Birthday",
                "needs": ["Food", "Decorations"],
                "districtSelect": "Salem",
                "place": "Fairlands",
                "fullAddress": "123 Main Rd",
                "pincode": "636016",
                "fromDate": "2026-11-20",
                "toDate": "2026-11-20",
                "fromTime": "10:00",
                "toTime": "16:00"
            }, headers=user_headers)
            # Booking creation must succeed (200) regardless of SMTP error
            self.assertEqual(booking_res.status_code, 200)
            self.assertTrue(booking_res.json()["success"])
            self.assertIn("booking_reference", booking_res.json())

if __name__ == "__main__":
    unittest.main()


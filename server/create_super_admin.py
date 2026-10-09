#!/usr/bin/env python3
"""
Banana Brothers Platform — Super Admin Creation CLI
Secure standalone backend script for initializing and managing SUPER_ADMIN accounts.
"""

import sys
import argparse
import getpass
import re
from app.core.database import SessionLocal, engine, Base, sync_database_schema
from app.models.models import User
from app.core.security import get_password_hash

def validate_email(email: str) -> bool:
    regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(regex, email.strip()))

def create_or_promote_super_admin(
    username: str = None,
    email: str = None,
    first_name: str = None,
    last_name: str = None,
    password: str = None,
    promote: bool = False
):
    # Ensure database tables and schema columns exist
    sync_database_schema(engine)

    # Interactive collection if parameters omitted
    print("\n=======================================================")
    print("  Banana Brothers — Super Admin Account Setup")
    print("=======================================================\n")

    if not username:
        username = input("Enter Super Admin Username: ").strip()
    username = username.strip()
    if not username or len(username) < 3:
        print("Error: Username must be at least 3 characters long.", file=sys.stderr)
        return False

    if not email:
        email = input("Enter Super Admin Email: ").strip()
    email = email.strip().lower()
    if not validate_email(email):
        print("Error: Invalid email format.", file=sys.stderr)
        return False

    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()

        if existing_user:
            if existing_user.role == "SUPER_ADMIN":
                print(f"\n[INFO] User '{existing_user.username}' ({existing_user.email}) is already a SUPER_ADMIN.")
                if existing_user.is_active != 1:
                    existing_user.is_active = 1
                    db.commit()
                    print("[INFO] Re-activated account status.")
                print(f"ID: {existing_user.id} | Role: {existing_user.role} | Active: Yes")
                return True

            print(f"\n[NOTICE] User exists with role: {existing_user.role}")
            if not promote:
                confirm = input(f"Promote existing user '{existing_user.username}' to SUPER_ADMIN? (y/N): ").strip().lower()
                if confirm not in ['y', 'yes']:
                    print("Operation aborted.", file=sys.stderr)
                    return False

            existing_user.role = "SUPER_ADMIN"
            existing_user.is_active = 1
            if password:
                existing_user.password_hash = get_password_hash(password)
            db.commit()
            db.refresh(existing_user)
            print(f"\n[SUCCESS] Successfully promoted '{existing_user.username}' to SUPER_ADMIN!")
            print(f"ID: {existing_user.id} | Username: {existing_user.username} | Email: {existing_user.email} | Role: {existing_user.role}\n")
            return True

        # Prompt for names and password for new user
        if not first_name:
            first_name = input("Enter First Name (default: Super): ").strip() or "Super"
        if not last_name:
            last_name = input("Enter Last Name (default: Admin): ").strip() or "Admin"

        if not password:
            while True:
                pwd1 = getpass.getpass("Enter Password: ")
                if len(pwd1) < 6:
                    print("Error: Password must be at least 6 characters.", file=sys.stderr)
                    continue
                pwd2 = getpass.getpass("Confirm Password: ")
                if pwd1 != pwd2:
                    print("Error: Passwords do not match. Try again.", file=sys.stderr)
                    continue
                password = pwd1
                break

        if len(password) < 6:
            print("Error: Password must be at least 6 characters long.", file=sys.stderr)
            return False

        # Create new SUPER_ADMIN user
        new_super_admin = User(
            name=f"{first_name.strip()} {last_name.strip()}",
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            username=username,
            email=email,
            age=30,
            role="SUPER_ADMIN",
            is_active=1,
            password_hash=get_password_hash(password)
        )

        db.add(new_super_admin)
        db.commit()
        db.refresh(new_super_admin)

        print("\n[SUCCESS] Super Admin account created successfully!")
        print(f"ID: {new_super_admin.id} | Username: {new_super_admin.username} | Email: {new_super_admin.email} | Role: {new_super_admin.role}\n")
        return True

    except Exception as err:
        db.rollback()
        print(f"Error during account creation: {err}", file=sys.stderr)
        return False
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="Create or manage Banana Brothers SUPER_ADMIN account.")
    parser.add_argument("--username", help="Username for the super admin")
    parser.add_argument("--email", help="Email for the super admin")
    parser.add_argument("--first-name", help="First name")
    parser.add_argument("--last-name", help="Last name")
    parser.add_argument("--password", help="Password (optional, prompted securely if omitted)")
    parser.add_argument("--promote", action="store_true", help="Automatically promote if user already exists")

    args = parser.parse_args()

    success = create_or_promote_super_admin(
        username=args.username,
        email=args.email,
        first_name=args.first_name,
        last_name=args.last_name,
        password=args.password,
        promote=args.promote
    )

    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()

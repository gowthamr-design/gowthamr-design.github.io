import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
import logging
from datetime import datetime, timezone
from typing import Optional, Any
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")


def get_admin_notification_recipient() -> str:
    """Returns the designated admin email for system notifications."""
    return (
        getattr(settings, "ADMIN_NOTIFICATION_EMAIL", "")
        or getattr(settings, "SMTP_FROM_EMAIL", "")
        or getattr(settings, "SMTP_USER", "")
    ).strip()


def send_smtp_message(msg: MIMEMultipart, recipient_email: str) -> None:
    """
    Core SMTP delivery function using server/.env credentials.
    Supports SSL (port 465) and STARTTLS (port 587 / other).
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.error("SMTP Configuration Error: SMTP_USER or SMTP_PASSWORD is not set in server/.env")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service is not configured on the server. Please check SMTP settings."
        )

    try:
        # Check if port 465 (SSL)
        if int(settings.SMTP_PORT) == 465:
            ssl_context = ssl.create_default_context()
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=ssl_context, timeout=20) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        else:
            # Port 587 or standard TLS
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
                server.ehlo()
                ssl_context = ssl.create_default_context()
                server.starttls(context=ssl_context)
                server.ehlo()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)

        logger.info(f"Successfully sent email to {recipient_email}")

    except smtplib.SMTPAuthenticationError as auth_err:
        logger.error(
            f"SMTP Authentication Error: {auth_err}. "
            f"For Gmail accounts, ensure you are using a 16-character Google App Password."
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SMTP Authentication failed. For Gmail, please use a Google App Password in server/.env."
        )
    except smtplib.SMTPRecipientsRefused as recip_err:
        logger.error(f"SMTP Recipient Refused: {recip_err}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The email address '{recipient_email}' was rejected by the mail server."
        )
    except (smtplib.SMTPConnectError, smtplib.SMTPServerDisconnected, TimeoutError, OSError) as conn_err:
        logger.error(f"SMTP Connection Error: {conn_err}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to establish connection to the email server. Please check internet/SMTP server status."
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error while sending email: {type(e).__name__} - {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )


# =========================================================================
# 1. USER OTP VERIFICATION EMAIL
# =========================================================================

def create_otp_email_content(to_email: str, otp_code: str) -> MIMEMultipart:
    """Creates a multipart email (plain text + luxury styled HTML) containing the OTP."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your Verification Code: {otp_code} - Banana Brothers"
    sender_name = getattr(settings, "SMTP_FROM_NAME", "Banana Brothers Events")
    sender_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
    msg["From"] = formataddr((sender_name, sender_email))
    msg["To"] = to_email

    text_content = f"""Hello,

Your verification code for Banana Brothers Events is: {otp_code}

This code is valid for 5 minutes. For security reasons, please do not share this code with anyone.

If you did not request this verification code, you can safely ignore this email.

Warm regards,
Banana Brothers Events Team
"""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verification Code</title>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }}
    .email-container {{ max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; }}
    .header {{ background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; }}
    .brand-title {{ color: #f8fafc; font-size: 22px; font-weight: 800; letter-spacing: 1px; margin: 0; }}
    .brand-subtitle {{ color: #eab308; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; }}
    .content {{ padding: 36px 30px; text-align: center; }}
    .title {{ font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }}
    .description {{ font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 28px; }}
    .otp-card {{ background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%); border: 2px dashed #eab308; border-radius: 14px; padding: 20px 16px; display: inline-block; margin-bottom: 24px; min-width: 240px; }}
    .otp-code {{ font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #713f12; margin: 0; padding-left: 8px; }}
    .timer-badge {{ display: inline-flex; align-items: center; gap: 6px; background: #fee2e2; color: #991b1b; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }}
    .footer {{ background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="brand-title">BANANA BROTHERS</div>
      <div class="brand-subtitle">Luxury Event Specialists</div>
    </div>
    <div class="content">
      <h2 class="title">Email Verification Code</h2>
      <p class="description">
        Thank you for choosing Banana Brothers Events. Please use the verification code below to verify your email address.
      </p>
      <div class="otp-card">
        <div class="otp-code">{otp_code}</div>
      </div>
      <div>
        <span class="timer-badge">⏳ Valid for 5 minutes only</span>
      </div>
      <p class="description" style="font-size: 13px; margin-bottom: 0;">
        If you didn't request this code, you can safely ignore this email. Do not share this code with anyone.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Banana Brothers Events. All rights reserved.</p>
      <p>Crafting Unforgettable Experiences.</p>
    </div>
  </div>
</body>
</html>
"""

    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    msg.attach(part1)
    msg.attach(part2)
    return msg


def send_otp_email(to_email: str, otp_code: str) -> None:
    """Sends OTP email to the specified user."""
    msg = create_otp_email_content(to_email=to_email, otp_code=otp_code)
    send_smtp_message(msg=msg, recipient_email=to_email)


# =========================================================================
# 2. ADMIN USER REGISTRATION NOTIFICATION EMAIL
# =========================================================================

def create_admin_registration_email_content(user: Any, registered_at: Optional[datetime] = None) -> MIMEMultipart:
    """Creates a notification email to the Admin when a new user registers."""
    admin_email = get_admin_notification_recipient()
    sender_name = getattr(settings, "SMTP_FROM_NAME", "Banana Brothers System")
    sender_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER

    user_name = getattr(user, "name", None) or f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip() or getattr(user, "username", "Unknown User")
    user_email = getattr(user, "email", "N/A")
    username = getattr(user, "username", "N/A")
    user_age = getattr(user, "age", "N/A")
    user_role = getattr(user, "role", "USER")

    reg_time = registered_at or getattr(user, "created_at", None) or datetime.now(timezone.utc)
    if isinstance(reg_time, datetime):
        formatted_time = reg_time.strftime("%d %b %Y, %I:%M:%S %p UTC")
    else:
        formatted_time = str(reg_time)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"👤 [New User Registration] {user_name} ({user_email}) - Banana Brothers"
    msg["From"] = formataddr((sender_name, sender_email))
    msg["To"] = admin_email

    text_content = f"""New User Registration Alert - Banana Brothers Events

A new user has successfully registered on the Banana Brothers website.

User Details:
----------------------------------------
• Full Name: {user_name}
• Email: {user_email}
• Username: {username}
• Age: {user_age}
• Role: {user_role}
• Registration Time: {formatted_time}
----------------------------------------

You can view and manage all registered users in the Admin Dashboard:
User Directory: /admin (Users Tab)

Best regards,
Banana Brothers Automated Notification System
"""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New User Registration Notification</title>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }}
    .email-container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; }}
    .header {{ background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 28px 24px; text-align: center; }}
    .brand-title {{ color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1px; margin: 0; }}
    .badge {{ display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }}
    .content {{ padding: 32px 28px; }}
    .title {{ font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px; }}
    .subtitle {{ font-size: 14px; color: #64748b; margin-top: 0; margin-bottom: 24px; }}
    .info-table {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; }}
    .info-table th, .info-table td {{ padding: 12px 14px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }}
    .info-table th {{ width: 35%; color: #64748b; font-weight: 600; background-color: #f8fafc; }}
    .info-table td {{ color: #0f172a; font-weight: 500; }}
    .highlight-name {{ color: #4338ca; font-weight: 700; font-size: 15px; }}
    .footer {{ background-color: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="brand-title">BANANA BROTHERS EVENTS</div>
      <div class="badge">Admin Notification</div>
    </div>
    <div class="content">
      <h2 class="title">New User Registered</h2>
      <p class="subtitle">A new customer account has been registered and verified.</p>
      <table class="info-table">
        <tr>
          <th>Full Name</th>
          <td class="highlight-name">{user_name}</td>
        </tr>
        <tr>
          <th>Email Address</th>
          <td><strong>{user_email}</strong></td>
        </tr>
        <tr>
          <th>Username</th>
          <td>{username}</td>
        </tr>
        <tr>
          <th>Age</th>
          <td>{user_age}</td>
        </tr>
        <tr>
          <th>Account Role</th>
          <td><span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">{user_role}</span></td>
        </tr>
        <tr>
          <th>Registration Time</th>
          <td>{formatted_time}</td>
        </tr>
      </table>
    </div>
    <div class="footer">
      <p>&copy; 2026 Banana Brothers Events. Direct Administrative Dispatch.</p>
    </div>
  </div>
</body>
</html>
"""

    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    msg.attach(part1)
    msg.attach(part2)
    return msg


def send_admin_user_registration_email(user: Any, registered_at: Optional[datetime] = None) -> bool:
    """
    Sends notification to Admin on user registration.
    Catches all exceptions so user registration is never blocked or rolled back.
    """
    try:
        admin_email = get_admin_notification_recipient()
        if not admin_email:
            logger.warning("No admin notification email recipient configured.")
            return False

        msg = create_admin_registration_email_content(user=user, registered_at=registered_at)
        send_smtp_message(msg=msg, recipient_email=admin_email)
        logger.info(f"Admin registration notification sent to {admin_email} for user {getattr(user, 'username', '')}")
        return True
    except Exception as e:
        logger.error(f"Failed to send admin registration notification email (non-blocking): {e}")
        return False


# =========================================================================
# 3. ADMIN BOOKING CREATION NOTIFICATION EMAIL
# =========================================================================

def create_admin_booking_email_content(booking: Any) -> MIMEMultipart:
    """Creates a notification email to the Admin when a booking is placed."""
    admin_email = get_admin_notification_recipient()
    sender_name = getattr(settings, "SMTP_FROM_NAME", "Banana Brothers System")
    sender_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER

    booking_ref = getattr(booking, "booking_reference", "N/A")
    cust_name = getattr(booking, "full_name", "N/A")
    cust_email = getattr(booking, "email", "N/A")
    cust_mobile = getattr(booking, "mobile_no", "N/A")
    cust_alt_mobile = getattr(booking, "alt_mobile_no", None)

    tier = (getattr(booking, "package_tier", "") or "Custom").upper()
    function_category = getattr(booking, "function_category", None) or getattr(booking, "event_type", "Celebration Event")
    date_range = getattr(booking, "date", None) or f"{getattr(booking, 'from_date', '')} to {getattr(booking, 'to_date', '')}".strip(" to")
    timing = f"{getattr(booking, 'from_time', '')} - {getattr(booking, 'to_time', '')}".strip(" -") or "Standard"
    duration = f"{getattr(booking, 'duration_days', 1)} Day(s)"

    location_parts = [
        getattr(booking, "place_area", ""),
        getattr(booking, "district", ""),
        getattr(booking, "pincode", "")
    ]
    location_summary = ", ".join([p for p in location_parts if p]) or getattr(booking, "location", "N/A")
    full_address = getattr(booking, "full_address", "N/A")
    map_location = getattr(booking, "map_location_url", "")

    selected_needs = getattr(booking, "selected_needs", "") or "Standard Inclusions"
    total_amount = getattr(booking, "total_amount", 0.0)
    formatted_amount = f"₹ {float(total_amount):,.2f}"
    status_label = getattr(booking, "status", "UPCOMING")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🎉 [New Booking Alert] Ref: {booking_ref} - {cust_name} ({tier} Package)"
    msg["From"] = formataddr((sender_name, sender_email))
    msg["To"] = admin_email

    text_content = f"""New Event Booking Alert - Banana Brothers Events

A new event booking has been placed on the Banana Brothers website.

BOOKING DETAILS:
----------------------------------------
• Booking Reference: {booking_ref}
• Package Tier: {tier} Package
• Event Category: {function_category}
• Event Date(s): {date_range}
• Timing: {timing} ({duration})
• Total Estimated Amount: {formatted_amount}
• Status: {status_label}

CUSTOMER & VENUE INFORMATION:
----------------------------------------
• Customer Name: {cust_name}
• Email: {cust_email}
• Mobile: {cust_mobile} {f'(Alt: {cust_alt_mobile})' if cust_alt_mobile else ''}
• Location: {location_summary}
• Full Address: {full_address}
{f'• Map Location: {map_location}' if map_location else ''}

SELECTED SERVICES / ADD-ONS:
----------------------------------------
{selected_needs}
----------------------------------------

You can review, manage, and update the status of this booking in the Admin Panel:
Admin Panel: /admin (Bookings Tab)

Best regards,
Banana Brothers Automated Notification System
"""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Event Booking Notification</title>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }}
    .email-container {{ max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; }}
    .header {{ background: linear-gradient(135deg, #450a0a 0%, #1c0606 100%); padding: 30px 24px; text-align: center; border-bottom: 3px solid #d97706; }}
    .brand-title {{ color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1.5px; margin: 0; }}
    .badge {{ display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 10px; }}
    .content {{ padding: 32px 28px; }}
    .booking-ref-card {{ background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; border-radius: 12px; padding: 14px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }}
    .ref-label {{ font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #92400e; font-weight: 700; margin: 0; }}
    .ref-code {{ font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: 800; color: #78350f; margin: 2px 0 0; }}
    .amount-box {{ text-align: right; }}
    .amount-label {{ font-size: 11px; text-transform: uppercase; color: #92400e; font-weight: 600; margin: 0; }}
    .amount-val {{ font-size: 22px; font-weight: 800; color: #15803d; margin: 2px 0 0; }}
    .section-title {{ font-size: 14px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }}
    .info-table {{ width: 100%; border-collapse: collapse; }}
    .info-table th, .info-table td {{ padding: 10px 12px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; }}
    .info-table th {{ width: 32%; color: #64748b; font-weight: 600; background-color: #f8fafc; }}
    .info-table td {{ color: #0f172a; font-weight: 500; }}
    .needs-tag {{ display: inline-block; background: #ede9fe; color: #5b21b6; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; margin: 2px 4px 2px 0; }}
    .footer {{ background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="brand-title">BANANA BROTHERS EVENTS</div>
      <div class="badge">New Booking Order</div>
    </div>
    <div class="content">
      <div class="booking-ref-card">
        <div>
          <p class="ref-label">Booking Reference</p>
          <p class="ref-code">{booking_ref}</p>
        </div>
        <div class="amount-box">
          <p class="amount-label">Estimated Total</p>
          <p class="amount-val">{formatted_amount}</p>
        </div>
      </div>

      <div class="section-title">Event & Package Information</div>
      <table class="info-table">
        <tr>
          <th>Package Tier</th>
          <td><strong style="color: #b45309;">{tier} TIER</strong></td>
        </tr>
        <tr>
          <th>Event Category</th>
          <td>{function_category}</td>
        </tr>
        <tr>
          <th>Event Dates</th>
          <td>{date_range} ({duration})</td>
        </tr>
        <tr>
          <th>Event Timing</th>
          <td>{timing}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td><span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700;">{status_label}</span></td>
        </tr>
        <tr>
          <th>Selected Services</th>
          <td>
            {selected_needs}
          </td>
        </tr>
      </table>

      <div class="section-title">Customer & Venue Details</div>
      <table class="info-table">
        <tr>
          <th>Customer Name</th>
          <td><strong>{cust_name}</strong></td>
        </tr>
        <tr>
          <th>Email Address</th>
          <td>{cust_email}</td>
        </tr>
        <tr>
          <th>Mobile Number</th>
          <td><strong>{cust_mobile}</strong> {f'(Alt: {cust_alt_mobile})' if cust_alt_mobile else ''}</td>
        </tr>
        <tr>
          <th>Venue Location</th>
          <td>{location_summary}</td>
        </tr>
        <tr>
          <th>Full Address</th>
          <td>{full_address}</td>
        </tr>
      </table>
    </div>
    <div class="footer">
      <p>&copy; 2026 Banana Brothers Events. Real-time Administrative Dispatch.</p>
    </div>
  </div>
</body>
</html>
"""

    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    msg.attach(part1)
    msg.attach(part2)
    return msg


def send_admin_booking_notification_email(booking: Any) -> bool:
    """
    Sends notification to Admin on new booking creation.
    Catches all exceptions so booking creation is never blocked or rolled back.
    """
    try:
        admin_email = get_admin_notification_recipient()
        if not admin_email:
            logger.warning("No admin notification email recipient configured.")
            return False

        msg = create_admin_booking_email_content(booking=booking)
        send_smtp_message(msg=msg, recipient_email=admin_email)
        logger.info(f"Admin booking notification sent to {admin_email} for ref {getattr(booking, 'booking_reference', '')}")
        return True
    except Exception as e:
        logger.error(f"Failed to send admin booking notification email (non-blocking): {e}")
        return False

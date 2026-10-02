import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
import logging
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")


def create_otp_email_content(to_email: str, otp_code: str) -> MIMEMultipart:
    """Creates a multipart email (plain text + luxury styled HTML) containing the OTP."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your Verification Code: {otp_code} - Banana Brothers"
    sender_name = getattr(settings, "SMTP_FROM_NAME", "Banana Brothers Events")
    sender_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
    msg["From"] = formataddr((sender_name, sender_email))
    msg["To"] = to_email

    # Plain text version
    text_content = f"""Hello,

Your verification code for Banana Brothers Events is: {otp_code}

This code is valid for 5 minutes. For security reasons, please do not share this code with anyone.

If you did not request this verification code, you can safely ignore this email.

Warm regards,
Banana Brothers Events Team
"""

    # Rich HTML version with luxury branding
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
  <style>
    body {{
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 20px;
      color: #1e293b;
    }}
    .email-container {{
      max-width: 540px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }}
    .header {{
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px 24px;
      text-align: center;
    }}
    .brand-title {{
      color: #f8fafc;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 1px;
      margin: 0;
    }}
    .brand-subtitle {{
      color: #eab308;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 6px;
    }}
    .content {{
      padding: 36px 30px;
      text-align: center;
    }}
    .title {{
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 12px;
    }}
    .description {{
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 28px;
    }}
    .otp-card {{
      background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%);
      border: 2px dashed #eab308;
      border-radius: 14px;
      padding: 20px 16px;
      display: inline-block;
      margin-bottom: 24px;
      min-width: 240px;
    }}
    .otp-code {{
      font-family: 'Courier New', Courier, monospace;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #713f12;
      margin: 0;
      padding-left: 8px;
    }}
    .timer-badge {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fee2e2;
      color: #991b1b;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
    }}
    .footer {{
      background-color: #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }}
    .footer p {{
      margin: 4px 0;
    }}
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
    """
    Sends an OTP email using the configured SMTP settings.
    Raises HTTPException with clear diagnostics if sending fails.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.error("SMTP Configuration Error: SMTP_USER or SMTP_PASSWORD is not set in server/.env")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service is not configured on the server. Please check SMTP settings."
        )

    msg = create_otp_email_content(to_email=to_email, otp_code=otp_code)

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
                
        logger.info(f"Successfully sent OTP email to {to_email}")

    except smtplib.SMTPAuthenticationError as auth_err:
        logger.error(
            f"SMTP Authentication Error: {auth_err}. "
            f"For Gmail accounts, ensure you are using a 16-character Google App Password "
            f"instead of your regular password. (https://myaccount.google.com/apppasswords)"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SMTP Authentication failed. For Gmail, please use a Google App Password in server/.env."
        )
    except smtplib.SMTPRecipientsRefused as recip_err:
        logger.error(f"SMTP Recipient Refused: {recip_err}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The email address '{to_email}' was rejected by the mail server. Please check for typos."
        )
    except (smtplib.SMTPConnectError, smtplib.SMTPServerDisconnected, TimeoutError, OSError) as conn_err:
        logger.error(f"SMTP Connection Error: {conn_err}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to establish connection to the email server. Please check internet/SMTP server status."
        )
    except Exception as e:
        logger.error(f"Unexpected error while sending email: {type(e).__name__} - {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send verification email: {str(e)}"
        )

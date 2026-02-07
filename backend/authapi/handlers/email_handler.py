import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Mailtrap SMTP Configuration from .env
MAILTRAP_HOST = os.getenv("MAIL_HOST", "sandbox.smtp.mailtrap.io")
MAILTRAP_PORT = int(os.getenv("MAIL_PORT", "2525"))
MAILTRAP_USERNAME = os.getenv("MAIL_USERNAME", "")
MAILTRAP_PASSWORD = os.getenv("MAIL_PASSWORD", "")
FROM_EMAIL = os.getenv("MAIL_FROM_ADDRESS", "noreply@durianostics.com")
FROM_NAME = os.getenv("MAIL_FROM_NAME", "Durianostics Admin")


def send_deactivation_email(user_email: str, user_name: str, reason: str) -> bool:
    """
    Send account deactivation notification email via Mailtrap
    
    Args:
        user_email: The email address of the deactivated user
        user_name: The name of the deactivated user
        reason: The reason for deactivation provided by admin
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Your Durianostics Account Has Been Deactivated"
        msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg["To"] = user_email

        # Plain text version
        text_content = f"""
Hello {user_name},

We regret to inform you that your Durianostics account has been deactivated by an administrator.

Reason for deactivation:
{reason}

If you believe this action was taken in error or would like to appeal this decision, please contact our support team at support@durianostics.com.

We apologize for any inconvenience this may cause.

Best regards,
The Durianostics Team
        """

        # HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #1b5e20;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 8px 8px;
        }}
        .reason-box {{
            background-color: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .reason-box h3 {{
            margin: 0 0 10px 0;
            color: #e65100;
        }}
        .footer {{
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }}
        .appeal-link {{
            color: #1b5e20;
            text-decoration: underline;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🍈 Durianostics</h1>
    </div>
    <div class="content">
        <p>Hello <strong>{user_name}</strong>,</p>
        
        <p>We regret to inform you that your Durianostics account has been <strong>deactivated</strong> by an administrator.</p>
        
        <div class="reason-box">
            <h3>Reason for Deactivation:</h3>
            <p>{reason}</p>
        </div>
        
        <p>If you believe this action was taken in error or would like to appeal this decision, please contact our support team at <a href="mailto:support@durianostics.com" class="appeal-link">support@durianostics.com</a>.</p>
        
        <p>We apologize for any inconvenience this may cause.</p>
        
        <p>Best regards,<br>
        <strong>The Durianostics Team</strong></p>
        
        <div class="footer">
            <p>This is an automated message from Durianostics. Please do not reply directly to this email.</p>
            <p>&copy; 2026 Durianostics. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """

        # Attach both versions
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        # Send email via Mailtrap SMTP
        with smtplib.SMTP(MAILTRAP_HOST, MAILTRAP_PORT) as server:
            server.starttls()
            server.login(MAILTRAP_USERNAME, MAILTRAP_PASSWORD)
            server.sendmail(FROM_EMAIL, user_email, msg.as_string())
        
        print(f"Deactivation email sent successfully to {user_email}")
        return True

    except Exception as e:
        print(f"Failed to send deactivation email to {user_email}: {str(e)}")
        return False


def send_reactivation_email(user_email: str, user_name: str) -> bool:
    """
    Send account reactivation notification email via Mailtrap
    
    Args:
        user_email: The email address of the reactivated user
        user_name: The name of the reactivated user
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Your Durianostics Account Has Been Reactivated"
        msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg["To"] = user_email

        text_content = f"""
Hello {user_name},

Great news! Your Durianostics account has been reactivated.

You can now log in and access all features of the platform.

If you have any questions, please contact our support team at support@durianostics.com.

Best regards,
The Durianostics Team
        """

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #1b5e20;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 8px 8px;
        }}
        .success-box {{
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .footer {{
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🍈 Durianostics</h1>
    </div>
    <div class="content">
        <p>Hello <strong>{user_name}</strong>,</p>
        
        <div class="success-box">
            <p>✅ Great news! Your Durianostics account has been <strong>reactivated</strong>.</p>
        </div>
        
        <p>You can now log in and access all features of the platform.</p>
        
        <p>If you have any questions, please contact our support team at <a href="mailto:support@durianostics.com">support@durianostics.com</a>.</p>
        
        <p>Best regards,<br>
        <strong>The Durianostics Team</strong></p>
        
        <div class="footer">
            <p>&copy; 2026 Durianostics. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """

        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        with smtplib.SMTP(MAILTRAP_HOST, MAILTRAP_PORT) as server:
            server.starttls()
            server.login(MAILTRAP_USERNAME, MAILTRAP_PASSWORD)
            server.sendmail(FROM_EMAIL, user_email, msg.as_string())
        
        print(f"Reactivation email sent successfully to {user_email}")
        return True

    except Exception as e:
        print(f"Failed to send reactivation email to {user_email}: {str(e)}")
        return False

# Email Configuration Guide

## Setting Up Email for OTP Verification

The application requires email configuration to send OTP codes for email verification. There are two ways to set this up:

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Add to `.env.local`**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

### Option 2: Other Email Providers

#### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### Development Mode (No Email Setup)

If SMTP is not configured, the application will:
- Log OTP codes to the server console
- Allow you to continue with verification using the console OTP
- Display a warning message

**To see OTP in console:**
1. Check your terminal/console where the Next.js server is running
2. Look for a message like:
```
========================================
📧 OTP EMAIL (Development Mode)
========================================
To: user@example.com
Name: User Name
OTP: 123456
========================================
```

### Troubleshooting

**Error: "Failed to send OTP email"**
- Check that SMTP credentials are correct
- Verify SMTP_HOST and SMTP_PORT are correct for your provider
- For Gmail, ensure you're using an App Password, not your regular password
- Check firewall/network settings
- Review server console logs for detailed error messages

**OTP not received:**
- Check spam/junk folder
- Verify email address is correct
- Check server console for OTP (if in dev mode)
- Ensure SMTP credentials are set in `.env.local` (not `.env`)

### Security Notes

- Never commit `.env.local` to version control
- Use App Passwords instead of main account passwords
- Consider using a dedicated email service for production
- Rotate credentials regularly


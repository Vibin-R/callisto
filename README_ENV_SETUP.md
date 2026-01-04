# Environment Variables Setup Guide

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your values** in `.env.local`

3. **Never commit** `.env.local` to version control (it's already in `.gitignore`)

## Required Variables

### 1. MONGODB_URI (Required)
MongoDB connection string for your database.

**Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/callisto-learn
```

**MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/callisto-learn?retryWrites=true&w=majority
```

**Getting MongoDB Atlas:**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Copy the connection string

### 2. JWT_SECRET (Required)
Secret key for signing authentication tokens. Must be at least 32 characters.

**Generate a secure secret:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Or use online generator
# https://randomkeygen.com/
```

**Example:**
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## Optional Variables

### 3. Email Configuration (Optional)
Required for sending OTP verification emails. If not set, OTPs will be logged to console.

#### Gmail Setup:
1. Enable 2-Step Verification on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an App Password for "Mail"
4. Use the 16-character password (not your regular password)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # Your 16-char app password (remove spaces)
```

#### Other Email Providers:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### 4. Gemini API Key (Optional)
Required for AI-powered roadmap generation feature.

**Getting API Key:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create a new API key
4. Copy the key

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Note:** Without this, the "Generate Path with AI" feature will not work.

## Development vs Production

### Development
- Can use local MongoDB
- OTP emails can be logged to console (no SMTP needed)
- Can use a simple JWT_SECRET
- Gemini API key optional

### Production
- Use MongoDB Atlas or managed database
- **Must** configure SMTP for email verification
- **Must** use a strong, random JWT_SECRET
- Consider using environment-specific secrets

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` but double-check
2. **Use strong secrets** - Generate random strings for JWT_SECRET
3. **Rotate credentials** - Change passwords/keys regularly
4. **Use App Passwords** - For Gmail, use App Passwords, not main password
5. **Limit access** - Only give access to necessary team members
6. **Use different keys** - Use different credentials for dev/staging/production

## Troubleshooting

### "MONGODB_URI is not defined"
- Make sure `.env.local` exists in the project root
- Check that the variable name is exactly `MONGODB_URI`
- Restart your development server after adding variables

### "Failed to send OTP email"
- Check SMTP credentials are correct
- For Gmail, ensure you're using an App Password
- Check server console for detailed error messages
- In development, OTP will be logged to console if email fails

### "API key is not configured" (Gemini)
- This only affects AI roadmap generation
- Feature will show an error if key is missing
- You can still use the app without it

### Variables not loading
- Make sure file is named `.env.local` (not `.env`)
- Restart Next.js dev server after changes
- Check for typos in variable names
- Ensure no extra spaces around `=` sign

## Example Complete .env.local

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/callisto-learn

# Auth
JWT_SECRET=your-very-long-random-secret-key-minimum-32-characters-long

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=your16charapppassword

# AI (Optional)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```


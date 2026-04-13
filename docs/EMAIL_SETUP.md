# Email Setup Guide

## Overview

Prevema uses a **dual email system**:

1. **System Emails** - Password resets, user invitations (global Resend adapter)
2. **Organization Emails** - Event notifications, custom emails (per-org Resend keys)

## System Email Setup (Required for Password Reset)

### Step 1: Verify Your Domain in Resend

1. Log into your [Resend account](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `prevema.com`)
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

### Step 2: Get Your Production API Key

1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Create a new API key with **full sending permissions**
3. Copy the key (starts with `re_`)

### Step 3: Update Your Environment Variables

Update your `.env` file with:

```bash
# System Email Configuration
RESEND_API_KEY=re_your_production_api_key_here
RESEND_DEFAULT_FROM_ADDRESS=noreply@yourdomain.com
RESEND_DEFAULT_FROM_NAME=Prevema
```

**Important:**
- Use the domain you verified in Step 1 for `RESEND_DEFAULT_FROM_ADDRESS`
- Never use `onboarding@resend.dev` in production (test mode only)

### Step 4: Restart Your Application

```bash
# Stop the dev server
# Update .env with the values above
# Restart
pnpm dev
```

## Organization Email Setup (REQUIRED)

Organizations **must** configure their own Resend API key to send emails:

### Admin Panel Configuration

1. Navigate to **Organizations** in the admin panel
2. Select an organization
3. Scroll to **"Custom Email Configuration"**
4. Enable custom email configuration
5. Enter:
   - **Resend API Key** - Organization's own Resend key
   - **Sender Name** - How emails appear (e.g., "Acme Events")
   - **From Email** - Must use organization's verified domain
   - **Reply-To Email** - Where replies go

### Testing Organization Emails

Organization emails are triggered by platform events:
- Participant notifications
- Event updates
- Custom email automations

**Important:** Organizations must have an active custom Resend configuration to send emails. There is no fallback to system email - emails will fail if the organization doesn't have valid Resend API configuration.

## Email Architecture

### System Emails (`payload.config.ts`)

**Used for:**
- Password reset
- User invitations
- System notifications

**Configuration:**
- Global Resend adapter
- Single API key for all system emails
- Configured via environment variables

**Files:**
- `src/payload.config.ts` - Email adapter configuration
- `src/collections/Users/index.ts` - Custom password reset template

### Organization Emails (`src/services/email.ts`)

**Used for:**
- Participant notifications
- Event announcements
- Custom organization emails

**Configuration:**
- **REQUIRES** per-organization Resend API keys
- Stored in `Organizations.emailConfig`
- Custom email templates from `EmailTemplates` collection
- Emails sent directly via organization's Resend account (NOT via Payload adapter)

**Files:**
- `src/services/email.ts` - Tenant email service (uses Resend SDK directly)
- `src/collections/Organizations/index.ts` - Email config fields
- `src/collections/EmailTemplates/` - Custom email templates

## Troubleshooting

### Error: "You can only send testing emails to your own email address"

**Cause:** Using a test Resend API key or `onboarding@resend.dev`

**Solution:**
1. Verify a domain in Resend
2. Update `RESEND_API_KEY` to a production key
3. Update `RESEND_DEFAULT_FROM_ADDRESS` to use your verified domain

### Password Reset Emails Not Arriving

**Check:**
1. Is `RESEND_API_KEY` set correctly in `.env`?
2. Is `RESEND_DEFAULT_FROM_ADDRESS` using a verified domain?
3. Check spam folder
4. Check Resend logs: https://resend.com/logs

### Organization Emails Not Sending

**Check:**
1. Is email config active in Organizations settings?
2. Is the organization's Resend API key valid?
3. Does the organization have a verified domain in their Resend account?
4. Check the email template is active and assigned to the organization

## Email Flow Diagram

```
User Request
    |
    ├─ System Email (password reset)
    │   └─> Global Resend Adapter (payload.config.ts)
    │       └─> System API Key (RESEND_API_KEY env var)
    │           └─> RESEND_DEFAULT_FROM_ADDRESS
    │
    └─ Organization Email (notifications)
        └─> src/services/email.ts
            ├─> Validate: Organization has active email config?
            │   ├─ No: Throw error (email fails)
            │   └─ Yes: Continue
            ├─> Validate: Organization has Resend API key?
            │   ├─ No: Throw error (email fails)
            │   └─ Yes: Continue
            ├─> Create new Resend instance with org's API key
            └─> Send directly via Resend SDK
                └─> Organization's Resend account
```

## Best Practices

1. **Always use production Resend keys** for system emails
2. **Verify domains** before going live (both system and organization domains)
3. **Each organization must have its own Resend API key** configured
4. **Test password reset** with a non-admin user
5. **Test organization emails** to ensure Resend config is valid
6. **Monitor Resend logs** for delivery issues (check both system and organization Resend accounts)
7. **Keep API keys secret** - never commit to git
8. **Use different keys** for development and production

## Support

- [Resend Documentation](https://resend.com/docs)
- [Payload CMS Email Docs](https://payloadcms.com/docs/email/overview)
- [Project Issue Tracker](./github/issues)

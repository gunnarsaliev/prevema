# Production Fixes Required

## Issues Identified

Based on the errors you're experiencing:

1. **404 Error - `/dash/graphics`** - Fixed ✅
2. **500 Error - Image loading (`Key-Vision_1920x960_02-04.png`)** - Requires action ⚠️
3. **400 Error - Bad request** - Likely related to #2 ⚠️

## What Was Fixed

### 1. Navigation Route (404 Error)
**File**: `src/components/mobile-navigation.tsx:42-46`

Changed the mobile navigation from non-existent `/dash/graphics` to the correct `/dash/assets` route.

### 2. S3 Storage Configuration
**File**: `src/payload.config.ts:99-102`

Added:
- `acl: 'public-read'` - Makes uploaded files publicly accessible
- `publicURL` configuration - Tells Payload where files are served from

## What You Need To Do Now

### Step 1: Enable R2 Public Access

Your R2 bucket (`prevema`) needs to be publicly accessible. Choose one option:

#### Option A: Quick Setup with R2.dev Subdomain

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Click on bucket: `prevema`
3. Go to **Settings** tab
4. Under **Public Access**, click **Allow Access**
5. Click **Enable R2.dev subdomain**
6. **Copy the public bucket URL** (format: `https://pub-xxxxx.r2.dev`)

#### Option B: Production Setup with Custom Domain

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Click on bucket: `prevema`
3. Go to **Settings** tab
4. Under **Public Access**, click **Allow Access**
5. Click **Connect Domain**
6. Enter custom domain like: `cdn.prevema.com` or `media.prevema.com`
7. Click **Continue**
8. The CNAME record should be added automatically (since you use Cloudflare nameservers)
9. **Copy your custom domain URL** (format: `https://cdn.prevema.com`)

### Step 2: Add Environment Variable to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name**: `S3_PUBLIC_URL`
   - **Value**: Your R2 public URL from Step 1 (e.g., `https://pub-xxxxx.r2.dev`)
   - **Environment**: Check **Production**, **Preview**, and **Development**
6. Click **Save**

### Step 3: Add to Local Environment (Optional)

Update your local `.env` file:

```bash
S3_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

Or if using custom domain:

```bash
S3_PUBLIC_URL=https://cdn.prevema.com
```

### Step 4: Redeploy on Vercel

1. Go to your Vercel project
2. Go to **Deployments** tab
3. Click the three dots (⋯) on the latest deployment
4. Click **Redeploy**
5. Confirm the redeployment

### Step 5: Verify the Fix

After redeployment:

1. Visit your production site
2. Check the browser console for errors
3. Try uploading a new image through the Payload admin
4. Verify the image displays correctly

## Understanding the Errors

### Why Images Are Broken

The S3 storage adapter configuration was incomplete:

1. **Missing ACL**: Files were uploaded but not marked as publicly readable
2. **Missing publicURL**: Payload didn't know where to serve files from
3. **Missing R2 public access**: The bucket itself wasn't configured for public access

### How the Fix Works

1. **`acl: 'public-read'`**: Every uploaded file gets public read permissions
2. **`publicURL`**: Payload uses this URL instead of local paths
3. **R2 public domain**: Cloudflare serves files from a public URL

### The Image URLs

**Before** (broken):
- Relative URL: `/api/media/filename.png`
- Or: `https://your-domain.com/api/media/filename.png`
- Result: 500 error (file not served from Next.js)

**After** (working):
- Full R2 URL: `https://pub-xxxxx.r2.dev/filename.png`
- Or: `https://cdn.prevema.com/filename.png`
- Result: File served directly from R2

## Troubleshooting

### Still seeing errors after redeployment?

1. **Check Vercel environment variables**:
   - Go to Settings → Environment Variables
   - Verify `S3_PUBLIC_URL` is set for Production

2. **Check R2 bucket is public**:
   - Go to Cloudflare R2 → prevema → Settings
   - Verify "Public Access" shows "Allowed"

3. **Hard refresh the browser**:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

4. **Check deployment logs**:
   - Go to Vercel → Deployments → Click latest deployment
   - Check for any build errors or warnings

### CORS Errors?

If you see CORS errors in the browser console, configure CORS in R2:

1. Go to R2 bucket settings
2. Scroll to **CORS Policy**
3. Add:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

### Images uploaded before the fix?

Old images might still have broken URLs. You may need to:

1. Re-upload critical images through the Payload admin
2. Or manually update their URLs in the database

## Files Changed

- `src/payload.config.ts` - Added ACL and publicURL to S3 storage
- `src/components/mobile-navigation.tsx` - Fixed navigation route
- `.env.example` - Added S3_PUBLIC_URL documentation
- `R2_SETUP.md` - Detailed setup guide (reference)
- `PRODUCTION_FIXES.md` - This file (quick reference)

## Need Help?

See `R2_SETUP.md` for more detailed instructions with screenshots and additional context.

# Cloudflare R2 Storage Setup for Production

This guide will help you configure Cloudflare R2 for public media access in production.

## Prerequisites

- Cloudflare account with R2 enabled
- R2 bucket already created (you have: `prevema`)
- Access credentials configured (you have these in .env)

## Step 1: Enable Public Access for Your R2 Bucket

You have **two options** for making your R2 bucket publicly accessible:

### Option A: R2.dev Subdomain (Recommended for Quick Setup)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Click on your bucket (`prevema`)
3. Go to the **Settings** tab
4. Under **Public Access**, click **Allow Access**
5. Click **Enable R2.dev subdomain**
6. Copy the public bucket URL (format: `https://pub-xxxxx.r2.dev`)

### Option B: Custom Domain (Recommended for Production)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Click on your bucket (`prevema`)
3. Go to the **Settings** tab
4. Under **Public Access**, click **Allow Access**
5. Click **Connect Domain**
6. Enter your custom domain (e.g., `cdn.prevema.com` or `media.prevema.com`)
7. Click **Continue**
8. Add the CNAME record to your domain's DNS (this should be automatic if your domain uses Cloudflare nameservers)
9. Copy your custom domain URL (format: `https://cdn.prevema.com`)

## Step 2: Update Environment Variables

Add the public URL to your environment variables:

### Local Development (.env)
```bash
S3_PUBLIC_URL=https://pub-xxxxx.r2.dev
# OR if using custom domain:
# S3_PUBLIC_URL=https://cdn.prevema.com
```

### Vercel Production
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `S3_PUBLIC_URL`
   - **Value**: `https://pub-xxxxx.r2.dev` (or your custom domain)
   - **Environment**: Select **Production**, **Preview**, and **Development**
5. Click **Save**

## Step 3: Redeploy Your Application

After adding the environment variable to Vercel:

1. Go to your Vercel project
2. Go to **Deployments**
3. Click the three dots on your latest deployment
4. Click **Redeploy**
5. Confirm the redeployment

## Step 4: Verify the Fix

After redeployment:

1. Upload a new image through your Payload admin panel
2. Check the image URL in the media collection
3. Verify the image loads correctly on your production site

## Troubleshooting

### Images still broken after redeployment?

1. **Check the environment variable**: Make sure `S3_PUBLIC_URL` is set in Vercel
2. **Check R2 public access**: Verify your R2 bucket has public access enabled
3. **Clear cache**: Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check bucket CORS**: If using custom domain, ensure CORS is configured properly

### CORS Configuration (if needed)

If you're accessing images from a different domain, you may need to configure CORS in R2:

1. Go to your R2 bucket settings
2. Scroll to **CORS Policy**
3. Add this configuration:

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

## What Changed?

The following updates were made to fix image access:

1. **src/payload.config.ts**: Added `acl: 'public-read'` and `publicURL` to the s3Storage configuration
2. **.env.example**: Added documentation for `S3_PUBLIC_URL`

These changes ensure:
- Uploaded files are marked as publicly readable in R2
- Payload generates correct public URLs for images
- Images are accessible in production

## Notes

- **R2.dev subdomain** is free and instant, perfect for testing
- **Custom domain** is recommended for production for better branding and control
- **ACL setting** ensures all uploaded files are publicly readable
- **publicURL** tells Payload where to serve images from

## Support

For more information, see:
- [Payload Storage Adapters Documentation](https://payloadcms.com/docs/upload/storage-adapters)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

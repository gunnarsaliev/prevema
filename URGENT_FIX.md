# URGENT: Image URLs Not Working in Production

## The Problem

**Development (works):**
```
http://localhost:3000/api/media/file/pre-event-post-bg-1772882826992.jpeg
```

**Production (broken):**
```
https://prevema.ai/api/media/file/pre-event-post-bg-1772882826992.jpeg
```

The URL pattern `/api/media/file/` indicates that:
1. ✅ Your S3 storage adapter is working and uploading files to R2
2. ❌ But Payload is generating **local API URLs** instead of **R2 public URLs**
3. ❌ This happens because `S3_PUBLIC_URL` is **not set** in your Vercel environment

## Why This Happens

### In Development
- Files are stored locally or in R2
- Payload serves them through `/api/media/file/` route
- This works because Next.js dev server handles the API route

### In Production (Without S3_PUBLIC_URL)
- Files are uploaded to R2 ✅
- But Payload still generates `/api/media/file/` URLs ❌
- Vercel's production build doesn't serve these files properly → 500 error

### In Production (With S3_PUBLIC_URL)
- Files are uploaded to R2 ✅
- Payload generates `https://pub-xxxxx.r2.dev/filename.jpeg` URLs ✅
- Files are served directly from R2 → works perfectly ✅

## The Fix (10 Minutes)

### Step 1: Enable R2 Public Access (3 minutes)

1. Go to https://dash.cloudflare.com
2. Click **R2** in the sidebar
3. Click on your bucket: **prevema**
4. Click the **Settings** tab
5. Scroll to **Public Access** section
6. Click **Allow Access** button
7. Click **Enable R2.dev subdomain**
8. **IMPORTANT**: Copy the public URL that appears (e.g., `https://pub-abc123xyz.r2.dev`)

### Step 2: Add Environment Variable to Vercel (2 minutes)

1. Go to https://vercel.com/dashboard
2. Find and click your **prevema** project
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)
5. Click **Add New** button
6. Fill in:
   - **Key**: `S3_PUBLIC_URL`
   - **Value**: Paste the R2 URL from Step 1 (e.g., `https://pub-abc123xyz.r2.dev`)
   - **Environments**: Check all three boxes (Production, Preview, Development)
7. Click **Save**

### Step 3: Redeploy Your Application (2 minutes)

1. Still in Vercel dashboard, click **Deployments** (top navigation)
2. Find the most recent deployment
3. Click the three dots **⋯** on the right
4. Click **Redeploy**
5. Click **Redeploy** again to confirm

### Step 4: Verify the Fix (2 minutes)

Wait for the deployment to complete (1-2 minutes), then:

1. Go to your Payload admin: `https://prevema.ai/admin`
2. Navigate to the Media collection
3. Click on any image
4. Check the URL field - it should now show:
   ```
   https://pub-xxxxx.r2.dev/filename.jpeg
   ```
   Instead of:
   ```
   /api/media/file/filename.jpeg
   ```

5. Visit your frontend site and check if images load correctly

## Verification Checklist

Use this to verify everything is set up correctly:

### In Cloudflare R2:
- [ ] R2 bucket "prevema" exists
- [ ] Public Access is "Allowed"
- [ ] R2.dev subdomain is enabled
- [ ] You have copied the public URL

### In Vercel:
- [ ] Environment variable `S3_PUBLIC_URL` is set
- [ ] Variable is enabled for Production
- [ ] Variable value starts with `https://`
- [ ] Application has been redeployed after adding the variable

### In Your Application:
- [ ] New images show R2 URLs (not /api/media/file/)
- [ ] Images load correctly in the browser
- [ ] No 500 errors in browser console
- [ ] No 400 errors in browser console

## Testing After Deployment

### Test 1: Check Environment Variable
Visit: `https://prevema.ai/admin`

In the Payload admin, upload a new test image and check its URL. It should be:
- ✅ Good: `https://pub-xxxxx.r2.dev/test-image.jpeg`
- ❌ Bad: `/api/media/file/test-image.jpeg`

### Test 2: Check Image Loading
Open browser console (F12) and check for errors:
- ✅ No errors = working correctly
- ❌ 500/400 errors = still broken (check environment variable)

### Test 3: Direct URL Access
Try accessing an image URL directly in your browser:
- ✅ Image loads = R2 is working
- ❌ Error page = R2 public access not enabled

## Troubleshooting

### Images still showing /api/media/file/ URLs?

**Cause**: Environment variable not set or deployment not complete

**Fix**:
1. Double-check `S3_PUBLIC_URL` is in Vercel environment variables
2. Make sure you redeployed AFTER adding the variable
3. Wait 2-3 minutes for the deployment to fully complete
4. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Still getting 500 errors?

**Cause**: R2 bucket is not publicly accessible

**Fix**:
1. Go to Cloudflare R2 → prevema → Settings
2. Make sure "Public Access" shows "Allowed"
3. Make sure "R2.dev subdomain" is enabled
4. Try accessing the R2 URL directly in browser

### Environment variable format wrong?

**Correct formats**:
```
https://pub-abc123xyz.r2.dev
```

**Incorrect formats** (don't use these):
```
pub-abc123xyz.r2.dev                    ❌ Missing https://
https://pub-abc123xyz.r2.dev/           ❌ Has trailing slash
http://pub-abc123xyz.r2.dev             ❌ HTTP instead of HTTPS
```

### Old images still broken?

**Cause**: Images uploaded before S3_PUBLIC_URL was set still have old URLs

**Fix**:
- Option 1: Re-upload the images through Payload admin
- Option 2: Images will get new URLs automatically on next upload
- Old images in the database will keep their old URLs (may need manual update)

## What Happens Behind the Scenes

### Before Fix (Current State):
```
User uploads image → S3 adapter uploads to R2
                  → Payload stores URL as: /api/media/file/image.jpeg
                  → Frontend tries to load from: prevema.ai/api/media/file/image.jpeg
                  → Next.js API can't serve it → 500 error
```

### After Fix:
```
User uploads image → S3 adapter uploads to R2
                  → Payload stores URL as: https://pub-xxx.r2.dev/image.jpeg
                  → Frontend loads from: https://pub-xxx.r2.dev/image.jpeg
                  → R2 serves the file directly → ✅ Works!
```

## Expected Timeline

- **Step 1 (R2 setup)**: 3 minutes
- **Step 2 (Vercel env var)**: 2 minutes
- **Step 3 (Redeploy)**: 2 minutes
- **Deployment time**: 1-2 minutes
- **Verification**: 2 minutes

**Total**: ~10 minutes

## Need Help?

If you're stuck, check:
1. The exact R2 public URL format
2. Vercel deployment logs for any errors
3. Browser console for specific error messages

The most common issue is forgetting to redeploy after adding the environment variable!

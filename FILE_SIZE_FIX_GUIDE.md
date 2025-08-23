# File Size Fix Guide for Logo Uploads

## Problem
The admin panel logo upload was failing with "file too large" errors due to multiple file size limits in place.

## What I Fixed

### 1. Next.js API Body Size Limits
- **File**: `next.config.mjs`
- **Change**: Added API configuration to increase body size limits
- **Before**: Default 1MB limit
- **After**: 10MB limit for file uploads

```javascript
api: {
  bodyParser: {
    sizeLimit: '10mb', // Increased from default 1MB
  },
  responseLimit: '10mb',
},
```

### 2. Server-Side File Size Validation
- **File**: `app/api/upload-asset/route.ts`
- **Change**: Increased file size limits and improved error messages
- **Before**: 5MB for images, 10MB for videos
- **After**: 10MB for images, 20MB for videos

### 3. Client-Side File Size Validation
- **File**: `lib/assets.ts`
- **Change**: Updated client-side validation to match server limits
- **File**: `components/asset-uploader.tsx`
- **Change**: Added immediate file size validation with better error messages

### 4. UI Updates
- **File**: `components/asset-uploader.tsx`
- **Change**: Updated file type descriptions to show new size limits
- **Before**: "max 10MB" for videos
- **After**: "max 10MB" for images, "max 20MB" for videos

### 5. Storage Bucket Configuration
- **File**: `lib/assets.ts`
- **Change**: Updated bucket initialization to allow larger files
- **Before**: 10MB limit
- **After**: 20MB limit

## New File Size Limits

| File Type | Old Limit | New Limit |
|-----------|-----------|-----------|
| Images (PNG, JPEG, WebP) | 5MB | 10MB |
| Videos (MP4, WebM) | 10MB | 20MB |
| SVG Files | 5MB | 10MB |

## How to Apply the Fix

### Option 1: Restart Development Server
```bash
# Stop your current dev server (Ctrl+C)
npm run dev
# or
yarn dev
```

### Option 2: Update Supabase Storage (if needed)
If you're still getting file size errors, you may need to update your Supabase storage bucket:

1. **Manual Update** (Recommended):
   - Go to your Supabase dashboard
   - Navigate to Storage > Buckets
   - Find the "assets" bucket
   - Update the file size limit to 20MB

2. **Script Update** (Advanced):
   ```bash
   node scripts/update-storage-limits.js
   ```
   ⚠️ **Warning**: This script will show you what needs to be updated but won't automatically change existing buckets to avoid data loss.

## Testing the Fix

1. Go to your admin panel
2. Try uploading a logo file larger than 5MB but smaller than 10MB
3. The upload should now work without the "file too large" error

## Additional Improvements

- **Better Error Messages**: Now shows exact file size and limit
- **Immediate Validation**: File size is checked as soon as you select a file
- **Compression**: Large images are automatically compressed before upload
- **Progress Tracking**: Upload progress is shown during the process

## Troubleshooting

If you're still having issues:

1. **Check File Size**: Make sure your file is under the new limits
2. **Check File Type**: Only supported formats are allowed
3. **Clear Browser Cache**: Hard refresh the page (Ctrl+F5)
4. **Check Network**: Ensure stable internet connection
5. **Check Supabase**: Verify your Supabase storage bucket settings

## Supported File Types

- **Images**: PNG, JPEG, JPG, WebP, SVG
- **Videos**: MP4, WebM
- **Recommended for Logos**: SVG (scalable, small file size)


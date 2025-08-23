# 🚨 IMMEDIATE FIX: File Size Issue with Logo Uploads

## 🔍 **Root Cause Identified**
The issue is that your Supabase storage bucket doesn't have file size limits configured, so it's using default limits that are too restrictive.

## ✅ **What's Already Fixed**
- ✅ Next.js API body size limit: 10MB (configured)
- ✅ Server-side validation: 10MB images, 20MB videos (configured)  
- ✅ Client-side validation: 10MB images, 20MB videos (configured)
- ✅ Enhanced compression for large files (configured)

## ❌ **What Needs to be Fixed**
- ❌ Supabase storage bucket: No file size limit set (using default)

---

## 🚀 **STEP-BY-STEP FIX**

### **Step 1: Update Supabase Storage Bucket**

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `aizgswoelfdkhyosgvzu`

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click on "Buckets"

3. **Find and Edit the "assets" Bucket**
   - Look for the bucket named "assets"
   - Click on it or click the "Edit" button

4. **Update Bucket Settings**
   - **File Size Limit**: Set to `20971520` (20MB)
   - **Allowed MIME Types**: Add these types:
     ```
     image/svg+xml,image/png,image/jpeg,image/jpg,image/webp,video/mp4,video/webm
     ```
   - **Public**: Make sure it's checked (public bucket)

5. **Save Changes**
   - Click "Save" or "Update"

### **Step 2: Restart Development Server**

```bash
# Stop your current dev server (Ctrl+C)
npm run dev
```

### **Step 3: Test the Upload**

1. Go to your admin panel
2. Try uploading your logo file again
3. The upload should now work without the "file too large" error

---

## 🔧 **Alternative Quick Fix (If You Can't Access Supabase Dashboard)**

If you can't access the Supabase dashboard right now, try this workaround:

### **Option A: Use a Smaller File**
- Compress your logo to under 5MB
- Use an online image compressor like TinyPNG
- Convert to SVG format if possible (usually much smaller)

### **Option B: Use the Enhanced Compression**
The code now has enhanced compression that will automatically:
- Compress files larger than 5MB more aggressively
- Reduce quality to 60% for large files
- Reduce dimensions to 800px for large files

Try uploading your file again - it should now compress it automatically.

---

## 📊 **New File Size Limits After Fix**

| File Type | Limit | Notes |
|-----------|-------|-------|
| **Images** (PNG, JPEG, WebP) | **10MB** | Auto-compressed if > 5MB |
| **Videos** (MP4, WebM) | **20MB** | No compression |
| **SVG Files** | **10MB** | Recommended for logos |

---

## 🧪 **Testing Your Fix**

Run this command to verify the configuration:

```bash
node scripts/test-file-upload-limits.js
```

You should see:
```
✅ Assets bucket has correct 20MB limit
```

---

## 🆘 **Still Having Issues?**

If you're still getting errors after following these steps:

1. **Check the exact error message** - it should now be more specific
2. **Try a smaller file first** (under 5MB) to test
3. **Clear browser cache** (Ctrl+F5)
4. **Check browser console** for detailed error messages
5. **Run the test script** to verify configuration

---

## 📞 **Need Help?**

The most common issue is forgetting to restart the development server after making configuration changes. Make sure to:

1. ✅ Update Supabase bucket settings
2. ✅ Restart development server (`npm run dev`)
3. ✅ Try uploading again

The enhanced compression should handle most large files automatically now!


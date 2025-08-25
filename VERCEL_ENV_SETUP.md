# 🚀 Vercel Environment Variables Setup Guide

## 📧 Email Configuration Setup

### Step 1: Get Your Resend API Key

1. **Sign up/Login to Resend:**
   - Go to [resend.com](https://resend.com)
   - Create account or login
   - Navigate to API Keys section

2. **Create API Key:**
   - Click "Create API Key"
   - Give it a name (e.g., "DopeTech Nepal Production")
   - Copy the generated API key

### Step 2: Add Environment Variables to Vercel

#### Method 1: Through Vercel Dashboard

1. **Go to your Vercel project:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your `dopetechnp` project

2. **Navigate to Settings:**
   - Click on "Settings" tab
   - Go to "Environment Variables" section

3. **Add Required Variables:**

```bash
# Required for Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=admin@dopetechnp.com

# Optional: Gmail Backup (if you want backup email service)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

#### Method 2: Through Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Add Environment Variables:**
   ```bash
   vercel env add RESEND_API_KEY
   vercel env add ADMIN_EMAIL
   vercel env add GMAIL_USER
   vercel env add GMAIL_APP_PASSWORD
   ```

### Step 3: Complete Environment Variables List

Add ALL these variables to your Vercel project:

```bash
# Supabase Configuration (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://aizgswoelfdkhyosgvzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTUyMjUsImV4cCI6MjA3MDYzMTIyNX0.4a7Smvc_bueFLqZNvGk-AW0kD5dJusNwqaSAczJs0hU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc

# Email Configuration (NEW - Add these!)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=admin@dopetechnp.com

# Optional: Gmail Backup
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

### Step 4: Redeploy After Adding Variables

1. **Trigger a new deployment:**
   - Go to Vercel dashboard
   - Click "Redeploy" button
   - Or push a new commit to GitHub

2. **Verify Environment Variables:**
   - Check deployment logs
   - Look for: "✅ Resend API key found, initializing Resend client..."

## 🔧 Testing Email Functionality

### Test 1: Place a Test Order
1. Go to your deployed site
2. Add items to cart
3. Complete checkout process
4. Check if confirmation email is sent

### Test 2: Check Vercel Logs
1. Go to Vercel dashboard
2. Click on your latest deployment
3. Go to "Functions" tab
4. Check `/api/supabase-checkout` function logs

### Test 3: Verify in Resend Dashboard
1. Login to [resend.com](https://resend.com)
2. Go to "Logs" section
3. Check if emails are being sent successfully

## 📊 Expected Email Flow

### Customer Order Flow:
1. Customer places order
2. Order saved to Supabase
3. **Customer receives confirmation email** ✅
4. **Admin receives notification email** ✅

### Email Content Includes:
- Order details and items
- Customer information
- Payment status
- Receipt file (if uploaded)
- Professional HTML formatting

## 🛠️ Troubleshooting

### If Emails Don't Send:

1. **Check Resend API Key:**
   - Verify key is correct
   - Ensure key has proper permissions

2. **Check Vercel Logs:**
   - Look for email service errors
   - Verify environment variables are loaded

3. **Test Resend Connection:**
   - Use Resend's test endpoint
   - Verify account is active

### Common Issues:

```bash
# Error: RESEND_API_KEY not found
# Solution: Add RESEND_API_KEY to Vercel environment variables

# Error: Email service error
# Solution: Check Resend API key validity and permissions

# Error: Admin email not configured
# Solution: Add ADMIN_EMAIL environment variable
```

## 🎯 Success Indicators

When everything is working correctly, you'll see:

✅ **In Vercel Logs:**
```
✅ Resend API key found, initializing Resend client...
✅ Customer confirmation email sent successfully
✅ Admin notification email sent successfully
```

✅ **In Resend Dashboard:**
- Emails showing as "Delivered"
- No bounce or spam reports

✅ **In Customer Inbox:**
- Professional order confirmation emails
- All order details included

## 📞 Support

If you need help:
1. Check Vercel deployment logs
2. Verify Resend API key in dashboard
3. Test with Resend's API documentation
4. Contact Resend support if needed

---

**🎉 Once these environment variables are added, your email system will work flawlessly on Vercel!**

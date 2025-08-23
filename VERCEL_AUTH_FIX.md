# 🔐 Vercel Authentication Fix Guide

## 🚨 **Issue Identified:**
Your Vercel project has authentication enabled, which is blocking API calls with a 401 "Authentication Required" error.

## 🔧 **Solution Steps:**

### **Step 1: Disable Authentication in Vercel Dashboard**

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your `dopetechnp` project

2. **Navigate to Settings:**
   - Click on "Settings" tab
   - Go to "Security" section

3. **Disable Authentication:**
   - Find "Password Protection" or "Authentication"
   - Turn it OFF
   - Save changes

### **Step 2: Alternative - Create Production Deployment**

If you can't disable authentication on the preview deployment:

1. **Create a Production Deployment:**
   - In Vercel dashboard, go to "Deployments"
   - Click "Promote to Production" on your latest deployment
   - Or set up a custom domain

2. **Production URLs typically don't have authentication:**
   - Your production URL will be: `https://dopetechnp.vercel.app`
   - Or your custom domain if you set one up

### **Step 3: Update API Calls to Use Production URL**

If you create a production deployment, update your checkout client:

```typescript
// In lib/checkout-client.ts
const response = await fetch('https://dopetechnp.vercel.app/api/supabase-checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(orderData),
})
```

### **Step 4: Test the Fix**

After disabling authentication or using production URL:

```bash
# Test with the updated URL
curl -X POST https://dopetechnp.vercel.app/api/supabase-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST-123",
    "customerInfo": {
      "fullName": "Test Customer",
      "email": "test@example.com",
      "phone": "+9779812345678",
      "city": "Kathmandu",
      "state": "Bagmati",
      "zipCode": "44600",
      "fullAddress": "Test Address"
    },
    "cart": [
      {
        "id": 1,
        "name": "Test Product",
        "price": 1000,
        "quantity": 1,
        "image": "test.jpg"
      }
    ],
    "total": 1000,
    "paymentOption": "full"
  }'
```

## 🎯 **Expected Results:**

After fixing authentication:
- ✅ **API calls return 200 status** instead of 401
- ✅ **Order submission works** in the checkout
- ✅ **No more authentication popups**

## 📊 **If You Still Have Issues:**

### **Option 1: Use Vercel CLI to Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### **Option 2: Set Up Custom Domain**
1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update API calls to use your domain

### **Option 3: Check Environment Variables**
Make sure these are set in Vercel:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://aizgswoelfdkhyosgvzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 **Quick Fix Summary:**

1. **Disable authentication** in Vercel dashboard
2. **Or promote to production** deployment
3. **Update API URLs** if needed
4. **Test order submission**

---

**🔧 This should resolve the 401 authentication error and allow your orders to submit successfully!**

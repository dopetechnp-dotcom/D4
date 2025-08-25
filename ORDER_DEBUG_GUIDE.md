# 🔧 Order Submission Debug Guide

## 🚨 Common Causes of Order Submission Failures

### 1. **Database Connection Issues**
- Supabase service role key not configured
- Database tables don't exist
- RLS (Row Level Security) policies blocking access

### 2. **API Route Issues**
- Function timeout (30s limit on Vercel)
- Missing environment variables
- CORS issues

### 3. **Data Validation Issues**
- Missing required fields
- Invalid data types
- File upload problems

## 🔍 Step-by-Step Debugging

### Step 1: Check Vercel Function Logs

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your `dopetechnp` project
   - Click on latest deployment
   - Go to "Functions" tab
   - Find `/api/supabase-checkout` function

2. **Look for these error messages:**
   ```
   ❌ Error creating order: [error details]
   ❌ Error adding order items: [error details]
   ❌ Supabase checkout API error: [error details]
   ```

### Step 2: Verify Environment Variables

Check if these are set in Vercel:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://aizgswoelfdkhyosgvzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Test Database Connection

Run this test script:
```bash
npm run test:supabase
```

### Step 4: Check Database Tables

Verify these tables exist in Supabase:
- `orders`
- `order_items`
- `products`

## 🛠️ Quick Fixes

### Fix 1: Add Error Logging

Add this to your checkout component to see detailed errors:

```javascript
try {
  const response = await fetch('/api/supabase-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(checkoutData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Order submission failed:', errorData);
    throw new Error(errorData.error || 'Order submission failed');
  }

  const result = await response.json();
  console.log('✅ Order submitted successfully:', result);
} catch (error) {
  console.error('❌ Error details:', error);
}
```

### Fix 2: Test API Route Directly

Test the API route with curl:
```bash
curl -X POST https://your-domain.vercel.app/api/supabase-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST-123",
    "customerInfo": {
      "fullName": "Test Customer",
      "email": "test@example.com",
      "phone": "1234567890",
      "city": "Test City",
      "state": "Test State",
      "zipCode": "12345",
      "fullAddress": "Test Address"
    },
    "cart": [
      {
        "id": 1,
        "name": "Test Product",
        "price": 100,
        "quantity": 1,
        "image": "test.jpg"
      }
    ],
    "total": 100,
    "paymentOption": "full"
  }'
```

### Fix 3: Check Database Schema

Run this SQL in Supabase to verify tables:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'order_items', 'products');

-- Check orders table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders';

-- Check order_items table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items';
```

## 🔧 Common Solutions

### Solution 1: Database Tables Missing

If tables don't exist, run this SQL in Supabase:

```sql
-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_city VARCHAR(100),
  customer_state VARCHAR(100),
  customer_zip_code VARCHAR(20),
  customer_address TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_option VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_status VARCHAR(50) DEFAULT 'processing',
  receipt_url TEXT,
  receipt_file_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Solution 2: RLS Policies

Add these RLS policies in Supabase:

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data
CREATE POLICY "Service role can access all data" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all data" ON order_items
  FOR ALL USING (auth.role() = 'service_role');
```

### Solution 3: Storage Bucket Issues

If receipt upload fails, create the bucket:

```sql
-- Create receipts bucket (run in Supabase SQL editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true);

-- Set bucket policies
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');
```

## 📊 Debug Checklist

- [ ] Check Vercel function logs
- [ ] Verify environment variables are set
- [ ] Test database connection
- [ ] Verify database tables exist
- [ ] Check RLS policies
- [ ] Test API route directly
- [ ] Verify storage bucket exists
- [ ] Check for CORS issues

## 🚀 Quick Test Commands

```bash
# Test database connection
npm run test:supabase

# Test email setup
npm run test:email

# Build locally to check for errors
npm run build
```

## 📞 Get Help

If you're still having issues:

1. **Share the exact error message** from Vercel logs
2. **Check the browser console** for client-side errors
3. **Verify all environment variables** are set correctly
4. **Test with a simple order** (no file upload)

---

**🔧 This guide should help you identify and fix the order submission issue!**

# QR Code Management Setup Guide

## Overview
This guide will help you set up the QR code management system for your DopeTech Nepal website. The system allows you to upload and manage payment QR codes through the admin panel, similar to the video player logic.

## Setup Steps

### 1. Database Setup

You need to create the `qr_codes` table in your Supabase database. Run the following SQL in your Supabase SQL Editor:

```sql
-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for admin access)
CREATE POLICY "Allow all operations on qr_codes" ON qr_codes
  FOR ALL USING (true);

-- Create storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for QR codes bucket
CREATE POLICY "Public access to qr-codes bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'qr-codes');

CREATE POLICY "Authenticated users can upload to qr-codes bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update qr-codes bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete from qr-codes bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');
```

### 2. Alternative: Use Setup Script

You can also run the setup script:

```bash
node scripts/setup-qr-codes.js
```

This script will attempt to create the table and storage bucket automatically.

### 3. Upload QR Code

1. **Go to Admin Panel**: Navigate to `/admin` in your website
2. **Login**: Use the admin password (default: `admin123`)
3. **Navigate to QR Codes**: Click on the "QR Codes" tab in the sidebar
4. **Upload QR Code**:
   - Enter a name for your QR code (e.g., "Payment QR Code")
   - Click "Click to upload QR code image"
   - Select your QR code image (PNG, JPG up to 5MB)
   - Click "Upload QR Code"
5. **Set as Active**: Click the checkmark icon next to your uploaded QR code to make it active

### 4. Test the Integration

1. **Go to Checkout**: Add items to cart and proceed to checkout
2. **Payment Step**: In the payment section, you should see your uploaded QR code
3. **Verify**: The QR code should load successfully without the previous error

## Features

### QR Code Management
- ✅ Upload QR code images
- ✅ Set active QR code (only one can be active at a time)
- ✅ Download QR codes
- ✅ Delete QR codes
- ✅ View upload history

### Integration
- ✅ Automatic loading in checkout process
- ✅ Fallback display if QR code fails to load
- ✅ Loading states
- ✅ Error handling

### Storage
- ✅ Secure storage in Supabase
- ✅ Public access for display
- ✅ File size validation (5MB limit)
- ✅ Image format validation

## Troubleshooting

### QR Code Not Loading
1. Check if the QR code is set as active in the admin panel
2. Verify the image URL is accessible
3. Check browser console for errors
4. Ensure the storage bucket permissions are correct

### Upload Fails
1. Check file size (must be under 5MB)
2. Ensure file is an image (PNG, JPG)
3. Verify Supabase storage bucket exists
4. Check network connection

### Database Errors
1. Ensure the `qr_codes` table exists
2. Check RLS policies are correctly set
3. Verify Supabase connection
4. Check environment variables

## File Structure

```
components/
├── qr-code-manager.tsx          # QR code management component
├── supabase-checkout.tsx        # Updated checkout with QR code integration
└── enhanced-admin-panel.tsx     # Admin panel with QR codes tab

hooks/
└── use-qr-codes.ts             # Hook for QR code data management

scripts/
└── setup-qr-codes.js           # Database setup script

qr-codes-table.sql              # SQL for table creation
```

## Security

- Row Level Security (RLS) enabled
- Public read access for QR code display
- Authenticated upload/delete operations
- File type and size validation
- Secure storage in Supabase

## Next Steps

After setup, you can:
1. Upload multiple QR codes for different payment methods
2. Switch between QR codes as needed
3. Monitor QR code usage
4. Add additional QR code features as needed

The system is now fully integrated and ready to use! 🎉

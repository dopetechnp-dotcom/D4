-- =====================================================
-- Final Storage Policies Fix for DopeTech
-- This script creates comprehensive storage policies
-- that allow both authenticated and anonymous users
-- =====================================================

-- =====================================================
-- DROP ALL EXISTING STORAGE POLICIES
-- =====================================================

-- Drop all existing storage policies (comprehensive cleanup)
DROP POLICY IF EXISTS "receipts_public_select" ON storage.objects;
DROP POLICY IF EXISTS "receipts_anyone_insert" ON storage.objects;
DROP POLICY IF EXISTS "receipts_anyone_update" ON storage.objects;
DROP POLICY IF EXISTS "receipts_anyone_delete" ON storage.objects;

DROP POLICY IF EXISTS "hero_images_public_select" ON storage.objects;
DROP POLICY IF EXISTS "hero_images_anyone_insert" ON storage.objects;
DROP POLICY IF EXISTS "hero_images_anyone_update" ON storage.objects;
DROP POLICY IF EXISTS "hero_images_anyone_delete" ON storage.objects;

DROP POLICY IF EXISTS "product_images_public_select" ON storage.objects;
DROP POLICY IF EXISTS "product_images_anyone_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_anyone_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_anyone_delete" ON storage.objects;

DROP POLICY IF EXISTS "qr_codes_public_select" ON storage.objects;
DROP POLICY IF EXISTS "qr_codes_anyone_insert" ON storage.objects;
DROP POLICY IF EXISTS "qr_codes_anyone_update" ON storage.objects;
DROP POLICY IF EXISTS "qr_codes_anyone_delete" ON storage.objects;

-- Drop any generic policies that might exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Drop any other policies that might exist
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on email" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON storage.objects;

-- =====================================================
-- CREATE COMPREHENSIVE STORAGE POLICIES
-- =====================================================

-- =====================================================
-- RECEIPTS BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access for receipts
CREATE POLICY "receipts_public_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'receipts');

-- INSERT Policy - Allow both authenticated and anonymous users
CREATE POLICY "receipts_anyone_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'receipts');

-- UPDATE Policy - Allow both authenticated and anonymous users
CREATE POLICY "receipts_anyone_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'receipts');

-- DELETE Policy - Allow both authenticated and anonymous users
CREATE POLICY "receipts_anyone_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'receipts');

-- =====================================================
-- HERO-IMAGES BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access for hero-images
CREATE POLICY "hero_images_public_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'hero-images');

-- INSERT Policy - Allow both authenticated and anonymous users
CREATE POLICY "hero_images_anyone_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'hero-images');

-- UPDATE Policy - Allow both authenticated and anonymous users
CREATE POLICY "hero_images_anyone_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'hero-images');

-- DELETE Policy - Allow both authenticated and anonymous users
CREATE POLICY "hero_images_anyone_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'hero-images');

-- =====================================================
-- PRODUCT-IMAGES BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access for product-images
CREATE POLICY "product_images_public_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

-- INSERT Policy - Allow both authenticated and anonymous users
CREATE POLICY "product_images_anyone_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- UPDATE Policy - Allow both authenticated and anonymous users
CREATE POLICY "product_images_anyone_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'product-images');

-- DELETE Policy - Allow both authenticated and anonymous users
CREATE POLICY "product_images_anyone_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'product-images');

-- =====================================================
-- QR-CODES BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access for qr-codes
CREATE POLICY "qr_codes_public_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'qr-codes');

-- INSERT Policy - Allow both authenticated and anonymous users
CREATE POLICY "qr_codes_anyone_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'qr-codes');

-- UPDATE Policy - Allow both authenticated and anonymous users
CREATE POLICY "qr_codes_anyone_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'qr-codes');

-- DELETE Policy - Allow both authenticated and anonymous users
CREATE POLICY "qr_codes_anyone_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'qr-codes');

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Check that all policies were created successfully
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

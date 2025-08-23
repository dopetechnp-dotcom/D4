-- =====================================================
-- Storage Policies Setup for DopeTech (UNIQUE NAMES)
-- This script creates storage policies with unique names for each bucket
-- =====================================================

-- =====================================================
-- DROP EXISTING STORAGE POLICIES
-- =====================================================

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- =====================================================
-- RECEIPTS BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access for receipts
CREATE POLICY "receipts_public_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'receipts');

-- INSERT Policy - Authenticated users can upload to receipts
CREATE POLICY "receipts_authenticated_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

-- UPDATE Policy - Users can update own files in receipts
CREATE POLICY "receipts_authenticated_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE Policy - Users can delete own files in receipts
CREATE POLICY "receipts_authenticated_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- HERO-IMAGES BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access for hero-images
CREATE POLICY "hero_images_public_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'hero-images');

-- INSERT Policy - Authenticated users can upload to hero-images
CREATE POLICY "hero_images_authenticated_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'hero-images' AND auth.role() = 'authenticated');

-- UPDATE Policy - Users can update own files in hero-images
CREATE POLICY "hero_images_authenticated_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'hero-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE Policy - Users can delete own files in hero-images
CREATE POLICY "hero_images_authenticated_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'hero-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- PRODUCT-IMAGES BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access for product-images
CREATE POLICY "product_images_public_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

-- INSERT Policy - Authenticated users can upload to product-images
CREATE POLICY "product_images_authenticated_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- UPDATE Policy - Users can update own files in product-images
CREATE POLICY "product_images_authenticated_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE Policy - Users can delete own files in product-images
CREATE POLICY "product_images_authenticated_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- QR-CODES BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access for qr-codes
CREATE POLICY "qr_codes_public_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'qr-codes');

-- INSERT Policy - Authenticated users can upload to qr-codes
CREATE POLICY "qr_codes_authenticated_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

-- UPDATE Policy - Users can update own files in qr-codes
CREATE POLICY "qr_codes_authenticated_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'qr-codes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE Policy - Users can delete own files in qr-codes
CREATE POLICY "qr_codes_authenticated_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'qr-codes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- Setup Complete!
-- =====================================================

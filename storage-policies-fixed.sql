-- =====================================================
-- Storage Policies Setup for DopeTech (FIXED)
-- This script drops existing policies and recreates them
-- =====================================================

-- =====================================================
-- DROP EXISTING STORAGE POLICIES
-- =====================================================

-- Drop existing policies for receipts bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- =====================================================
-- RECEIPTS BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'receipts');

-- INSERT Policy - Authenticated users can upload
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

-- UPDATE Policy - Users can update own files
CREATE POLICY "Users can update own files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE Policy - Users can delete own files
CREATE POLICY "Users can delete own files" ON storage.objects 
FOR DELETE USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- HERO-IMAGES BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'hero-images');

-- INSERT Policy - Authenticated users can upload
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'hero-images' AND auth.role() = 'authenticated');

-- UPDATE Policy - Users can update own files
CREATE POLICY "Users can update own files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'hero-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE Policy - Users can delete own files
CREATE POLICY "Users can delete own files" ON storage.objects 
FOR DELETE USING (bucket_id = 'hero-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- PRODUCT-IMAGES BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

-- INSERT Policy - Authenticated users can upload
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- UPDATE Policy - Users can update own files
CREATE POLICY "Users can update own files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE Policy - Users can delete own files
CREATE POLICY "Users can delete own files" ON storage.objects 
FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- QR-CODES BUCKET POLICIES
-- =====================================================

-- SELECT Policy - Public Access
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'qr-codes');

-- INSERT Policy - Authenticated users can upload
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

-- UPDATE Policy - Users can update own files
CREATE POLICY "Users can update own files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'qr-codes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE Policy - Users can delete own files
CREATE POLICY "Users can delete own files" ON storage.objects 
FOR DELETE USING (bucket_id = 'qr-codes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- Setup Complete!
-- =====================================================

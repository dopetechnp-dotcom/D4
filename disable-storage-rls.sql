-- =====================================================
-- Disable RLS for Storage Objects
-- This will allow any user to upload files without RLS restrictions
-- =====================================================

-- Disable Row Level Security for storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify the change
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

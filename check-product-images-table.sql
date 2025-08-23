-- Check and Update Product Images Table
-- Run this in your Supabase SQL Editor to verify the table structure

-- First, let's check if the table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_images' 
ORDER BY ordinal_position;

-- Check if indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'product_images';

-- Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'product_images';

-- Check if RLS policies exist
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'product_images';

-- If the table exists but is missing any components, run these:

-- Add missing indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(product_id, image_order);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary);

-- Enable RLS if not already enabled
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create missing RLS policies (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_images' AND policyname = 'Allow public read access to product images'
    ) THEN
        CREATE POLICY "Allow public read access to product images" ON product_images
          FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_images' AND policyname = 'Allow authenticated users to insert product images'
    ) THEN
        CREATE POLICY "Allow authenticated users to insert product images" ON product_images
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_images' AND policyname = 'Allow authenticated users to update product images'
    ) THEN
        CREATE POLICY "Allow authenticated users to update product images" ON product_images
          FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_images' AND policyname = 'Allow authenticated users to delete product images'
    ) THEN
        CREATE POLICY "Allow authenticated users to delete product images" ON product_images
          FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Create missing functions and triggers (if they don't exist)
CREATE OR REPLACE FUNCTION set_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first image for the product, make it primary
  IF NOT EXISTS (
    SELECT 1 FROM product_images 
    WHERE product_id = NEW.product_id AND is_primary = true
  ) THEN
    NEW.is_primary = true;
  END IF;
  
  -- If this image is being set as primary, unset others
  IF NEW.is_primary = true THEN
    UPDATE product_images 
    SET is_primary = false 
    WHERE product_id = NEW.product_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_image_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Set order to the next available number for this product
  IF NEW.image_order = 0 THEN
    SELECT COALESCE(MAX(image_order), 0) + 1 INTO NEW.image_order
    FROM product_images
    WHERE product_id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers if they don't exist
DROP TRIGGER IF EXISTS trigger_set_primary_image ON product_images;
CREATE TRIGGER trigger_set_primary_image
  BEFORE INSERT OR UPDATE ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION set_primary_image();

DROP TRIGGER IF EXISTS trigger_set_image_order ON product_images;
CREATE TRIGGER trigger_set_image_order
  BEFORE INSERT ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION set_image_order();

-- Fix Product Images Table Structure
-- Run this in your Supabase SQL Editor to add missing columns

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add image_order column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_images' AND column_name = 'image_order'
    ) THEN
        ALTER TABLE product_images ADD COLUMN image_order INTEGER DEFAULT 0;
        RAISE NOTICE 'Added image_order column';
    ELSE
        RAISE NOTICE 'image_order column already exists';
    END IF;

    -- Add is_primary column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_images' AND column_name = 'is_primary'
    ) THEN
        ALTER TABLE product_images ADD COLUMN is_primary BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_primary column';
    ELSE
        RAISE NOTICE 'is_primary column already exists';
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_images' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE product_images ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    ELSE
        RAISE NOTICE 'created_at column already exists';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_images' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE product_images ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;
END $$;

-- Update existing records to set proper values
UPDATE product_images 
SET 
    image_order = 1,
    is_primary = true,
    created_at = NOW(),
    updated_at = NOW()
WHERE image_order = 0 OR image_order IS NULL;

-- Set the first image of each product as primary
UPDATE product_images 
SET is_primary = true 
WHERE id IN (
    SELECT DISTINCT ON (product_id) id 
    FROM product_images 
    ORDER BY product_id, created_at ASC
);

-- Set other images as not primary
UPDATE product_images 
SET is_primary = false 
WHERE id NOT IN (
    SELECT DISTINCT ON (product_id) id 
    FROM product_images 
    ORDER BY product_id, created_at ASC
);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(product_id, image_order);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary);

-- Enable RLS if not already enabled
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create missing RLS policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_images' AND policyname = 'Allow public read access to product images'
    ) THEN
        CREATE POLICY "Allow public read access to product images" ON product_images
          FOR SELECT USING (true);
        RAISE NOTICE 'Created public read policy';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_images' AND policyname = 'Allow authenticated users to insert product images'
    ) THEN
        CREATE POLICY "Allow authenticated users to insert product images" ON product_images
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE 'Created insert policy';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_images' AND policyname = 'Allow authenticated users to update product images'
    ) THEN
        CREATE POLICY "Allow authenticated users to update product images" ON product_images
          FOR UPDATE USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Created update policy';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_images' AND policyname = 'Allow authenticated users to delete product images'
    ) THEN
        CREATE POLICY "Allow authenticated users to delete product images" ON product_images
          FOR DELETE USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Created delete policy';
    END IF;
END $$;

-- Create or replace functions
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

-- Create triggers
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

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_images' 
ORDER BY ordinal_position;

-- Show current data
SELECT 
    id,
    product_id,
    image_url,
    image_order,
    is_primary,
    created_at,
    updated_at
FROM product_images 
ORDER BY product_id, image_order;

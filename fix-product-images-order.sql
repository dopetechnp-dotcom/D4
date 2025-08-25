-- Fix Product Images Display Order
-- Run this in your Supabase SQL Editor to fix the ordering issue

-- First, let's see the current state
SELECT 
    id, 
    product_id, 
    image_url, 
    display_order, 
    is_primary, 
    created_at 
FROM product_images 
ORDER BY product_id, created_at;

-- Fix the display_order for all existing images
WITH ordered_images AS (
    SELECT 
        id,
        product_id,
        ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at ASC) as new_order
    FROM product_images
)
UPDATE product_images 
SET display_order = ordered_images.new_order
FROM ordered_images
WHERE product_images.id = ordered_images.id;

-- Set the first image of each product as primary
UPDATE product_images 
SET is_primary = true 
WHERE id IN (
    SELECT DISTINCT ON (product_id) id 
    FROM product_images 
    ORDER BY product_id, display_order ASC
);

-- Set other images as not primary
UPDATE product_images 
SET is_primary = false 
WHERE id NOT IN (
    SELECT DISTINCT ON (product_id) id 
    FROM product_images 
    ORDER BY product_id, display_order ASC
);

-- Recreate the trigger function to ensure it works correctly
CREATE OR REPLACE FUNCTION set_display_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Set order to the next available number for this product
    IF NEW.display_order = 0 OR NEW.display_order IS NULL THEN
        SELECT COALESCE(MAX(display_order), 0) + 1 INTO NEW.display_order
        FROM product_images
        WHERE product_id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_set_display_order ON product_images;
CREATE TRIGGER trigger_set_display_order
    BEFORE INSERT ON product_images
    FOR EACH ROW
    EXECUTE FUNCTION set_display_order();

-- Verify the fix
SELECT 
    id, 
    product_id, 
    image_url, 
    display_order, 
    is_primary, 
    created_at 
FROM product_images 
ORDER BY product_id, display_order;

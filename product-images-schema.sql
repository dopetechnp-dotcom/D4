-- Product Images Table for Multiple Images Support
-- Run this in your Supabase SQL Editor

-- Create product_images table
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_order ON product_images(product_id, image_order);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary);

-- Enable Row Level Security
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_images
CREATE POLICY "Allow public read access to product images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert product images" ON product_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update product images" ON product_images
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete product images" ON product_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create a function to automatically set the first image as primary
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

-- Create trigger to automatically manage primary images
CREATE TRIGGER trigger_set_primary_image
  BEFORE INSERT OR UPDATE ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION set_primary_image();

-- Create a function to update image_order when inserting
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

-- Create trigger to automatically set image order
CREATE TRIGGER trigger_set_image_order
  BEFORE INSERT ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION set_image_order();

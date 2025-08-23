-- Add color column to products table
ALTER TABLE products ADD COLUMN color VARCHAR(100);

-- Add comment to document the column
COMMENT ON COLUMN products.color IS 'Product color - can be null/empty to hide the field';

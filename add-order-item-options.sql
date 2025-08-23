-- Add color and features columns to order_items table
ALTER TABLE order_items ADD COLUMN selected_color VARCHAR(100);
ALTER TABLE order_items ADD COLUMN selected_features JSONB;

-- Add comments to document the columns
COMMENT ON COLUMN order_items.selected_color IS 'Customer selected color for this order item';
COMMENT ON COLUMN order_items.selected_features IS 'Customer selected features for this order item (JSON array)';

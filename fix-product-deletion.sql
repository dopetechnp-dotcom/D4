-- Fix Product Deletion Issues
-- Run this in your Supabase SQL Editor to enable proper cascading deletes

-- First, drop the existing foreign key constraint
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Recreate the foreign key constraint with CASCADE DELETE
ALTER TABLE order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE CASCADE;

-- Add a comment to document the change
COMMENT ON CONSTRAINT order_items_product_id_fkey ON order_items IS 'Cascade delete order items when product is deleted';

-- Verify the constraint (fixed query)
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.tab--le_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='order_items' 
    AND kcu.column_name='product_id';

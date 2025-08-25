-- Add show_content column to hero_images table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/aizgswoelfdkhyosgvzu/sql

-- Add the show_content column if it doesn't exist
ALTER TABLE hero_images 
ADD COLUMN IF NOT EXISTS show_content BOOLEAN DEFAULT true;

-- Update existing records to have show_content = true
UPDATE hero_images 
SET show_content = true 
WHERE show_content IS NULL;

-- Make sure the column is not nullable and has a default value
ALTER TABLE hero_images 
ALTER COLUMN show_content SET NOT NULL,
ALTER COLUMN show_content SET DEFAULT true;

-- Add a comment to document the column
COMMENT ON COLUMN hero_images.show_content IS 'Controls whether text content (title, subtitle, description) is displayed on the carousel slide';

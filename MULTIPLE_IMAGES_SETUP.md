# Multiple Product Images Setup Guide

This guide will help you set up the multiple product images feature for your DopeTech e-commerce site.

## 🗄️ Database Setup

### Step 1: Create the Product Images Table

Run the following SQL in your Supabase SQL Editor:

```sql
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
```

### Step 2: Migrate Existing Products (Optional)

If you have existing products with single images, you can migrate them to the new system:

```sql
-- Migrate existing product images to the new table
INSERT INTO product_images (product_id, image_url, image_order, is_primary)
SELECT 
  id as product_id,
  image_url,
  1 as image_order,
  true as is_primary
FROM products 
WHERE image_url IS NOT NULL AND image_url != '';
```

## 🎯 Features Added

### Admin Panel Features:
1. **Multiple Image Upload**: Upload multiple images per product
2. **Image Management**: 
   - Set primary image (used as thumbnail)
   - Reorder images using up/down arrows
   - Delete individual images
   - Visual indicators for primary images
3. **Drag & Drop Interface**: Modern, intuitive image management
4. **Real-time Preview**: See changes immediately

### Frontend Features:
1. **Smart Thumbnail Selection**: Automatically uses the first/primary image as thumbnail
2. **Product Detail Gallery**: Shows all product images with thumbnail navigation
3. **Responsive Design**: Works perfectly on mobile and desktop
4. **Fallback Support**: Gracefully handles products with single images

## 🔧 How to Use

### For Admins:

1. **Adding a New Product**:
   - Go to Admin Panel → Products → Add Product
   - Fill in product details
   - Upload multiple images using the "Product Images" section
   - The first image uploaded will automatically become the primary image
   - Click "Add Product" to save

2. **Editing an Existing Product**:
   - Go to Admin Panel → Products → Click "Edit" on any product
   - Scroll down to the "Product Images" section
   - Upload additional images or manage existing ones
   - Use the star icon to set a different image as primary
   - Use up/down arrows to reorder images
   - Click "Save Changes" to update

### For Users:

1. **Product Listings**: Products will show their primary image as thumbnail
2. **Product Details**: Users can view all product images and switch between them
3. **Mobile Experience**: Touch-friendly image gallery on mobile devices

## 🚀 Technical Implementation

### Database Schema:
- `product_images` table with foreign key to `products`
- Automatic primary image management
- Image ordering system
- Row Level Security (RLS) policies

### Code Changes:
- Updated `Product` interface to include `images` array
- New `ProductImageManager` component for admin interface
- Utility functions for image handling
- Updated frontend to use primary images as thumbnails
- Enhanced product detail page with image gallery

### File Structure:
```
├── lib/products-data.ts (Updated with image functions)
├── components/product-image-manager.tsx (New component)
├── app/dopetechadmin/page.tsx (Updated admin interface)
├── app/page.tsx (Updated frontend)
├── app/product/[id]/product-page-client.tsx (Updated product detail)
└── product-images-schema.sql (Database setup)
```

## 🔒 Security Features

- Row Level Security (RLS) enabled on `product_images` table
- Public read access for product images
- Authenticated user access for admin operations
- Automatic cleanup when products are deleted (CASCADE)

## 📱 Mobile Optimization

- Touch-friendly image management interface
- Responsive image galleries
- Optimized loading with lazy loading
- Smooth animations and transitions

## 🎨 UI/UX Enhancements

- Modern, glassmorphism design
- Hover effects and animations
- Clear visual indicators for primary images
- Intuitive drag-and-drop interface
- Progress indicators for uploads

## 🔄 Backward Compatibility

- Existing products with single images continue to work
- Fallback to `image_url` field if no images array
- Gradual migration path for existing data

## 🐛 Troubleshooting

### Common Issues:

1. **Images not uploading**:
   - Check Supabase storage bucket permissions
   - Verify RLS policies are correctly set
   - Check browser console for errors

2. **Primary image not updating**:
   - Ensure triggers are properly created
   - Check database logs for trigger errors

3. **Images not displaying**:
   - Verify image URLs are accessible
   - Check CORS settings in Supabase
   - Ensure proper fallback logic

### Support:
If you encounter any issues, check the browser console for error messages and ensure all database setup steps have been completed correctly.

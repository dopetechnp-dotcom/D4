-- =====================================================
-- DopeTech Database Structure Setup
-- This script creates the complete database structure
-- for the DopeTech e-commerce application
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  description TEXT,
  category VARCHAR(100),
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  discount DECIMAL(5,2) DEFAULT 0,
  hidden_on_home BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_address TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HERO_IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hero_images (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- QR_CODES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS qr_codes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  qr_code_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_hidden_on_home ON products(hidden_on_home);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Hero images indexes
CREATE INDEX IF NOT EXISTS idx_hero_images_is_active ON hero_images(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_images_order_index ON hero_images(order_index);

-- QR codes indexes
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_active ON qr_codes(is_active);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products can be created by authenticated users" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Products can be updated by authenticated users" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Products can be deleted by authenticated users" ON products
  FOR DELETE USING (true);

-- Orders policies
CREATE POLICY "Orders can be created by everyone" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders can be viewed by everyone" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Orders can be updated by authenticated users" ON orders
  FOR UPDATE USING (true);

CREATE POLICY "Orders can be deleted by authenticated users" ON orders
  FOR DELETE USING (true);

-- Order items policies
CREATE POLICY "Order items can be created by everyone" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Order items can be viewed by everyone" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Order items can be updated by authenticated users" ON order_items
  FOR UPDATE USING (true);

CREATE POLICY "Order items can be deleted by authenticated users" ON order_items
  FOR DELETE USING (true);

-- Hero images policies
CREATE POLICY "Hero images are viewable by everyone" ON hero_images
  FOR SELECT USING (true);

CREATE POLICY "Hero images can be managed by authenticated users" ON hero_images
  FOR ALL USING (true);

-- QR codes policies
CREATE POLICY "QR codes are viewable by everyone" ON qr_codes
  FOR SELECT USING (true);

CREATE POLICY "QR codes can be managed by authenticated users" ON qr_codes
  FOR ALL USING (true);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_images_updated_at 
  BEFORE UPDATE ON hero_images 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at 
  BEFORE UPDATE ON qr_codes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'DOPE-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || 
                       UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically generate order number
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- STORAGE POLICIES (These need to be set up manually in Supabase Dashboard)
-- =====================================================

/*
STORAGE BUCKETS TO CREATE:
1. receipts (Private)
2. hero-images (Public)
3. product-images (Public)
4. qr-codes (Public)

STORAGE POLICIES TO SET UP:

For receipts bucket:
- Policy: "Authenticated users can upload"
  - Operation: INSERT
  - Target roles: authenticated
  - Definition: true
- Policy: "Public can download"
  - Operation: SELECT
  - Target roles: public
  - Definition: true

For public buckets (hero-images, product-images, qr-codes):
- Policy: "Public can read"
  - Operation: SELECT
  - Target roles: public
  - Definition: true
- Policy: "Authenticated users can upload"
  - Operation: INSERT
  - Target roles: authenticated
  - Definition: true
*/

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Database structure setup completed successfully!';
    RAISE NOTICE 'Remember to:';
    RAISE NOTICE '1. Create storage buckets: receipts, hero-images, product-images, qr-codes';
    RAISE NOTICE '2. Set up storage policies for each bucket';
    RAISE NOTICE '3. Test the application functionality';
END $$;

-- =====================================================
-- Complete DopeTech Database Schema (FIXED)
-- Based on working Supabase project
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  description TEXT,
  category VARCHAR,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  features JSONB,
  rating INTEGER DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  hidden_on_home BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  color VARCHAR
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR NOT NULL UNIQUE,
  customer_name VARCHAR NOT NULL,
  customer_email VARCHAR NOT NULL,
  customer_phone VARCHAR,
  customer_city VARCHAR,
  customer_state VARCHAR,
  customer_zip_code VARCHAR,
  customer_address TEXT,
  total_amount NUMERIC NOT NULL,
  payment_option VARCHAR DEFAULT 'full',
  payment_status VARCHAR DEFAULT 'pending',
  order_status VARCHAR DEFAULT 'processing',
  receipt_url TEXT,
  receipt_file_name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- ORDER_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES public.orders(id),
  product_id INTEGER REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  selected_color VARCHAR,
  selected_features JSONB
);

-- =====================================================
-- HERO_IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hero_images (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  subtitle VARCHAR,
  description TEXT,
  image_url TEXT NOT NULL,
  image_file_name VARCHAR,
  button_text VARCHAR,
  button_link VARCHAR,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  show_content BOOLEAN DEFAULT true
);

-- =====================================================
-- CATEGORY_BANNERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.category_banners (
  id SERIAL PRIMARY KEY,
  category_id VARCHAR NOT NULL,
  title VARCHAR,
  subtitle VARCHAR,
  image_url TEXT NOT NULL,
  image_file_name VARCHAR,
  product_link VARCHAR,
  banner_size VARCHAR NOT NULL DEFAULT 'horizontal',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- PRODUCT_IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES public.products(id),
  image_url TEXT NOT NULL,
  file_name VARCHAR NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  image_name VARCHAR,
  sort_order INTEGER DEFAULT 0,
  image_order INTEGER DEFAULT 0
);

-- =====================================================
-- PAYMENT_QR_CODES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_qr_codes (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  qr_code_url TEXT NOT NULL,
  qr_code_file_name VARCHAR,
  payment_method VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- QR_CODES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_hidden_on_home ON public.products(hidden_on_home);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Hero images indexes
CREATE INDEX IF NOT EXISTS idx_hero_images_display_order ON public.hero_images(display_order);
CREATE INDEX IF NOT EXISTS idx_hero_images_is_active ON public.hero_images(is_active);

-- Category banners indexes
CREATE INDEX IF NOT EXISTS idx_category_banners_category_id ON public.category_banners(category_id);
CREATE INDEX IF NOT EXISTS idx_category_banners_display_order ON public.category_banners(display_order);
CREATE INDEX IF NOT EXISTS idx_category_banners_is_active ON public.category_banners(is_active);

-- Product images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON public.product_images(display_order);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON public.product_images(is_primary);

-- Payment QR codes indexes
CREATE INDEX IF NOT EXISTS idx_payment_qr_codes_payment_method ON public.payment_qr_codes(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_qr_codes_sort_order ON public.payment_qr_codes(sort_order);
CREATE INDEX IF NOT EXISTS idx_payment_qr_codes_is_active ON public.payment_qr_codes(is_active);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Products are insertable by authenticated users" ON public.products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products are updatable by authenticated users" ON public.products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Products are deletable by authenticated users" ON public.products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Orders are viewable by everyone" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "Orders are insertable by everyone" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders are updatable by authenticated users" ON public.orders
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Orders are deletable by authenticated users" ON public.orders
  FOR DELETE USING (auth.role() = 'authenticated');

-- Order items policies
CREATE POLICY "Order items are viewable by everyone" ON public.order_items
  FOR SELECT USING (true);

CREATE POLICY "Order items are insertable by everyone" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Order items are updatable by authenticated users" ON public.order_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Order items are deletable by authenticated users" ON public.order_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- Hero images policies
CREATE POLICY "Hero images are viewable by everyone" ON public.hero_images
  FOR SELECT USING (true);

CREATE POLICY "Hero images are insertable by authenticated users" ON public.hero_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Hero images are updatable by authenticated users" ON public.hero_images
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Hero images are deletable by authenticated users" ON public.hero_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- Category banners policies
CREATE POLICY "Category banners are viewable by everyone" ON public.category_banners
  FOR SELECT USING (true);

CREATE POLICY "Category banners are insertable by authenticated users" ON public.category_banners
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Category banners are updatable by authenticated users" ON public.category_banners
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Category banners are deletable by authenticated users" ON public.category_banners
  FOR DELETE USING (auth.role() = 'authenticated');

-- Product images policies
CREATE POLICY "Product images are viewable by everyone" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Product images are insertable by authenticated users" ON public.product_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Product images are updatable by authenticated users" ON public.product_images
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Product images are deletable by authenticated users" ON public.product_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- Payment QR codes policies
CREATE POLICY "Payment QR codes are viewable by everyone" ON public.payment_qr_codes
  FOR SELECT USING (true);

CREATE POLICY "Payment QR codes are insertable by authenticated users" ON public.payment_qr_codes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Payment QR codes are updatable by authenticated users" ON public.payment_qr_codes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Payment QR codes are deletable by authenticated users" ON public.payment_qr_codes
  FOR DELETE USING (auth.role() = 'authenticated');

-- QR codes policies
CREATE POLICY "QR codes are viewable by everyone" ON public.qr_codes
  FOR SELECT USING (true);

CREATE POLICY "QR codes are insertable by authenticated users" ON public.qr_codes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "QR codes are updatable by authenticated users" ON public.qr_codes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "QR codes are deletable by authenticated users" ON public.qr_codes
  FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_images_updated_at BEFORE UPDATE ON public.hero_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_banners_updated_at BEFORE UPDATE ON public.category_banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_images_updated_at BEFORE UPDATE ON public.product_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_qr_codes_updated_at BEFORE UPDATE ON public.payment_qr_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at BEFORE UPDATE ON public.qr_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Setup Complete!
-- =====================================================

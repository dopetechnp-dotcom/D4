-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for admin access)
CREATE POLICY "Allow all operations on qr_codes" ON qr_codes
  FOR ALL USING (true);

-- Create storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for QR codes bucket
CREATE POLICY "Public access to qr-codes bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'qr-codes');

CREATE POLICY "Authenticated users can upload to qr-codes bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update qr-codes bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete from qr-codes bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

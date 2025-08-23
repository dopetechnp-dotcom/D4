const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupQRCodes() {
  console.log('🚀 Setting up QR Codes system...')

  try {
    // 1. Create qr_codes table
    console.log('📋 Creating qr_codes table...')
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS qr_codes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          image_url TEXT NOT NULL,
          is_active BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (tableError) {
      console.error('❌ Error creating table:', tableError)
      return
    }

    console.log('✅ qr_codes table created successfully')

    // 2. Create indexes
    console.log('📊 Creating indexes...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(is_active);
        CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at DESC);
      `
    })

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError)
    } else {
      console.log('✅ Indexes created successfully')
    }

    // 3. Enable RLS
    console.log('🔒 Enabling Row Level Security...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;'
    })

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError)
    } else {
      console.log('✅ RLS enabled successfully')
    }

    // 4. Create RLS policy
    console.log('📝 Creating RLS policy...')
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Allow all operations on qr_codes" ON qr_codes
          FOR ALL USING (true);
      `
    })

    if (policyError) {
      console.error('❌ Error creating policy:', policyError)
    } else {
      console.log('✅ RLS policy created successfully')
    }

    // 5. Create storage bucket
    console.log('🪣 Creating storage bucket...')
    const { error: bucketError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('qr-codes', 'qr-codes', true)
        ON CONFLICT (id) DO NOTHING;
      `
    })

    if (bucketError) {
      console.error('❌ Error creating bucket:', bucketError)
    } else {
      console.log('✅ Storage bucket created successfully')
    }

    // 6. Create storage policies
    console.log('🔐 Creating storage policies...')
    const { error: storagePolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Public access to qr-codes bucket" ON storage.objects
          FOR SELECT USING (bucket_id = 'qr-codes');

        CREATE POLICY "Authenticated users can upload to qr-codes bucket" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

        CREATE POLICY "Authenticated users can update qr-codes bucket" ON storage.objects
          FOR UPDATE USING (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

        CREATE POLICY "Authenticated users can delete from qr-codes bucket" ON storage.objects
          FOR DELETE USING (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');
      `
    })

    if (storagePolicyError) {
      console.error('❌ Error creating storage policies:', storagePolicyError)
    } else {
      console.log('✅ Storage policies created successfully')
    }

    console.log('🎉 QR Codes system setup completed successfully!')
    console.log('')
    console.log('📝 Next steps:')
    console.log('1. Go to your admin panel at /admin')
    console.log('2. Navigate to the "QR Codes" tab')
    console.log('3. Upload your payment QR code image')
    console.log('4. Set it as active')
    console.log('5. The QR code will now appear in the checkout process')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// Alternative setup using direct SQL if RPC doesn't work
async function setupQRCodesDirect() {
  console.log('🚀 Setting up QR Codes system (direct SQL)...')

  try {
    // Create table using direct SQL
    const { error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'qr_codes')
      .single()

    if (tableError && tableError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('📋 Creating qr_codes table...')
      
      // Note: This approach might not work due to RLS restrictions
      // You may need to run the SQL directly in Supabase dashboard
      console.log('⚠️  Please run the following SQL in your Supabase SQL editor:')
      console.log('')
      console.log(`
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
      `)
      console.log('')
      console.log('After running the SQL, you can use the admin panel to upload QR codes.')
    } else {
      console.log('✅ qr_codes table already exists')
    }

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// Try the RPC method first, fallback to direct SQL
setupQRCodes().catch(() => {
  console.log('🔄 RPC method failed, trying direct SQL approach...')
  setupQRCodesDirect()
})

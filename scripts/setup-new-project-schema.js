const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// New Supabase Configuration
const NEW_SUPABASE_URL = 'https://flrcwmmdveylmcbjuwfc.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA';

// Create Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

async function setupDatabaseSchema() {
  console.log('🗄️  Setting up database schema...');
  
  try {
    // Read the complete schema setup SQL
    const schemaPath = path.join(__dirname, '..', 'complete-supabase-setup.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    
    console.log('📄 Schema SQL loaded successfully');
    console.log('⚠️  Please run the following SQL in your Supabase SQL Editor:');
    console.log('='.repeat(80));
    console.log(schemaSQL);
    console.log('='.repeat(80));
    
    console.log('\n📋 Instructions:');
    console.log('1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/flrcwmmdveylmcbjuwfc');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL above');
    console.log('4. Click "Run" to execute the schema setup');
    console.log('5. Wait for the schema to be created');
    console.log('6. Then run the migration script again');
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up schema:', error);
    return false;
  }
}

async function createStorageBuckets() {
  console.log('\n📦 Creating storage buckets...');
  
  const buckets = [
    { name: 'receipts', public: false },
    { name: 'hero-images', public: true },
    { name: 'product-images', public: true },
    { name: 'qr-codes', public: true }
  ];
  
  console.log('⚠️  Please create the following storage buckets manually:');
  
  for (const bucket of buckets) {
    console.log(`\n📦 Bucket: ${bucket.name}`);
    console.log(`   - Go to Storage in your Supabase dashboard`);
    console.log(`   - Click "Create bucket"`);
    console.log(`   - Name: ${bucket.name}`);
    console.log(`   - Public: ${bucket.public ? 'Yes' : 'No'}`);
    console.log(`   - Click "Create bucket"`);
  }
  
  console.log('\n📋 Storage Policies Setup:');
  console.log('After creating buckets, set up these policies:');
  
  console.log('\n🔒 For receipts bucket:');
  console.log('- Policy: "Authenticated users can upload"');
  console.log('  - Operation: INSERT');
  console.log('  - Target roles: authenticated');
  console.log('  - Definition: true');
  console.log('- Policy: "Public can download"');
  console.log('  - Operation: SELECT');
  console.log('  - Target roles: public');
  console.log('  - Definition: true');
  
  console.log('\n🔒 For public buckets (hero-images, product-images, qr-codes):');
  console.log('- Policy: "Public can read"');
  console.log('  - Operation: SELECT');
  console.log('  - Target roles: public');
  console.log('  - Definition: true');
  console.log('- Policy: "Authenticated users can upload"');
  console.log('  - Operation: INSERT');
  console.log('  - Target roles: authenticated');
  console.log('  - Definition: true');
  
  return true;
}

async function testConnection() {
  console.log('\n🔗 Testing connection to new Supabase project...');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection to new Supabase project successful');
    return true;
    
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
}

async function runSetup() {
  console.log('🚀 Setting up new Supabase project...');
  console.log('='.repeat(50));
  
  try {
    // Test connection first
    const connectionSuccess = await testConnection();
    if (!connectionSuccess) {
      console.log('\n⚠️  Database schema not set up yet. Setting up now...');
    }
    
    // Setup database schema
    await setupDatabaseSchema();
    
    // Setup storage buckets
    await createStorageBuckets();
    
    console.log('\n🎉 Setup instructions completed!');
    console.log('📋 Next steps:');
    console.log('1. Follow the schema setup instructions above');
    console.log('2. Create the storage buckets');
    console.log('3. Set up storage policies');
    console.log('4. Run the migration script again: node scripts/migrate-supabase-complete.js');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
if (require.main === module) {
  runSetup();
}

module.exports = { runSetup };

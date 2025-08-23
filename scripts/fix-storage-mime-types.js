const { createClient } = require('@supabase/supabase-js');

// New Supabase Configuration
const NEW_SUPABASE_URL = 'https://flrcwmmdveylmcbjuwfc.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA';

// Create Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

const buckets = [
  'receipts',
  'hero-images', 
  'product-images',
  'qr-codes'
];

async function fixStorageMimeTypes() {
  console.log('🔧 Fixing Storage MIME Type Restrictions');
  console.log('='.repeat(50));

  for (const bucketName of buckets) {
    console.log(`\n📁 Updating bucket: ${bucketName}`);
    
    try {
      // Update bucket configuration to allow all file types
      const { data: bucketData, error: bucketError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
        allowedMimeTypes: null, // Allow all MIME types
        fileSizeLimit: 52428800 // 50MB
      });

      if (bucketError) {
        console.log(`   ❌ Error updating bucket: ${bucketError.message}`);
      } else {
        console.log(`   ✅ Bucket '${bucketName}' updated successfully`);
      }

    } catch (error) {
      console.log(`   ❌ Error with bucket '${bucketName}': ${error.message}`);
    }
  }

  console.log('\n✅ Storage MIME type fix complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Test file upload in your application');
  console.log('2. The MIME type error should be resolved');
}

fixStorageMimeTypes().catch(console.error);

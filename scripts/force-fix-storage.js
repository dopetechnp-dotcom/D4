const { createClient } = require('@supabase/supabase-js');

// New Supabase Configuration
const NEW_SUPABASE_URL = 'https://flrcwmmdveylmcbjuwfc.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA';

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

const buckets = [
  'receipts',
  'hero-images', 
  'product-images',
  'qr-codes'
];

async function forceFixStorage() {
  console.log('🔧 Force Fixing Storage Policies');
  console.log('='.repeat(50));

  try {
    // First, let's try to completely reset the storage buckets
    for (const bucketName of buckets) {
      console.log(`\n📁 Resetting bucket: ${bucketName}`);
      
      try {
        // Delete and recreate the bucket
        const { error: deleteError } = await supabase.storage.deleteBucket(bucketName);
        
        if (deleteError && !deleteError.message.includes('not found')) {
          console.log(`   ⚠️  Could not delete bucket: ${deleteError.message}`);
        } else {
          console.log(`   ✅ Deleted bucket: ${bucketName}`);
        }

        // Recreate the bucket with proper settings
        const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: null, // Allow all MIME types
          fileSizeLimit: 52428800 // 50MB
        });

        if (bucketError) {
          if (bucketError.message.includes('already exists')) {
            console.log(`   ✅ Bucket '${bucketName}' already exists`);
          } else {
            console.log(`   ❌ Error creating bucket: ${bucketError.message}`);
          }
        } else {
          console.log(`   ✅ Created bucket: ${bucketName}`);
        }

      } catch (error) {
        console.log(`   ❌ Error with bucket '${bucketName}': ${error.message}`);
      }
    }

    // Now let's test uploads with the service role key
    console.log('\n🧪 Testing uploads with service role key...');
    
    for (const bucketName of buckets) {
      console.log(`\n📤 Testing upload to ${bucketName}...`);
      
      try {
        // Create a test file
        const testContent = 'test file content';
        const testFile = new Blob([testContent], { type: 'text/plain' });
        const fileName = `test-${Date.now()}.txt`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, testFile);

        if (uploadError) {
          console.log(`❌ Upload to ${bucketName} failed:`, uploadError.message);
        } else {
          console.log(`✅ Upload to ${bucketName} successful`);
          
          // Clean up test file
          await supabase.storage.from(bucketName).remove([fileName]);
        }
      } catch (error) {
        console.log(`❌ Error testing ${bucketName}:`, error.message);
      }
    }

    console.log('\n✅ Storage reset complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Clear your browser cache');
    console.log('3. Try uploading an image again');

  } catch (error) {
    console.log('❌ Error in forceFixStorage:', error.message);
  }
}

forceFixStorage().catch(console.error);

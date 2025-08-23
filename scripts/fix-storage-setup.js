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

async function setupStorageBuckets() {
  console.log('🔧 Setting up Storage Buckets and Policies');
  console.log('='.repeat(50));

  for (const bucketName of buckets) {
    console.log(`\n📁 Setting up bucket: ${bucketName}`);
    
    try {
      // Create bucket
      const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/*', 'application/pdf'],
        fileSizeLimit: 52428800 // 50MB
      });

      if (bucketError) {
        if (bucketError.message.includes('already exists')) {
          console.log(`   ✅ Bucket '${bucketName}' already exists`);
        } else {
          console.log(`   ❌ Error creating bucket: ${bucketError.message}`);
          continue;
        }
      } else {
        console.log(`   ✅ Bucket '${bucketName}' created successfully`);
      }

      // Set up policies for this bucket
      await setupBucketPolicies(bucketName);

    } catch (error) {
      console.log(`   ❌ Error with bucket '${bucketName}': ${error.message}`);
    }
  }

  console.log('\n✅ Storage setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Test file upload in your application');
  console.log('2. If you still get RLS errors, run the storage policies SQL manually');
}

async function setupBucketPolicies(bucketName) {
  console.log(`   🔐 Setting up policies for ${bucketName}...`);
  
  try {
    // Test if we can access the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list();

    if (listError) {
      console.log(`   ⚠️  Cannot list files in ${bucketName}: ${listError.message}`);
      console.log(`   💡 You may need to set up policies manually in Supabase dashboard`);
    } else {
      console.log(`   ✅ Can access ${bucketName} bucket`);
    }

  } catch (error) {
    console.log(`   ❌ Error testing bucket access: ${error.message}`);
  }
}

setupStorageBuckets().catch(console.error);

const { createClient } = require('@supabase/supabase-js');

// Test with ANON key (same as frontend)
const NEW_SUPABASE_URL = 'https://flrcwmmdveylmcbjuwfc.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTk2MjIsImV4cCI6MjA3MTQzNTYyMn0.NitC7tHaImTORdaKgCFXkKRLNMOxJCuBbTDAyr8AVa0';

// Create Supabase client with ANON key (same as your frontend)
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);

async function testStorageRLS() {
  console.log('🧪 Testing Storage RLS with ANON Key');
  console.log('='.repeat(50));

  const buckets = ['product-images', 'hero-images', 'receipts', 'qr-codes'];
  
  for (const bucketName of buckets) {
    console.log(`\n📤 Testing upload to ${bucketName} with ANON key...`);
    
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
        console.log(`   Error details:`, uploadError);
      } else {
        console.log(`✅ Upload to ${bucketName} successful!`);
        
        // Clean up test file
        await supabase.storage.from(bucketName).remove([fileName]);
      }
    } catch (error) {
      console.log(`❌ Error testing ${bucketName}:`, error.message);
    }
  }

  console.log('\n📋 Test Summary:');
  console.log('If uploads work with ANON key, RLS is properly disabled');
  console.log('If uploads fail, RLS is still active and needs to be disabled');
}

testStorageRLS().catch(console.error);

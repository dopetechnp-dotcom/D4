const { createClient } = require('@supabase/supabase-js');

// New Supabase Configuration
const NEW_SUPABASE_URL = 'https://flrcwmmdveylmcbjuwfc.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA';

// Create Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

async function checkStoragePolicies() {
  console.log('🔍 Checking Storage Policies');
  console.log('='.repeat(50));

  try {
    // Check if RLS is enabled on storage.objects
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'storage' AND tablename = 'objects'
      `
    });

    if (rlsError) {
      console.log('❌ Error checking RLS:', rlsError.message);
    } else {
      console.log('📋 RLS Status:', rlsData);
    }

    // Check existing policies
    const { data: policiesData, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        ORDER BY policyname
      `
    });

    if (policiesError) {
      console.log('❌ Error checking policies:', policiesError.message);
    } else {
      console.log('\n📋 Current Storage Policies:');
      console.log('='.repeat(30));
      
      if (policiesData && policiesData.length > 0) {
        policiesData.forEach(policy => {
          console.log(`✅ ${policy.policyname} (${policy.cmd})`);
        });
      } else {
        console.log('❌ No policies found');
      }
    }

    // Test file upload with different buckets
    const buckets = ['product-images', 'hero-images', 'receipts', 'qr-codes'];
    
    for (const bucket of buckets) {
      console.log(`\n🧪 Testing upload to ${bucket}...`);
      
      try {
        // Create a test file
        const testContent = 'test file content';
        const testFile = new Blob([testContent], { type: 'text/plain' });
        const fileName = `test-${Date.now()}.txt`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, testFile);

        if (uploadError) {
          console.log(`❌ Upload to ${bucket} failed:`, uploadError.message);
        } else {
          console.log(`✅ Upload to ${bucket} successful`);
          
          // Clean up test file
          await supabase.storage.from(bucket).remove([fileName]);
        }
      } catch (error) {
        console.log(`❌ Error testing ${bucket}:`, error.message);
      }
    }

  } catch (error) {
    console.log('❌ Error in checkStoragePolicies:', error.message);
  }
}

checkStoragePolicies().catch(console.error);

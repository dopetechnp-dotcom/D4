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

async function setupStoragePolicies() {
  console.log('🔧 Setting up Storage Policies');
  console.log('='.repeat(50));

  for (const bucketName of buckets) {
    console.log(`\n📁 Setting up policies for bucket: ${bucketName}`);
    
    try {
      // 1. SELECT Policy - Public Access
      const selectPolicy = `
        CREATE POLICY "Public Access" ON storage.objects 
        FOR SELECT USING (bucket_id = '${bucketName}');
      `;
      
      // 2. INSERT Policy - Authenticated users can upload
      const insertPolicy = `
        CREATE POLICY "Authenticated users can upload" ON storage.objects 
        FOR INSERT WITH CHECK (bucket_id = '${bucketName}' AND auth.role() = 'authenticated');
      `;
      
      // 3. UPDATE Policy - Users can update own files
      const updatePolicy = `
        CREATE POLICY "Users can update own files" ON storage.objects 
        FOR UPDATE USING (bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1]);
      `;
      
      // 4. DELETE Policy - Users can delete own files
      const deletePolicy = `
        CREATE POLICY "Users can delete own files" ON storage.objects 
        FOR DELETE USING (bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1]);
      `;

      // Execute policies
      const policies = [selectPolicy, insertPolicy, updatePolicy, deletePolicy];
      
      for (let i = 0; i < policies.length; i++) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: policies[i] });
          if (error) {
            console.log(`   ⚠️  Policy ${i + 1} already exists or failed: ${error.message}`);
          } else {
            console.log(`   ✅ Policy ${i + 1} created successfully`);
          }
        } catch (err) {
          console.log(`   ⚠️  Policy ${i + 1} setup: ${err.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error setting up policies for ${bucketName}: ${error.message}`);
    }
  }

  console.log('\n📋 Manual Setup Instructions:');
  console.log('='.repeat(50));
  console.log('If the automated setup didn\'t work, follow these manual steps:');
  console.log('\n1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/flrcwmmdveylmcbjuwfc');
  console.log('2. Navigate to Storage > Policies');
  console.log('3. For each bucket, create these policies:');
  
  buckets.forEach(bucketName => {
    console.log(`\n📁 Bucket: ${bucketName}`);
    console.log(`   SELECT: "Public Access" - FOR SELECT USING (bucket_id = '${bucketName}')`);
    console.log(`   INSERT: "Authenticated users can upload" - FOR INSERT WITH CHECK (bucket_id = '${bucketName}' AND auth.role() = 'authenticated')`);
    console.log(`   UPDATE: "Users can update own files" - FOR UPDATE USING (bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1])`);
    console.log(`   DELETE: "Users can delete own files" - FOR DELETE USING (bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1])`);
  });
}

// Run the setup
setupStoragePolicies().catch(console.error);

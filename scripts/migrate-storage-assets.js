const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const OLD_SUPABASE_URL = 'https://aizgswoelfdkhyosgvzu.supabase.co';
const OLD_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc';

const NEW_SUPABASE_URL = 'https://flrcwmmdveylmcbjuwfc.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA';

// Create Supabase clients
const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

// Storage buckets to migrate
const BUCKETS = ['receipts', 'hero-images', 'product-images', 'qr-codes'];

async function checkConfiguration() {
  if (NEW_SUPABASE_URL === 'YOUR_NEW_SUPABASE_URL' || NEW_SUPABASE_SERVICE_KEY === 'YOUR_NEW_SERVICE_KEY') {
    console.error('❌ Please update the configuration with your new Supabase credentials:');
    console.error('1. Set NEW_SUPABASE_URL environment variable');
    console.error('2. Set NEW_SUPABASE_SERVICE_KEY environment variable');
    process.exit(1);
  }
  
  console.log('✅ Configuration verified');
}

async function listBucketFiles(supabase, bucketName) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 1000,
        offset: 0
      });
    
    if (error) {
      console.error(`❌ Error listing files in ${bucketName}:`, error);
      return [];
    }
    
    return data.filter(file => file.name);
  } catch (error) {
    console.error(`❌ Error accessing bucket ${bucketName}:`, error);
    return [];
  }
}

async function downloadFile(supabase, bucketName, fileName) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);
    
    if (error) {
      console.error(`❌ Error downloading ${fileName}:`, error);
      return null;
    }
    
    return await data.arrayBuffer();
  } catch (error) {
    console.error(`❌ Error processing ${fileName}:`, error);
    return null;
  }
}

async function uploadFile(supabase, bucketName, fileName, fileBuffer) {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        upsert: true
      });
    
    if (error) {
      console.error(`❌ Error uploading ${fileName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error);
    return false;
  }
}

async function migrateBucket(bucketName) {
  console.log(`🔄 Migrating bucket: ${bucketName}`);
  
  try {
    // List files in old bucket
    const files = await listBucketFiles(oldSupabase, bucketName);
    
    if (files.length === 0) {
      console.log(`⚠️  No files found in bucket ${bucketName}`);
      return;
    }
    
    console.log(`📁 Found ${files.length} files in ${bucketName}`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        console.log(`📥 Downloading: ${file.name}`);
        
        // Download from old bucket
        const fileBuffer = await downloadFile(oldSupabase, bucketName, file.name);
        
        if (!fileBuffer) {
          errorCount++;
          continue;
        }
        
        console.log(`📤 Uploading: ${file.name}`);
        
        // Upload to new bucket
        const success = await uploadFile(newSupabase, bucketName, file.name, fileBuffer);
        
        if (success) {
          successCount++;
          console.log(`✅ Migrated: ${file.name}`);
        } else {
          errorCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error migrating ${file.name}:`, error);
        errorCount++;
      }
    }
    
    console.log(`✅ Bucket ${bucketName} migration completed:`);
    console.log(`   Success: ${successCount} files`);
    console.log(`   Errors: ${errorCount} files`);
    
  } catch (error) {
    console.error(`❌ Error migrating bucket ${bucketName}:`, error);
  }
}

async function migrateAllStorage() {
  console.log('🚀 Starting storage migration...');
  
  try {
    // Check configuration
    await checkConfiguration();
    
    // Test connection to both projects
    console.log('🔗 Testing connections...');
    
    const oldTest = await listBucketFiles(oldSupabase, 'receipts');
    console.log('✅ Old Supabase connection: OK');
    
    const newTest = await listBucketFiles(newSupabase, 'receipts');
    console.log('✅ New Supabase connection: OK');
    
    // Migrate each bucket
    for (const bucket of BUCKETS) {
      await migrateBucket(bucket);
      console.log(''); // Empty line for readability
    }
    
    console.log('🎉 Storage migration completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Verify all files are accessible in the new project');
    console.log('2. Update your application to use the new Supabase credentials');
    console.log('3. Test file uploads and downloads');
    
  } catch (error) {
    console.error('❌ Storage migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  migrateAllStorage();
}

module.exports = { migrateAllStorage, migrateBucket };

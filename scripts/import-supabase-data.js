const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration - Updated with new Supabase credentials
const NEW_SUPABASE_URL = 'https://flrcwmmdveylmcbjuwfc.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA';

// Create Supabase client for new project
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

// Import directory
const IMPORT_DIR = path.join(__dirname, '..', 'supabase-data-export');

async function checkConfiguration() {
  if (NEW_SUPABASE_URL === 'YOUR_NEW_SUPABASE_URL' || NEW_SUPABASE_SERVICE_KEY === 'YOUR_NEW_SERVICE_KEY') {
    console.error('❌ Please update the configuration with your new Supabase credentials:');
    console.error('1. Set NEW_SUPABASE_URL environment variable');
    console.error('2. Set NEW_SUPABASE_SERVICE_KEY environment variable');
    console.error('Or update the script directly with your new credentials');
    process.exit(1);
  }
  
  console.log('✅ Configuration verified');
}

async function importTable(tableName) {
  try {
    console.log(`📥 Importing ${tableName}...`);
    
    // Read the exported data
    const filePath = path.join(IMPORT_DIR, `${tableName}.json`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    if (!data || data.length === 0) {
      console.log(`⚠️  No data to import for ${tableName}`);
      return;
    }
    
    // Import data in batches to avoid rate limits
    const batchSize = 100;
    let importedCount = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from(tableName)
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error importing batch ${i / batchSize + 1} for ${tableName}:`, error);
        continue;
      }
      
      importedCount += batch.length;
      console.log(`✅ Imported batch ${i / batchSize + 1} (${batch.length} records) for ${tableName}`);
    }
    
    console.log(`✅ Successfully imported ${importedCount} records to ${tableName}`);
    
  } catch (error) {
    console.error(`❌ Error importing ${tableName}:`, error);
  }
}

async function createStorageBucket(bucketName) {
  try {
    console.log(`📦 Creating storage bucket: ${bucketName}...`);
    
    // Note: Supabase doesn't have a direct API to create buckets
    // You'll need to create them manually in the dashboard
    console.log(`⚠️  Please create the '${bucketName}' bucket manually in your Supabase dashboard`);
    console.log(`   Go to Storage > Create bucket > Name: ${bucketName}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error creating bucket ${bucketName}:`, error);
    return false;
  }
}

async function uploadStorageFiles(bucketName) {
  try {
    console.log(`📤 Uploading files to storage bucket: ${bucketName}...`);
    
    const bucketDir = path.join(IMPORT_DIR, 'storage', bucketName);
    
    // Check if bucket directory exists
    try {
      await fs.access(bucketDir);
    } catch (error) {
      console.log(`⚠️  No exported files found for bucket ${bucketName}`);
      return;
    }
    
    const files = await fs.readdir(bucketDir);
    
    for (const fileName of files) {
      try {
        const filePath = path.join(bucketDir, fileName);
        const fileBuffer = await fs.readFile(filePath);
        
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, fileBuffer, {
            upsert: true
          });
        
        if (error) {
          console.error(`❌ Error uploading ${fileName}:`, error);
          continue;
        }
        
        console.log(`✅ Uploaded: ${fileName}`);
      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error);
      }
    }
    
    console.log(`✅ Uploaded ${files.length} files to ${bucketName}`);
    
  } catch (error) {
    console.error(`❌ Error uploading to bucket ${bucketName}:`, error);
  }
}

async function importAllData() {
  console.log('🚀 Starting Supabase data import...');
  
  try {
    // Check configuration
    await checkConfiguration();
    
    // Check if export directory exists
    try {
      await fs.access(IMPORT_DIR);
    } catch (error) {
      console.error('❌ Export directory not found. Please run the export script first.');
      console.error(`Expected location: ${IMPORT_DIR}`);
      process.exit(1);
    }
    
    // Import database tables
    const tables = ['products', 'orders', 'order_items', 'hero_images', 'qr_codes'];
    
    for (const table of tables) {
      await importTable(table);
    }
    
    // Create storage buckets (manual step reminder)
    const buckets = ['receipts', 'hero-images', 'product-images', 'qr-codes'];
    
    console.log('\n📋 Storage Bucket Setup Required:');
    for (const bucket of buckets) {
      await createStorageBucket(bucket);
    }
    
    console.log('\n⏳ Waiting for bucket creation...');
    console.log('Please create the storage buckets in your Supabase dashboard, then press Enter to continue...');
    
    // Wait for user input (you can comment this out if running automated)
    // const readline = require('readline');
    // const rl = readline.createInterface({
    //   input: process.stdin,
    //   output: process.stdout
    // });
    // await new Promise(resolve => rl.question('Press Enter to continue...', resolve));
    // rl.close();
    
    // Upload storage files
    for (const bucket of buckets) {
      await uploadStorageFiles(bucket);
    }
    
    console.log('\n🎉 Data import completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Update your environment variables with new Supabase credentials');
    console.log('2. Test your application');
    console.log('3. Update deployment environment variables');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importAllData();
}

module.exports = { importAllData, importTable, uploadStorageFiles };

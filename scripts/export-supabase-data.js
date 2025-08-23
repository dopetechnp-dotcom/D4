const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Current Supabase configuration
const SUPABASE_URL = 'https://aizgswoelfdkhyosgvzu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Export directory
const EXPORT_DIR = path.join(__dirname, '..', 'supabase-data-export');

async function ensureExportDirectory() {
  try {
    await fs.mkdir(EXPORT_DIR, { recursive: true });
    console.log('✅ Export directory created/verified');
  } catch (error) {
    console.error('❌ Error creating export directory:', error);
    throw error;
  }
}

async function exportTable(tableName) {
  try {
    console.log(`📤 Exporting ${tableName}...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`❌ Error exporting ${tableName}:`, error);
      return null;
    }
    
    const filePath = path.join(EXPORT_DIR, `${tableName}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Exported ${data.length} records from ${tableName}`);
    return data;
  } catch (error) {
    console.error(`❌ Error exporting ${tableName}:`, error);
    return null;
  }
}

async function exportStorageFiles(bucketName) {
  try {
    console.log(`📤 Exporting storage bucket: ${bucketName}...`);
    
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
    
    const bucketDir = path.join(EXPORT_DIR, 'storage', bucketName);
    await fs.mkdir(bucketDir, { recursive: true });
    
    const files = [];
    for (const file of data) {
      if (file.name) {
        try {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from(bucketName)
            .download(file.name);
          
          if (downloadError) {
            console.error(`❌ Error downloading ${file.name}:`, downloadError);
            continue;
          }
          
          const buffer = await fileData.arrayBuffer();
          const filePath = path.join(bucketDir, file.name);
          await fs.writeFile(filePath, Buffer.from(buffer));
          
          files.push({
            name: file.name,
            size: file.metadata?.size,
            path: filePath
          });
          
          console.log(`✅ Downloaded: ${file.name}`);
        } catch (error) {
          console.error(`❌ Error processing ${file.name}:`, error);
        }
      }
    }
    
    console.log(`✅ Exported ${files.length} files from ${bucketName}`);
    return files;
  } catch (error) {
    console.error(`❌ Error exporting storage bucket ${bucketName}:`, error);
    return [];
  }
}

async function exportAllData() {
  console.log('🚀 Starting Supabase data export...');
  
  try {
    // Ensure export directory exists
    await ensureExportDirectory();
    
    // Export database tables
    const tables = ['products', 'orders', 'order_items', 'hero_images', 'qr_codes'];
    
    for (const table of tables) {
      await exportTable(table);
    }
    
    // Export storage buckets
    const buckets = ['receipts', 'hero-images', 'product-images', 'qr-codes'];
    
    for (const bucket of buckets) {
      await exportStorageFiles(bucket);
    }
    
    // Create export summary
    const summary = {
      exportedAt: new Date().toISOString(),
      sourceProject: SUPABASE_URL,
      tables: tables,
      storageBuckets: buckets,
      exportDirectory: EXPORT_DIR
    };
    
    const summaryPath = path.join(EXPORT_DIR, 'export-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n🎉 Data export completed successfully!');
    console.log(`📁 Export location: ${EXPORT_DIR}`);
    console.log('📋 Next steps:');
    console.log('1. Create new Supabase project');
    console.log('2. Run the schema setup script');
    console.log('3. Run the data import script');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// Run the export
if (require.main === module) {
  exportAllData();
}

module.exports = { exportAllData, exportTable, exportStorageFiles };

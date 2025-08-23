const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Configuration
const OLD_SUPABASE_URL = 'https://aizgswoelfdkhyosgvzu.supabase.co';
const OLD_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc';

// New Supabase Configuration
const NEW_SUPABASE_URL = 'https://flrcwmmdveylmcbjuwfc.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTk2MjIsImV4cCI6MjA3MTQzNTYyMn0.NitC7tHaImTORdaKgCFXkKRLNMOxJCuBbTDAyr8AVa0';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function getNewSupabaseCredentials() {
  console.log('🔧 Supabase Migration Setup');
  console.log('='.repeat(50));
  
  // Use the provided credentials directly
  const newUrl = NEW_SUPABASE_URL;
  const newAnonKey = NEW_SUPABASE_ANON_KEY;
  const newServiceKey = NEW_SUPABASE_SERVICE_KEY;
  
  console.log('✅ Using provided Supabase credentials:');
  console.log(`   URL: ${newUrl}`);
  console.log(`   Anon Key: ${newAnonKey.substring(0, 20)}...`);
  console.log(`   Service Key: ${newServiceKey.substring(0, 20)}...`);
  
  return { newUrl, newAnonKey, newServiceKey };
}

async function exportData() {
  console.log('\n📤 Step 1: Exporting data from current Supabase project...');
  
  const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_KEY);
  const exportDir = path.join(__dirname, '..', 'supabase-data-export');
  
  try {
    await fs.mkdir(exportDir, { recursive: true });
    
    // Export database tables
    const tables = ['products', 'orders', 'order_items', 'hero_images', 'qr_codes'];
    
    for (const table of tables) {
      console.log(`  📤 Exporting ${table}...`);
      
      const { data, error } = await oldSupabase
        .from(table)
        .select('*');
      
      if (error) {
        console.error(`    ❌ Error exporting ${table}:`, error.message);
        continue;
      }
      
      const filePath = path.join(exportDir, `${table}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`    ✅ Exported ${data.length} records from ${table}`);
    }
    
    // Export storage files
    const buckets = ['receipts', 'hero-images', 'product-images', 'qr-codes'];
    
    for (const bucket of buckets) {
      console.log(`  📤 Exporting storage bucket: ${bucket}...`);
      
      const { data: files, error } = await oldSupabase.storage
        .from(bucket)
        .list('', { limit: 1000 });
      
      if (error) {
        console.error(`    ❌ Error listing ${bucket}:`, error.message);
        continue;
      }
      
      const bucketDir = path.join(exportDir, 'storage', bucket);
      await fs.mkdir(bucketDir, { recursive: true });
      
      let downloadedCount = 0;
      for (const file of files) {
        if (file.name) {
          try {
            const { data: fileData, error: downloadError } = await oldSupabase.storage
              .from(bucket)
              .download(file.name);
            
            if (downloadError) {
              console.error(`    ❌ Error downloading ${file.name}:`, downloadError.message);
              continue;
            }
            
            const buffer = await fileData.arrayBuffer();
            const filePath = path.join(bucketDir, file.name);
            await fs.writeFile(filePath, Buffer.from(buffer));
            downloadedCount++;
          } catch (error) {
            console.error(`    ❌ Error processing ${file.name}:`, error.message);
          }
        }
      }
      
      console.log(`    ✅ Downloaded ${downloadedCount} files from ${bucket}`);
    }
    
    console.log('✅ Data export completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Data export failed:', error);
    return false;
  }
}

async function importData(newUrl, newServiceKey) {
  console.log('\n📥 Step 2: Importing data to new Supabase project...');
  
  const newSupabase = createClient(newUrl, newServiceKey);
  const importDir = path.join(__dirname, '..', 'supabase-data-export');
  
  try {
    // Import database tables
    const tables = ['products', 'orders', 'order_items', 'hero_images', 'qr_codes'];
    
    for (const table of tables) {
      console.log(`  📥 Importing ${table}...`);
      
      try {
        const filePath = path.join(importDir, `${table}.json`);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        if (data && data.length > 0) {
          // Import in batches
          const batchSize = 100;
          let importedCount = 0;
          
          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            
            const { error } = await newSupabase
              .from(table)
              .insert(batch);
            
            if (error) {
              console.error(`    ❌ Error importing batch for ${table}:`, error.message);
              continue;
            }
            
            importedCount += batch.length;
          }
          
          console.log(`    ✅ Imported ${importedCount} records to ${table}`);
        } else {
          console.log(`    ⚠️  No data to import for ${table}`);
        }
      } catch (error) {
        console.error(`    ❌ Error importing ${table}:`, error.message);
      }
    }
    
    console.log('✅ Data import completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Data import failed:', error);
    return false;
  }
}

async function migrateStorage(newUrl, newServiceKey) {
  console.log('\n📁 Step 3: Migrating storage files...');
  
  const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_KEY);
  const newSupabase = createClient(newUrl, newServiceKey);
  
  const buckets = ['receipts', 'hero-images', 'product-images', 'qr-codes'];
  
  try {
    for (const bucket of buckets) {
      console.log(`  📁 Migrating bucket: ${bucket}...`);
      
      // List files in old bucket
      const { data: files, error } = await oldSupabase.storage
        .from(bucket)
        .list('', { limit: 1000 });
      
      if (error) {
        console.error(`    ❌ Error listing ${bucket}:`, error.message);
        continue;
      }
      
      if (files.length === 0) {
        console.log(`    ⚠️  No files found in ${bucket}`);
        continue;
      }
      
      let migratedCount = 0;
      for (const file of files) {
        if (file.name) {
          try {
            // Download from old bucket
            const { data: fileData, error: downloadError } = await oldSupabase.storage
              .from(bucket)
              .download(file.name);
            
            if (downloadError) {
              console.error(`    ❌ Error downloading ${file.name}:`, downloadError.message);
              continue;
            }
            
            // Upload to new bucket
            const buffer = await fileData.arrayBuffer();
            const { error: uploadError } = await newSupabase.storage
              .from(bucket)
              .upload(file.name, buffer, { upsert: true });
            
            if (uploadError) {
              console.error(`    ❌ Error uploading ${file.name}:`, uploadError.message);
              continue;
            }
            
            migratedCount++;
          } catch (error) {
            console.error(`    ❌ Error migrating ${file.name}:`, error.message);
          }
        }
      }
      
      console.log(`    ✅ Migrated ${migratedCount} files to ${bucket}`);
    }
    
    console.log('✅ Storage migration completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Storage migration failed:', error);
    return false;
  }
}

async function testMigration(newUrl, newAnonKey, newServiceKey) {
  console.log('\n🧪 Step 4: Testing migration...');
  
  const supabaseAnon = createClient(newUrl, newAnonKey);
  const supabaseService = createClient(newUrl, newServiceKey);
  
  try {
    // Test database connection
    console.log('  🔗 Testing database connection...');
    const { data, error } = await supabaseAnon
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('    ❌ Database connection failed:', error.message);
      return false;
    }
    console.log('    ✅ Database connection successful');
    
    // Test data retrieval
    console.log('  📥 Testing data retrieval...');
    const { data: products, error: productsError } = await supabaseAnon
      .from('products')
      .select('*')
      .limit(3);
    
    if (productsError) {
      console.error('    ❌ Products retrieval failed:', productsError.message);
      return false;
    }
    console.log(`    ✅ Retrieved ${products.length} products`);
    
    // Test file upload
    console.log('  📤 Testing file upload...');
    const testContent = 'Migration test file';
    const testBuffer = Buffer.from(testContent, 'utf8');
    
    const { error: uploadError } = await supabaseService.storage
      .from('receipts')
      .upload('test-migration.txt', testBuffer, { upsert: true });
    
    if (uploadError) {
      console.error('    ❌ File upload failed:', uploadError.message);
      return false;
    }
    console.log('    ✅ File upload successful');
    
    // Clean up test file
    await supabaseService.storage
      .from('receipts')
      .remove(['test-migration.txt']);
    
    console.log('✅ Migration testing completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Migration testing failed:', error);
    return false;
  }
}

async function generateEnvironmentFile(newUrl, newAnonKey, newServiceKey) {
  console.log('\n📝 Step 5: Generating environment configuration...');
  
  const envContent = `# New Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${newUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${newAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${newServiceKey}

# Email Service Configuration (keep existing)
RESEND_API_KEY=re_6CyBkNKP_Ekzfh7Unk9GLM7n1WMFbwdoL
ADMIN_EMAIL=dopetechnp@gmail.com
`;
  
  const envPath = path.join(__dirname, '..', '.env.local.new');
  await fs.writeFile(envPath, envContent);
  
  console.log('✅ Environment file generated: .env.local.new');
  console.log('💡 Copy the contents to your .env.local file');
  
  return envPath;
}

async function runMigration() {
  try {
    console.log('🚀 Starting Supabase Migration Process');
    console.log('='.repeat(50));
    
    // Get new Supabase credentials
    const { newUrl, newAnonKey, newServiceKey } = await getNewSupabaseCredentials();
    
    // Confirm migration
    console.log('\n⚠️  IMPORTANT: This will migrate all data from your current Supabase project to the new one.');
    console.log('✅ Proceeding with migration...');
    
    // Step 1: Export data
    const exportSuccess = await exportData();
    if (!exportSuccess) {
      console.error('❌ Migration failed at export step');
      rl.close();
      return;
    }
    
    // Step 2: Import data
    const importSuccess = await importData(newUrl, newServiceKey);
    if (!importSuccess) {
      console.error('❌ Migration failed at import step');
      rl.close();
      return;
    }
    
    // Step 3: Migrate storage
    const storageSuccess = await migrateStorage(newUrl, newServiceKey);
    if (!storageSuccess) {
      console.error('❌ Migration failed at storage step');
      rl.close();
      return;
    }
    
    // Step 4: Test migration
    const testSuccess = await testMigration(newUrl, newAnonKey, newServiceKey);
    if (!testSuccess) {
      console.error('❌ Migration failed at testing step');
      rl.close();
      return;
    }
    
    // Step 5: Generate environment file
    await generateEnvironmentFile(newUrl, newAnonKey, newServiceKey);
    
    // Success message
    console.log('\n🎉 Migration completed successfully!');
    console.log('='.repeat(50));
    console.log('📋 Next steps:');
    console.log('1. Copy the new environment variables to your .env.local file');
    console.log('2. Test your application locally');
    console.log('3. Update deployment environment variables (Vercel/Netlify)');
    console.log('4. Deploy and test in production');
    console.log('5. Once confirmed working, you can delete the old Supabase project');
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
  } finally {
    rl.close();
  }
}

// Run the migration
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };

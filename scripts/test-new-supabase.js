const { createClient } = require('@supabase/supabase-js');

// Configuration - Updated with new Supabase credentials
const NEW_SUPABASE_URL = 'https://flrcwmmdveylmcbjuwfc.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTk2MjIsImV4cCI6MjA3MTQzNTYyMn0.NitC7tHaImTORdaKgCFXkKRLNMOxJCuBbTDAyr8AVa0';
const NEW_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA';

// Create Supabase clients
const supabaseAnon = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);
const supabaseService = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

async function checkConfiguration() {
  if (NEW_SUPABASE_URL === 'YOUR_NEW_SUPABASE_URL' || 
      NEW_SUPABASE_ANON_KEY === 'YOUR_NEW_ANON_KEY' || 
      NEW_SUPABASE_SERVICE_KEY === 'YOUR_NEW_SERVICE_KEY') {
    console.error('❌ Please update the configuration with your new Supabase credentials:');
    console.error('1. Set NEW_SUPABASE_URL environment variable');
    console.error('2. Set NEW_SUPABASE_ANON_KEY environment variable');
    console.error('3. Set NEW_SUPABASE_SERVICE_KEY environment variable');
    process.exit(1);
  }
  
  console.log('✅ Configuration verified');
}

async function testDatabaseConnection() {
  console.log('🔗 Testing database connection...');
  
  try {
    // Test basic connection with products table
    const { data, error } = await supabaseAnon
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

async function testTableAccess() {
  console.log('📊 Testing table access...');
  
  const tables = ['products', 'orders', 'order_items', 'hero_images', 'qr_codes'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAnon
        .from(table)
        .select('*')
        .limit(5);
      
      if (error) {
        console.error(`❌ Error accessing ${table}:`, error);
        results[table] = { success: false, error: error.message };
      } else {
        console.log(`✅ ${table}: ${data.length} records accessible`);
        results[table] = { success: true, count: data.length };
      }
    } catch (error) {
      console.error(`❌ Error testing ${table}:`, error);
      results[table] = { success: false, error: error.message };
    }
  }
  
  return results;
}

async function testStorageAccess() {
  console.log('📁 Testing storage access...');
  
  const buckets = ['receipts', 'hero-images', 'product-images', 'qr-codes'];
  const results = {};
  
  for (const bucket of buckets) {
    try {
      const { data, error } = await supabaseAnon.storage
        .from(bucket)
        .list('', {
          limit: 10,
          offset: 0
        });
      
      if (error) {
        console.error(`❌ Error accessing bucket ${bucket}:`, error);
        results[bucket] = { success: false, error: error.message };
      } else {
        console.log(`✅ ${bucket}: ${data.length} files accessible`);
        results[bucket] = { success: true, count: data.length };
      }
    } catch (error) {
      console.error(`❌ Error testing bucket ${bucket}:`, error);
      results[bucket] = { success: false, error: error.message };
    }
  }
  
  return results;
}

async function testDataRetrieval() {
  console.log('📥 Testing data retrieval...');
  
  try {
    // Test products retrieval
    const { data: products, error: productsError } = await supabaseAnon
      .from('products')
      .select('*')
      .limit(3);
    
    if (productsError) {
      console.error('❌ Products retrieval failed:', productsError);
      return false;
    }
    
    console.log(`✅ Retrieved ${products.length} products`);
    
    // Test orders retrieval
    const { data: orders, error: ordersError } = await supabaseAnon
      .from('orders')
      .select('*')
      .limit(3);
    
    if (ordersError) {
      console.error('❌ Orders retrieval failed:', ordersError);
      return false;
    }
    
    console.log(`✅ Retrieved ${orders.length} orders`);
    
    return true;
  } catch (error) {
    console.error('❌ Data retrieval error:', error);
    return false;
  }
}

async function testFileUpload() {
  console.log('📤 Testing file upload...');
  
  try {
    // Create a test file
    const testContent = 'This is a test file for Supabase migration verification';
    const testBuffer = Buffer.from(testContent, 'utf8');
    
    const { data, error } = await supabaseService.storage
      .from('receipts')
      .upload('test-migration.txt', testBuffer, {
        upsert: true
      });
    
    if (error) {
      console.error('❌ File upload failed:', error);
      return false;
    }
    
    console.log('✅ Test file uploaded successfully');
    
    // Clean up test file
    const { error: deleteError } = await supabaseService.storage
      .from('receipts')
      .remove(['test-migration.txt']);
    
    if (deleteError) {
      console.warn('⚠️  Could not delete test file:', deleteError);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    return true;
  } catch (error) {
    console.error('❌ File upload error:', error);
    return false;
  }
}

async function generateEnvironmentTemplate() {
  console.log('📝 Generating environment template...');
  
  const template = `# New Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${NEW_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEW_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${NEW_SUPABASE_SERVICE_KEY}

# Email Service Configuration (keep existing)
RESEND_API_KEY=re_6CyBkNKP_Ekzfh7Unk9GLM7n1WMFbwdoL
ADMIN_EMAIL=dopetechnp@gmail.com
`;
  
  console.log('📄 Environment template:');
  console.log('='.repeat(50));
  console.log(template);
  console.log('='.repeat(50));
  console.log('💡 Copy this to your .env.local file');
}

async function runAllTests() {
  console.log('🧪 Starting Supabase migration tests...');
  
  try {
    // Check configuration
    await checkConfiguration();
    
    // Run tests
    const dbConnection = await testDatabaseConnection();
    const tableAccess = await testTableAccess();
    const storageAccess = await testStorageAccess();
    const dataRetrieval = await testDataRetrieval();
    const fileUpload = await testFileUpload();
    
    // Generate summary
    console.log('\n📋 Test Summary:');
    console.log('='.repeat(50));
    console.log(`Database Connection: ${dbConnection ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Data Retrieval: ${dataRetrieval ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`File Upload: ${fileUpload ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log('\n📊 Table Access Results:');
    Object.entries(tableAccess).forEach(([table, result]) => {
      const status = result.success ? '✅' : '❌';
      const info = result.success ? `${result.count} records` : result.error;
      console.log(`  ${status} ${table}: ${info}`);
    });
    
    console.log('\n📁 Storage Access Results:');
    Object.entries(storageAccess).forEach(([bucket, result]) => {
      const status = result.success ? '✅' : '❌';
      const info = result.success ? `${result.count} files` : result.error;
      console.log(`  ${status} ${bucket}: ${info}`);
    });
    
    // Generate environment template
    await generateEnvironmentTemplate();
    
    // Final assessment
    const allTestsPassed = dbConnection && dataRetrieval && fileUpload;
    
    if (allTestsPassed) {
      console.log('\n🎉 All critical tests passed! Your migration appears successful.');
      console.log('📋 Next steps:');
      console.log('1. Update your .env.local file with the new credentials');
      console.log('2. Test your application locally');
      console.log('3. Update deployment environment variables');
      console.log('4. Deploy and test in production');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
      console.log('📋 Troubleshooting:');
      console.log('1. Check your new Supabase project settings');
      console.log('2. Verify RLS policies are configured correctly');
      console.log('3. Ensure storage buckets exist and are accessible');
      console.log('4. Check API keys and permissions');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };

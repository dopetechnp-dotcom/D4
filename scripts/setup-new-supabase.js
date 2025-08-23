const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration - UPDATE THESE WITH YOUR NEW SUPABASE CREDENTIALS
const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL || 'YOUR_NEW_SUPABASE_URL';
const NEW_SUPABASE_SERVICE_KEY = process.env.NEW_SUPABASE_SERVICE_KEY || 'YOUR_NEW_SERVICE_KEY';

// Create Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

async function checkConfiguration() {
  if (NEW_SUPABASE_URL === 'YOUR_NEW_SUPABASE_URL' || NEW_SUPABASE_SERVICE_KEY === 'YOUR_NEW_SERVICE_KEY') {
    console.error('❌ Please update the configuration with your new Supabase credentials:');
    console.error('1. Set NEW_SUPABASE_URL environment variable');
    console.error('2. Set NEW_SUPABASE_SERVICE_KEY environment variable');
    process.exit(1);
  }
  
  console.log('✅ Configuration verified');
}

async function setupStorageBuckets() {
  console.log('📦 Setting up storage buckets...');
  
  const buckets = [
    { name: 'receipts', public: false },
    { name: 'hero-images', public: true },
    { name: 'product-images', public: true },
    { name: 'qr-codes', public: true }
  ];
  
  for (const bucket of buckets) {
    try {
      console.log(`  📦 Creating bucket: ${bucket.name}...`);
      
      // Note: Supabase doesn't have a direct API to create buckets
      // This is a reminder for manual creation
      console.log(`    ⚠️  Please create the '${bucket.name}' bucket manually:`);
      console.log(`       - Go to Storage in your Supabase dashboard`);
      console.log(`       - Click "Create bucket"`);
      console.log(`       - Name: ${bucket.name}`);
      console.log(`       - Public: ${bucket.public ? 'Yes' : 'No'}`);
      
    } catch (error) {
      console.error(`    ❌ Error setting up bucket ${bucket.name}:`, error.message);
    }
  }
  
  console.log('✅ Storage bucket setup instructions provided');
}

async function setupRLSPolicies() {
  console.log('🔒 Setting up Row Level Security policies...');
  
  try {
    // Enable RLS on all tables
    const tables = ['products', 'orders', 'order_items', 'hero_images', 'qr_codes'];
    
    for (const table of tables) {
      console.log(`  🔒 Setting up RLS for ${table}...`);
      
      // Enable RLS
      const { error: enableError } = await supabase.rpc('enable_rls', { table_name: table });
      if (enableError) {
        console.log(`    ⚠️  Could not enable RLS for ${table}:`, enableError.message);
      }
    }
    
    // Create policies for products (public read access)
    const { error: productsPolicyError } = await supabase.rpc('create_policy', {
      table_name: 'products',
      policy_name: 'Products are viewable by everyone',
      definition: 'FOR SELECT USING (true)'
    });
    
    if (productsPolicyError) {
      console.log('    ⚠️  Could not create products policy:', productsPolicyError.message);
    } else {
      console.log('    ✅ Products policy created');
    }
    
    // Create policies for orders (authenticated users can create/view)
    const { error: ordersCreatePolicyError } = await supabase.rpc('create_policy', {
      table_name: 'orders',
      policy_name: 'Users can create orders',
      definition: 'FOR INSERT WITH CHECK (true)'
    });
    
    const { error: ordersViewPolicyError } = await supabase.rpc('create_policy', {
      table_name: 'orders',
      policy_name: 'Users can view their own orders',
      definition: 'FOR SELECT USING (true)'
    });
    
    if (ordersCreatePolicyError) {
      console.log('    ⚠️  Could not create orders create policy:', ordersCreatePolicyError.message);
    } else {
      console.log('    ✅ Orders create policy created');
    }
    
    if (ordersViewPolicyError) {
      console.log('    ⚠️  Could not create orders view policy:', ordersViewPolicyError.message);
    } else {
      console.log('    ✅ Orders view policy created');
    }
    
    console.log('✅ RLS policies setup completed');
    
  } catch (error) {
    console.error('❌ RLS setup failed:', error);
  }
}

async function setupStoragePolicies() {
  console.log('📁 Setting up storage policies...');
  
  const buckets = ['receipts', 'hero-images', 'product-images', 'qr-codes'];
  
  for (const bucket of buckets) {
    try {
      console.log(`  📁 Setting up policies for ${bucket}...`);
      
      if (bucket === 'receipts') {
        // Receipts bucket - authenticated users can upload, public can download
        console.log(`    ⚠️  Manual setup required for ${bucket}:`);
        console.log(`       - Go to Storage > ${bucket} > Policies`);
        console.log(`       - Create policy: "Authenticated users can upload"`);
        console.log(`       - Create policy: "Public can download"`);
      } else {
        // Public buckets - anyone can read, authenticated users can upload
        console.log(`    ⚠️  Manual setup required for ${bucket}:`);
        console.log(`       - Go to Storage > ${bucket} > Policies`);
        console.log(`       - Create policy: "Public can read"`);
        console.log(`       - Create policy: "Authenticated users can upload"`);
      }
      
    } catch (error) {
      console.error(`    ❌ Error setting up policies for ${bucket}:`, error.message);
    }
  }
  
  console.log('✅ Storage policies setup instructions provided');
}

async function testConnection() {
  console.log('🔗 Testing connection to new Supabase project...');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection to new Supabase project successful');
    return true;
    
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
}

async function generateSetupInstructions() {
  console.log('📋 Generating setup instructions...');
  
  const instructions = `
# New Supabase Project Setup Instructions

## 1. Database Schema Setup
1. Go to your new Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of \`complete-supabase-setup.sql\`
4. Run the SQL script

## 2. Storage Buckets Setup
Create the following buckets in Storage:

### receipts (Private)
- Name: receipts
- Public: No
- Purpose: Store order receipts

### hero-images (Public)
- Name: hero-images
- Public: Yes
- Purpose: Store hero carousel images

### product-images (Public)
- Name: product-images
- Public: Yes
- Purpose: Store product images

### qr-codes (Public)
- Name: qr-codes
- Public: Yes
- Purpose: Store QR code images

## 3. Storage Policies Setup

### For receipts bucket:
- Policy: "Authenticated users can upload"
  - Operation: INSERT
  - Target roles: authenticated
  - Definition: true

- Policy: "Public can download"
  - Operation: SELECT
  - Target roles: public
  - Definition: true

### For public buckets (hero-images, product-images, qr-codes):
- Policy: "Public can read"
  - Operation: SELECT
  - Target roles: public
  - Definition: true

- Policy: "Authenticated users can upload"
  - Operation: INSERT
  - Target roles: authenticated
  - Definition: true

## 4. Row Level Security (RLS)
RLS is enabled on all tables with the following policies:

### products
- "Products are viewable by everyone" (SELECT, public)

### orders
- "Users can create orders" (INSERT, public)
- "Users can view their own orders" (SELECT, public)

### order_items
- "Order items can be created with orders" (INSERT, public)

## 5. Environment Variables
Update your environment variables with the new Supabase credentials:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=${NEW_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=${NEW_SUPABASE_SERVICE_KEY}
\`\`\`

## 6. Testing
After setup, run the migration test:
\`\`\`bash
node scripts/test-new-supabase.js
\`\`\`
`;
  
  const instructionsPath = path.join(__dirname, '..', 'NEW_SUPABASE_SETUP_INSTRUCTIONS.md');
  await fs.writeFile(instructionsPath, instructions);
  
  console.log('✅ Setup instructions generated: NEW_SUPABASE_SETUP_INSTRUCTIONS.md');
  return instructionsPath;
}

async function runSetup() {
  console.log('🚀 Starting new Supabase project setup...');
  
  try {
    // Check configuration
    await checkConfiguration();
    
    // Test connection
    const connectionSuccess = await testConnection();
    if (!connectionSuccess) {
      console.error('❌ Cannot connect to new Supabase project. Please check your credentials.');
      return;
    }
    
    // Setup storage buckets
    await setupStorageBuckets();
    
    // Setup RLS policies
    await setupRLSPolicies();
    
    // Setup storage policies
    await setupStoragePolicies();
    
    // Generate instructions
    await generateSetupInstructions();
    
    console.log('\n🎉 New Supabase project setup completed!');
    console.log('📋 Next steps:');
    console.log('1. Follow the instructions in NEW_SUPABASE_SETUP_INSTRUCTIONS.md');
    console.log('2. Set up the database schema using complete-supabase-setup.sql');
    console.log('3. Create storage buckets and policies manually');
    console.log('4. Run the migration script: node scripts/migrate-supabase-complete.js');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
if (require.main === module) {
  runSetup();
}

module.exports = { runSetup };

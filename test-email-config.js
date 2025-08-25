// 🧪 Test Email Configuration Script
// This script tests if the email service is properly configured

const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🧪 Testing Email Configuration...');
console.log('================================');

// Check required environment variables
const requiredVars = {
  'RESEND_API_KEY': process.env.RESEND_API_KEY,
  'ADMIN_EMAIL': process.env.ADMIN_EMAIL,
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY
};

console.log('\n📧 Environment Variables Check:');
console.log('================================');

let allGood = true;

Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${key}: MISSING`);
    allGood = false;
  }
});

// Check optional variables
console.log('\n📧 Optional Variables:');
console.log('======================');
const optionalVars = {
  'GMAIL_USER': process.env.GMAIL_USER,
  'GMAIL_APP_PASSWORD': process.env.GMAIL_APP_PASSWORD
};

Object.entries(optionalVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`⚠️  ${key}: Not configured (optional)`);
  }
});

// Test Resend API key format
console.log('\n🔑 Resend API Key Validation:');
console.log('=============================');
const resendKey = process.env.RESEND_API_KEY;
if (resendKey) {
  if (resendKey.startsWith('re_') && resendKey.length > 20) {
    console.log('✅ Resend API key format looks valid');
  } else {
    console.log('❌ Resend API key format appears invalid (should start with "re_")');
    allGood = false;
  }
} else {
  console.log('❌ Resend API key is missing');
  allGood = false;
}

// Summary
console.log('\n📊 Configuration Summary:');
console.log('==========================');
if (allGood) {
  console.log('✅ All required environment variables are configured!');
  console.log('🚀 Ready for deployment to Vercel');
  console.log('\n📝 Next steps:');
  console.log('1. Add these environment variables to Vercel dashboard');
  console.log('2. Deploy your project');
  console.log('3. Test email functionality with a test order');
} else {
  console.log('❌ Some required environment variables are missing');
  console.log('📝 Please configure the missing variables before deployment');
  console.log('\n🔧 To fix:');
  console.log('1. Create a .env.local file with the missing variables');
  console.log('2. Add the variables to Vercel dashboard for production');
  console.log('3. Redeploy the project');
}

console.log('\n📚 For detailed setup instructions, see: EMAIL_FIX_FOR_VERCEL.md');

const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

console.log('🔧 Environment Variables Test:')
console.log('📧 RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Found' : '❌ Missing')
console.log('📧 ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ Missing')
console.log('📧 GMAIL_USER:', process.env.GMAIL_USER || '❌ Missing')
console.log('📧 GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Found' : '❌ Missing')
console.log('🌐 NODE_ENV:', process.env.NODE_ENV || 'Not set')

if (process.env.RESEND_API_KEY) {
  console.log('✅ Email service should work!')
} else {
  console.log('❌ Email service will be disabled')
}

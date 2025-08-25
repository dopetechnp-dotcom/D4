const { Resend } = require('resend')

// Test email functionality
async function testEmailSetup() {
  console.log('🧪 Testing Email Setup...')
  
  const resendApiKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL
  
  console.log('📧 Resend API Key exists:', !!resendApiKey)
  console.log('📧 Admin Email exists:', !!adminEmail)
  
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY not found in environment variables')
    console.log('💡 Add RESEND_API_KEY to your Vercel environment variables')
    return false
  }
  
  if (!adminEmail) {
    console.error('❌ ADMIN_EMAIL not found in environment variables')
    console.log('💡 Add ADMIN_EMAIL to your Vercel environment variables')
    return false
  }
  
  try {
    console.log('🔧 Initializing Resend client...')
    const resend = new Resend(resendApiKey)
    
    console.log('📤 Sending test email...')
    const { data, error } = await resend.emails.send({
      from: 'DopeTech Nepal <noreply@dopetechnp.com>',
      to: [adminEmail],
      subject: '🧪 Email Test - DopeTech Nepal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🎉 Email System Test Successful!</h2>
          <p>This is a test email to verify that your email system is working correctly on Vercel.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>✅ Test Results:</h3>
            <ul>
              <li>Resend API Key: ✅ Configured</li>
              <li>Admin Email: ✅ ${adminEmail}</li>
              <li>Email Service: ✅ Working</li>
              <li>Vercel Deployment: ✅ Ready</li>
            </ul>
          </div>
          <p>Your DopeTech Nepal e-commerce site is now ready to send order confirmation emails!</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Sent from DopeTech Nepal - Email System Test
          </p>
        </div>
      `
    })
    
    if (error) {
      console.error('❌ Email test failed:', error)
      return false
    }
    
    console.log('✅ Test email sent successfully!')
    console.log('📧 Email ID:', data.id)
    console.log('📧 Sent to:', adminEmail)
    
    return true
    
  } catch (error) {
    console.error('❌ Email test error:', error)
    return false
  }
}

// Run the test
testEmailSetup()
  .then(success => {
    if (success) {
      console.log('🎉 Email system is working perfectly!')
      process.exit(0)
    } else {
      console.log('❌ Email system needs configuration')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })

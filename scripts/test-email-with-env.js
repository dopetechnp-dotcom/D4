const { Resend } = require('resend');

// Manually set environment variables for testing
process.env.RESEND_API_KEY = 're_6CyBkNKP_Ekzfh7Unk9GLM7n1WMFbwdoL';
process.env.ADMIN_EMAIL = 'dopetechnp@gmail.com';
process.env.NODE_ENV = 'production';

async function testEmailService() {
  console.log('🔧 Testing Email Service Configuration...');
  console.log('📧 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('📧 ADMIN_EMAIL exists:', !!process.env.ADMIN_EMAIL);
  console.log('📧 ADMIN_EMAIL value:', process.env.ADMIN_EMAIL);
  console.log('🌐 NODE_ENV:', process.env.NODE_ENV);

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    return;
  }

  if (!process.env.ADMIN_EMAIL) {
    console.error('❌ ADMIN_EMAIL not found in environment variables');
    return;
  }

  try {
    console.log('📧 Initializing Resend client...');
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('📧 Sending test email...');
    const { data, error } = await resend.emails.send({
      from: 'DopeTech GMK <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL],
      subject: 'Test Email - DopeTech GMK Email Service',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify the email service is working correctly.</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
        <p><strong>Admin Email:</strong> ${process.env.ADMIN_EMAIL}</p>
        <p><strong>Resend API Key:</strong> ${process.env.RESEND_API_KEY.substring(0, 10)}...</p>
      `
    });

    if (error) {
      console.error('❌ Error sending test email:', error);
      console.error('📧 Error details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', data?.id);
    console.log('📧 Sent to:', process.env.ADMIN_EMAIL);
    console.log('📧 Check your email inbox for the test message');

  } catch (error) {
    console.error('❌ Exception during email test:', error);
    console.error('📧 Error details:', error.message);
  }
}

// Test with sample order data
async function testOrderEmail() {
  console.log('\n📋 Testing Order Email...');
  
  const sampleOrderData = {
    orderId: 'TEST-ORDER-123',
    customerInfo: {
      fullName: 'Test Customer',
      email: 'test@example.com',
      phone: '+977-1234567890',
      city: 'Kathmandu',
      state: 'Bagmati',
      zipCode: '44600',
      fullAddress: 'Test Address, Kathmandu, Nepal'
    },
    cart: [
      {
        id: 1,
        name: 'Test Product',
        price: 5000,
        quantity: 1,
        image_url: 'test-image.jpg'
      }
    ],
    total: 5000,
    paymentOption: 'full',
    receiptUrl: null
  };

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Generate admin email HTML (simplified version)
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Order Alert - DopeTech GMK</title>
        </head>
        <body>
          <h1>🚨 Test Order Alert</h1>
          <p><strong>Order ID:</strong> ${sampleOrderData.orderId}</p>
          <p><strong>Customer:</strong> ${sampleOrderData.customerInfo.fullName}</p>
          <p><strong>Email:</strong> ${sampleOrderData.customerInfo.email}</p>
          <p><strong>Total:</strong> Rs ${sampleOrderData.total.toLocaleString()}</p>
          <p><strong>Payment:</strong> ${sampleOrderData.paymentOption === 'full' ? 'Full Payment' : '10% Deposit'}</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'DopeTech GMK <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL],
      subject: `🚨 Test Order Alert: ${sampleOrderData.orderId} | DopeTech GMK`,
      html: adminEmailHtml,
      replyTo: 'dopetechnp@gmail.com'
    });

    if (error) {
      console.error('❌ Error sending test order email:', error);
      return;
    }

    console.log('✅ Test order email sent successfully!');
    console.log('📧 Email ID:', data?.id);
    console.log('📧 Sent to:', process.env.ADMIN_EMAIL);

  } catch (error) {
    console.error('❌ Exception during order email test:', error);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Email Service Tests...\n');
  
  await testEmailService();
  await testOrderEmail();
  
  console.log('\n✅ Email service tests completed!');
}

runTests().catch(console.error);

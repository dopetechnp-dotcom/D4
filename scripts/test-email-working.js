const fetch = require('node-fetch');

async function testEmailService() {
  console.log('🧪 Testing Email Service...');
  
  try {
    const response = await fetch('http://localhost:3000/api/supabase-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: 'TEST-EMAIL-123',
        customerInfo: {
          fullName: 'Test Customer',
          email: 'test@example.com',
          phone: '1234567890',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          fullAddress: '123 Test Street'
        },
        cart: [{
          id: 1,
          name: 'Test Product',
          price: 1000,
          quantity: 1,
          image: 'test.jpg'
        }],
        total: 1000,
        paymentOption: 'full'
      })
    });

    const result = await response.text();
    console.log('📧 API Response:', result);
    
    if (response.ok) {
      console.log('✅ API call successful - check terminal for email service logs');
    } else {
      console.log('❌ API call failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing email service:', error.message);
  }
}

testEmailService();

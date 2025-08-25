const { exec } = require('child_process')

function testAPIEndpoint() {
  console.log('🧪 Testing API endpoint with curl...')
  
  const testData = {
    orderId: 'TEST-' + Date.now(),
    customerInfo: {
      fullName: 'Test Customer',
      email: 'test@example.com',
      phone: '+9779812345678',
      city: 'Kathmandu',
      state: 'Bagmati',
      zipCode: '44600',
      fullAddress: 'Test Address, Kathmandu, Nepal'
    },
    cart: [
      {
        id: 1,
        name: 'Test Product',
        price: 1000,
        quantity: 1,
        image: 'test.jpg'
      }
    ],
    total: 1000,
    paymentOption: 'full'
  }

  const curlCommand = `curl -X POST https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app/api/supabase-checkout \
    -H "Content-Type: application/json" \
    -d '${JSON.stringify(testData)}' \
    -w "\\nHTTP Status: %{http_code}\\n"`

  console.log('📡 Testing Vercel API endpoint...')
  console.log('🔗 URL: https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app/api/supabase-checkout')
  
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error:', error.message)
      return
    }
    
    console.log('📊 Response:')
    console.log(stdout)
    
    if (stderr) {
      console.log('⚠️ Stderr:', stderr)
    }
  })
}

testAPIEndpoint()

import fetch from 'node-fetch'

async function testAPIEndpoint() {
  console.log('🧪 Testing API endpoint...')
  
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

  try {
    console.log('📡 Testing Vercel API endpoint...')
    const response = await fetch('https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app/api/supabase-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    console.log('📊 Response status:', response.status)
    console.log('📊 Response ok:', response.ok)

    if (response.ok) {
      const result = await response.json()
      console.log('✅ API endpoint working correctly!')
      console.log('📋 Response:', result)
    } else {
      const errorText = await response.text()
      console.error('❌ API endpoint failed:', errorText)
    }

  } catch (error) {
    console.error('❌ Error testing API endpoint:', error.message)
  }

  try {
    console.log('\n📡 Testing Netlify endpoint (should fail)...')
    const netlifyResponse = await fetch('https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app/.netlify/functions/supabase-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    console.log('📊 Netlify response status:', netlifyResponse.status)
    if (netlifyResponse.status === 405) {
      console.log('✅ Correctly rejecting Netlify endpoint (as expected)')
    } else {
      console.log('⚠️ Unexpected response from Netlify endpoint')
    }

  } catch (error) {
    console.log('✅ Netlify endpoint correctly not found (as expected)')
  }
}

testAPIEndpoint()

const { Resend } = require('resend');

// Test the Netlify function logic directly
async function testNetlifyFunction() {
  console.log('🧪 Testing Netlify Function Logic...');
  
  // Set environment variables
  process.env.RESEND_API_KEY = 're_6CyBkNKP_Ekzfh7Unk9GLM7n1WMFbwdoL';
  process.env.ADMIN_EMAIL = 'dopetechnp@gmail.com';
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  // Sample order data
  const orderData = {
    orderId: 'TEST-NETLIFY-123',
    orderDbId: 999,
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
        name: 'Test Mechanical Keyboard',
        price: 15000,
        quantity: 1,
        image_url: 'test-keyboard.jpg'
      },
      {
        id: 2,
        name: 'Test Gaming Mouse',
        price: 8000,
        quantity: 2,
        image_url: 'test-mouse.jpg'
      }
    ],
    total: 31000,
    paymentOption: 'deposit',
    receiptUrl: 'https://example.com/receipt.jpg'
  };

  try {
    console.log('📧 Sending test order email via Netlify function logic...');
    
    // Generate admin email HTML (same as Netlify function)
    const adminEmailHtml = generateAdminEmailHTML(orderData, orderData.orderDbId);

    // Send admin notification email
    const { data, error } = await resend.emails.send({
      from: 'DopeTech GMK <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL],
      subject: `🚨 Test Netlify Function: ${orderData.orderId} | DopeTech GMK`,
      html: adminEmailHtml,
      replyTo: 'dopetechnp@gmail.com'
    });

    if (error) {
      console.error('❌ Error sending test email:', error);
      return;
    }

    console.log('✅ Test Netlify function email sent successfully!');
    console.log('📧 Email ID:', data?.id);
    console.log('📧 Sent to:', process.env.ADMIN_EMAIL);
    console.log('📧 Order ID:', orderData.orderId);
    console.log('📧 Total Amount: Rs', orderData.total.toLocaleString());

  } catch (error) {
    console.error('❌ Exception during test:', error);
  }
}

// Generate admin email HTML (same as Netlify function)
function generateAdminEmailHTML(orderData, orderDbId) {
  const depositAmount = orderData.paymentOption === 'deposit' ? Math.max(1, Math.round(orderData.total * 0.10)) : 0;
  const orderDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Netlify Function - DopeTech GMK</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #dc2626;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
          }
          .alert-badge {
            background-color: #dc2626;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 15px;
          }
          .order-id {
            background-color: #fef2f2;
            border: 2px solid #dc2626;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .order-id h2 {
            margin: 0;
            color: #991b1b;
            font-size: 20px;
          }
          .customer-info {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .customer-info h4 {
            margin: 0 0 15px 0;
            color: #0c4a6e;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .info-item {
            margin: 8px 0;
          }
          .info-label {
            font-weight: 600;
            color: #374151;
          }
          .info-value {
            color: #6b7280;
          }
          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin: 10px 0;
            background-color: #f9fafb;
          }
          .item-name {
            font-weight: 600;
            color: #1f2937;
          }
          .item-details {
            color: #6b7280;
            font-size: 14px;
            margin-top: 5px;
          }
          .item-price {
            font-weight: bold;
            color: #059669;
            font-size: 16px;
          }
          .total-section {
            background-color: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
          }
          .total-amount {
            font-size: 28px;
            font-weight: bold;
            color: #d97706;
            margin: 10px 0;
          }
          .urgent-note {
            background-color: #fef2f2;
            border: 2px solid #ef4444;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          .urgent-note h4 {
            margin: 0 0 10px 0;
            color: #991b1b;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎮 DopeTech GMK</div>
            <div class="alert-badge">🧪 TEST NETLIFY FUNCTION</div>
            <p style="margin: 0; color: #6b7280; font-size: 16px;">Admin Notification Test</p>
          </div>

          <div class="order-id">
            <h2>🧪 Test Order Alert</h2>
            <p style="margin: 10px 0 0 0; font-size: 18px; color: #991b1b;">
              Order ID: <strong>${orderData.orderId}</strong>
            </p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">
              Database ID: ${orderDbId} | Placed on: ${orderDate}
            </p>
          </div>

          <div class="urgent-note">
            <h4>🧪 This is a Test</h4>
            <p style="margin: 0; color: #991b1b;">
              This is a test email to verify the Netlify function is working correctly.
            </p>
          </div>

          <div class="customer-info">
            <h4>👤 Customer Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Name:</div>
                <div class="info-value">${orderData.customerInfo.fullName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email:</div>
                <div class="info-value">${orderData.customerInfo.email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone:</div>
                <div class="info-value">${orderData.customerInfo.phone}</div>
              </div>
              <div class="info-item">
                <div class="info-label">City:</div>
                <div class="info-value">${orderData.customerInfo.city}</div>
              </div>
            </div>
            <div style="margin-top: 15px;">
              <div class="info-label">Full Address:</div>
              <div class="info-value">${orderData.customerInfo.fullAddress}</div>
            </div>
          </div>

          <div>
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">📦 Order Items</h3>
            ${orderData.cart.map(item => `
              <div class="item">
                <div>
                  <div class="item-name">${item.name}</div>
                  <div class="item-details">Quantity: ${item.quantity} × Rs ${item.price.toLocaleString()}</div>
                </div>
                <div class="item-price">
                  Rs ${(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="total-section">
            <h3 style="margin: 0 0 15px 0; color: #92400e;">💰 Order Summary</h3>
            <div class="total-amount">Rs ${orderData.total.toLocaleString()}</div>
            <p style="margin: 10px 0 0 0; color: #92400e;">
              Total Order Value
            </p>
            ${orderData.paymentOption === 'deposit' ? `
              <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
                Deposit Required: Rs ${depositAmount.toLocaleString()}
              </p>
              <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
                Remaining Balance: Rs ${(orderData.total - depositAmount).toLocaleString()}
              </p>
            ` : ''}
          </div>

          <div class="footer">
            <p>This is a test email from DopeTech GMK Netlify Function</p>
            <p>Test sent at: ${new Date().toLocaleString()}</p>
            <p style="margin-top: 20px; font-size: 12px;">
              © 2024 DopeTech GMK. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Run test
testNetlifyFunction().catch(console.error);

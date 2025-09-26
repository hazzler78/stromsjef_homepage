// Test script för Telegram webhook funktionalitet
// Kör med: node test-telegram-webhook.js

const testWebhook = async () => {
  const webhookUrl = 'http://localhost:3000/api/telegram-webhook'; // Ändra till din URL
  
  // Simulera en Telegram webhook med en URL
  const testUpdate = {
    update_id: 123456789,
    message: {
      message_id: 1,
      from: {
        id: 123456789,
        is_bot: false,
        first_name: "Test",
        username: "testuser"
      },
      chat: {
        id: 123456789,
        first_name: "Test",
        username: "testuser",
        type: "private"
      },
      date: Math.floor(Date.now() / 1000),
      text: "https://example.com/test-article"
    }
  };

  try {
    console.log('Testing Telegram webhook...');
    console.log('Sending test update:', JSON.stringify(testUpdate, null, 2));
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUpdate)
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed');
    }
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
  }
};

// Test webhook setup
const testWebhookSetup = async () => {
  const setupUrl = 'http://localhost:3000/api/telegram-webhook'; // Ändra till din URL
  
  try {
    console.log('Testing webhook setup...');
    
    const response = await fetch(setupUrl, {
      method: 'GET'
    });

    const result = await response.json();
    console.log('Setup response:', result);
    
    if (response.ok) {
      console.log('✅ Webhook setup test successful!');
    } else {
      console.log('❌ Webhook setup test failed');
    }
  } catch (error) {
    console.error('❌ Error testing webhook setup:', error.message);
  }
};

// Kör testerna
console.log('🚀 Starting Telegram webhook tests...\n');

testWebhookSetup()
  .then(() => {
    console.log('\n' + '='.repeat(50) + '\n');
    return testWebhook();
  })
  .then(() => {
    console.log('\n✅ All tests completed!');
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
  });

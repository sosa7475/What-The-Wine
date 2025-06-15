// Test script to verify subscription cancellation functionality
import axios from 'axios';

async function testCancellation() {
  const baseURL = 'http://localhost:5000';
  
  try {
    // 1. First login with a test user
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'agilityautomations@gmail.com',
      password: 'test123'
    }, {
      withCredentials: true
    });
    
    const cookies = loginResponse.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';
    console.log('Login successful');
    
    // 2. Get subscription details
    console.log('2. Checking subscription details...');
    const subDetailsResponse = await axios.get(`${baseURL}/api/subscription-details`, {
      headers: {
        'Cookie': cookieHeader
      }
    });
    
    console.log('Subscription details:', subDetailsResponse.data);
    
    // 3. Test cancellation if user has subscription
    if (subDetailsResponse.data.hasSubscription) {
      console.log('3. Testing subscription cancellation...');
      const cancelResponse = await axios.post(`${baseURL}/api/cancel-subscription`, {}, {
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Cancellation result:', cancelResponse.data);
      
      // 4. Verify cancellation status
      console.log('4. Verifying cancellation status...');
      const updatedSubResponse = await axios.get(`${baseURL}/api/subscription-details`, {
        headers: {
          'Cookie': cookieHeader
        }
      });
      
      console.log('Updated subscription details:', updatedSubResponse.data);
    } else {
      console.log('3. No active subscription found - cannot test cancellation');
    }
    
  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  }
}

testCancellation();
const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing Admin Login to Remote Server...');
        const response = await axios.post('https://rentverse-api.loseyourip.com/api/v1/auth/login', {
            email: 'admin@rentverse.com',
            password: 'admin123'
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('❌ Server Error:', error.response.status, error.response.data);
        } else {
            console.log('❌ Network/Client Error:', error.message);
        }
    }
}

testLogin();

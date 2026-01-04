const axios = require('axios');

async function checkAdminBookings() {
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const loginRes = await axios.post('https://rentverse-api.loseyourip.com/api/v1/auth/login', {
            email: 'admin@rentverse.com',
            password: 'admin123'
        });
        const token = loginRes.data.data.token;
        console.log('✅ Admin Logged In. Token received.');

        // 2. Try fetching bookings via the Mobile Admin Endpoint
        console.log('Fetching Admin Bookings from /api/v1/m/bookings/admin/all...');
        const bookingsRes = await axios.get('https://rentverse-api.loseyourip.com/api/v1/m/bookings/admin/all', {
            headers: { Authorization: `Bearer ${token}` },
            params: { status: 'PAID' }
        });

        console.log('✅ Response:', JSON.stringify(bookingsRes.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.log('❌ Request Failed:', error.response.status, error.response.statusText);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

checkAdminBookings();

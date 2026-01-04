const axios = require('axios');
const fs = require('fs');

async function checkAdminBookings() {
    try {
        console.log('Logging in as Admin...');
        const loginRes = await axios.post('https://rentverse-api.loseyourip.com/api/v1/auth/login', {
            email: 'admin@rentverse.com',
            password: 'admin123'
        });
        const token = loginRes.data.data.token;
        console.log('✅ Admin Logged In.');

        // 1. Try fetching PAID bookings
        console.log('\n--- Fetching PAID Bookings ---');
        try {
            const resPaid = await axios.get('https://rentverse-api.loseyourip.com/api/v1/m/bookings/admin/all', {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: 'PAID' }
            });
            console.log(`✅ Success. Count: ${resPaid.data.data.bookings.length}`);
            fs.writeFileSync('remote_bookings_paid.json', JSON.stringify(resPaid.data, null, 2));
        } catch (e) {
            console.log('❌ Failed fetching PAID:', e.message);
        }

        // 2. Try fetching ALL bookings (no status filter)
        console.log('\n--- Fetching ALL Bookings (No Status Filter) ---');
        try {
            const resAll = await axios.get('https://rentverse-api.loseyourip.com/api/v1/m/bookings/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Success. Count: ${resAll.data.data.bookings.length}`);
            fs.writeFileSync('remote_bookings_all.json', JSON.stringify(resAll.data, null, 2));

            // Log statuses found
            const statuses = resAll.data.data.bookings.map(b => b.status);
            console.log('ℹ️  Statuses found in DB:', statuses);
        } catch (e) {
            console.log('❌ Failed fetching ALL:', e.message);
        }

    } catch (error) {
        console.log('❌ Login/Setup Error:', error.message);
    }
}

checkAdminBookings();

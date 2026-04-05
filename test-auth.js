const axios = require('axios');
const API_URL = 'http://localhost:5001/auth';

const mongoose = require('mongoose');
const OTP = require('./src/models/OTP');
require('dotenv').config();

async function runAuthTests() {
    try {
        // Connect to DB to fetch OTP
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bare-beauty');

        console.log('--- Testing Authentication ---');

        const testUser = {
            name: 'Auth Tester',
            email: `tester_${Date.now()}@example.com`,
            password: 'password123',
            phone: `555-${Math.floor(1000 + Math.random() * 9000)}`
        };

        // 1. Sign Up
        console.log(`\n1. Signing up user: ${testUser.email}`);
        const signupRes = await axios.post(`${API_URL}/signup`, testUser);
        console.log(`✅ Signup successful. Token received: ${signupRes.data.token.substring(0, 20)}...`);
        const token = signupRes.data.token;

        // 2. Access Protected Route (Me)
        console.log('\n2. Accessing Protected Route (/me) with token');
        const meRes = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Accessed /me. User ID: ${meRes.data._id}`);

        // 3. Login
        console.log('\n3. Logging in');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log(`✅ Login successful. Token received.`);

        // 4. Send OTP
        console.log('\n4. Sending OTP');
        await axios.post(`${API_URL}/send-otp`, { email: testUser.email });
        console.log('✅ OTP request sent');

        // 5. Verify OTP (Real)
        console.log('\n5. Verifying OTP');
        // Fetch the code from DB
        const otpRecord = await OTP.findOne({ userId: meRes.data._id }).sort({ createdAt: -1 });

        if (!otpRecord) throw new Error('No OTP found in DB');
        console.log(`   Fetched code from DB: ${otpRecord.code}`);

        const otpRes = await axios.post(`${API_URL}/verify`, {
            email: testUser.email,
            code: otpRecord.code
        });
        console.log(`✅ Verification result: ${otpRes.data.message}`);

        console.log('\n✅ ALL AUTH TESTS PASSED');

    } catch (err) {
        console.error('❌ Test Failed:', err.response ? err.response.data : err.message);
    } finally {
        await mongoose.connection.close();
    }
}

runAuthTests();

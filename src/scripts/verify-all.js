const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5001';
let token = '';

const runTests = async () => {
    try {
        console.log('--- 1. Testing Registration & Cookies ---');
        const email = `testuser_${Date.now()}@example.com`;
        const resReg = await axios.post(`${API_URL}/auth/signup`, {
            name: 'Test User',
            email,
            password: 'password123',
            phone: '1234567890'
        });

        // Extract token from body (we kept it there for convenience, though it's also in cookie)
        // Checking cookie requires parsing 'set-cookie' header which is tricky with axios in node without jar, 
        // but we can verify the response structure.
        token = resReg.data.token;
        console.log('✅ Registered. Token received:', !!token);

        console.log('\n--- 2. Testing OTP Generation ---');
        const resOTP = await axios.post(`${API_URL}/auth/send-otp`, { email });
        console.log('✅ OTP Request:', resOTP.data.message);

        console.log('\n--- 3. Testing Preferences Update ---');
        const resPref = await axios.put(`${API_URL}/auth/profile`, {
            preferences: {
                skinType: 'Oily',
                concerns: ['Acne']
            }
        }, {
            headers: { Authorization: `Bearer ${token}` } // Using Bearer since axios node doesn't auto-send cookies
        });
        console.log('✅ Preferences Updated:', resPref.data.preferences);

        console.log('\n--- 4. Testing Image Upload ---');
        // Create a dummy file
        const dummyPath = path.join(__dirname, 'test-image.png');
        fs.writeFileSync(dummyPath, 'fake-image-content');

        const form = new FormData();
        form.append('image', fs.createReadStream(dummyPath), 'test-image.png');

        const resUpload = await axios.post(`${API_URL}/api/upload`, form, {
            headers: { ...form.getHeaders() }
        });

        console.log('✅ Image Uploaded. URL:', resUpload.data.url);

        // Cleanup
        fs.unlinkSync(dummyPath);
        console.log('\nSUCCESS: All endpoint tests passed!');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.response ? error.response.data : error.message);
    }
};

// Wait for server to potentially restart
setTimeout(runTests, 2000);

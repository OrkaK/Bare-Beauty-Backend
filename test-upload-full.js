const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5001';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

async function runFullUploadTest() {
    try {
        console.log('--- Testing Full Image Upload Flow ---');

        if (!fs.existsSync(TEST_IMAGE_PATH)) {
            fs.writeFileSync(TEST_IMAGE_PATH, 'dummy image content');
        }

        console.log('\n1. Login Authentication Flow');

        const testUser = {
            name: 'Upload Tester',
            email: `uploader_${Date.now()}@example.com`,
            password: 'password123',
            phone: `555-${Math.floor(10000 + Math.random() * 90000)}`
        };

        const signupRes = await axios.post(`${API_URL}/auth/signup`, testUser);
        const token = signupRes.data.token;
        const userId = signupRes.data._id;
        console.log(`✅ Signed up as ${testUser.email}. Token received.`);

        // 2. Upload Avatar (User Route)
        console.log('\n2. Testing Avatar Upload (PUT /auth/profile)');
        const form = new FormData();
        form.append('avatar', fs.createReadStream(TEST_IMAGE_PATH));

        const profileRes = await axios.put(`${API_URL}/auth/profile`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log(`✅ Profile updated. Avatar URL: ${profileRes.data.avatar}`);

        if (profileRes.data.avatar && (profileRes.data.avatar.includes('http') || profileRes.data.avatar.includes('uploads'))) {
            console.log('   Avatar URL looks valid.');
        } else {
            console.log('   ⚠️ Avatar URL might be missing or invalid.');
        }

        console.log('\n✅ Upload Test Completed');

    } catch (err) {
        console.error('❌ Test Failed:', err.response ? err.response.data : err.message);
    }
}

runFullUploadTest();

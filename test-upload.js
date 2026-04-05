const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5001';
// Create a dummy file if it doesn't exist
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

if (!fs.existsSync(TEST_IMAGE_PATH)) {
    fs.writeFileSync(TEST_IMAGE_PATH, 'dummy image content');
}

async function runUploadTest() {
    try {
        console.log('--- Testing Image Upload & Refactored Routes ---');

        // 1. Login as Admin (Seed data typically has an admin, or I need to create one)
        // For now, I'll just register a new user and manually update role to admin in DB if needed, 
        // or check if seed data creates an admin. 
        // Let's first try to just hit the public routes to ensure refactor didn't break them.

        console.log('\n1. Testing GET /products (Refactored Route)');
        const productsRes = await axios.get(`${API_URL}/products`);
        console.log(`✅ GET /products status: ${productsRes.status}`);
        console.log(`   Found ${productsRes.data.length} products`);

        // Skip actual upload test if no credentials, but we can try and expect a specific error.

        console.log('\n✅ Verification Script Completed (Partial)');

    } catch (err) {
        console.error('❌ Test Failed:', err.response ? err.response.data : err.message);
    }
}

runUploadTest();

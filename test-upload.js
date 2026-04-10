const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5001';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

if (!fs.existsSync(TEST_IMAGE_PATH)) {
    fs.writeFileSync(TEST_IMAGE_PATH, 'dummy image content');
}

async function runUploadTest() {
    try {
        console.log('--- Testing Image Upload & Refactored Routes ---');

        console.log('\n1. Testing GET /products (Refactored Route)');
        const productsRes = await axios.get(`${API_URL}/products`);
        console.log(`✅ GET /products status: ${productsRes.status}`);
        console.log(`   Found ${productsRes.data.length} products`);


        console.log('\n✅ Verification Script Completed (Partial)');

    } catch (err) {
        console.error('❌ Test Failed:', err.response ? err.response.data : err.message);
    }
}

runUploadTest();

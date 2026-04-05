const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:5001';
let adminToken = '';
let userToken = '';
let productId = '';

// Helper to log results
const log = (msg, type = 'info') => {
    const symbols = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
    console.log(`${symbols[type]} ${msg}`);
};

async function runTests() {
    try {
        log('Starting Enhancement Verification...', 'info');

        // 1. AUTH & COOKIES
        log('Testing Auth & Cookies...', 'info');

        // Login as Admin (assuming seed created one, or we use a known one)
        // If seed doesn't create admin, we might need to register one or manually update DB.
        // For now, let's try to login as the admin from seed.js if it exists, otherwise we fail and I'll fix.
        try {
            const res = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'admin@example.com',
                password: 'adminpassword123'
            });

            adminToken = res.data.token;
            const cookies = res.headers['set-cookie'];

            if (cookies) {
                log('Cookie received on login', 'success');
                // Check if httpOnly/secure flags (hard to check secure on http localhost but we can see the string)
                if (cookies[0].includes('HttpOnly')) log('Cookie is HttpOnly', 'success');
            } else {
                log('No cookie received!', 'error');
            }
            log('Admin Login Successful', 'success');
        } catch (e) {
            log(`Admin Login Failed: ${e.message}`, 'error');
            // Try to register an admin if login failed (might not be seeded)
            // But usually seed should handle this.
        }

        // Login as User
        try {
            const res = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'jane@example.com',
                password: 'password123'
            });
            userToken = res.data.token;
            log('User Login Successful', 'success');
        } catch (e) {
            log(`User Login Failed: ${e.message}`, 'error');
        }

        // 2. IMAGE UPLOAD
        log('Testing Image Upload...', 'info');
        if (adminToken) {
            const form = new FormData();
            // Create a dummy file
            const dummyPath = path.join(__dirname, 'test-image.jpg');
            fs.writeFileSync(dummyPath, 'dummy image content');

            form.append('image', fs.createReadStream(dummyPath));

            try {
                const res = await axios.post(`${BASE_URL}/api/upload`, form, {
                    headers: {
                        ...form.getHeaders(),
                        'Authorization': `Bearer ${adminToken}`
                    }
                });

                if (res.data.url) {
                    log(`Image Uploaded: ${res.data.url}`, 'success');
                }
            } catch (e) {
                log(`Image Upload Failed: ${e.response ? e.response.data.message : e.message}`, 'error');
            }

            // Cleanup
            fs.unlinkSync(dummyPath);
        }

        // 3. ADMIN PRODUCT MANAGEMENT
        log('Testing Admin Routes...', 'info');

        // A. Create Product (Admin)
        try {
            const newProduct = {
                name: "New Admin Product",
                description: "Created by Admin",
                price: 50,
                category: "Skincare",
                stock: 100,
                images: ["http://example.com/img.jpg"]
            };

            const res = await axios.post(`${BASE_URL}/products`, newProduct, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });

            productId = res.data._id;
            log('Admin Create Product Successful', 'success');
        } catch (e) {
            log(`Admin Create Product Failed: ${e.response ? e.response.data.message : e.message}`, 'error');
        }

        // B. Update Product (Admin)
        if (productId) {
            try {
                const res = await axios.put(`${BASE_URL}/products/${productId}`, { price: 99 }, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                if (res.data.price === 99) log('Admin Update Product Successful', 'success');
            } catch (e) {
                log(`Admin Update Product Failed: ${e.message}`, 'error');
            }
        }

        // C. Create Product (Non-Admin) - Should Fail
        try {
            await axios.post(`${BASE_URL}/products`, {
                name: "Hacker Product",
                price: 1
            }, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            log('Non-Admin Create Product Failed (Expected 401/403 but got success)', 'error');
        } catch (e) {
            if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                log('Non-Admin Create Product Blocked correctly', 'success');
            } else {
                log(`Non-Admin Create Product Error: ${e.message}`, 'warn');
            }
        }

        // D. Delete Product (Admin)
        if (productId) {
            try {
                await axios.delete(`${BASE_URL}/products/${productId}`, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                log('Admin Delete Product Successful', 'success');
            } catch (e) {
                log(`Admin Delete Product Failed: ${e.message}`, 'error');
            }
        }

    } catch (error) {
        log(`Test Suite Error: ${error.message}`, 'error');
    }
}

runTests();

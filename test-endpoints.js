const axios = require('axios');
const API_URL = 'http://localhost:5001';

async function runTests() {
    try {
        console.log('--- Testing Product Catalog ---');

        // 1. Get Categories
        const categoriesRes = await axios.get(`${API_URL}/categories`);
        console.log(`Categories: ${categoriesRes.data.length} found`);

        // 2. Get Products
        const productsRes = await axios.get(`${API_URL}/products`);
        console.log(`Products: ${productsRes.data.length} found`);

        const productId = productsRes.data[0]._id;
        console.log(`Testing with Product ID: ${productId}`);

        // 3. Get Single Product
        const productRes = await axios.get(`${API_URL}/products/${productId}`);
        console.log(`Product "${productRes.data.name}" retrieved`);

        console.log('\n--- Testing Guest Cart ---');

        // 4. Create Cart
        const cartRes = await axios.post(`${API_URL}/cart`);
        const cartToken = cartRes.data.cartToken;
        console.log(`Cart created with token: ${cartToken}`);

        // 5. Add Item to Cart
        const addItemRes = await axios.post(`${API_URL}/cart/${cartToken}/items`, {
            productId: productId,
            quantity: 2
        });
        console.log(`Item added. Cart total items: ${addItemRes.data.items.length}`);

        // 6. Get Cart
        const getCartRes = await axios.get(`${API_URL}/cart/${cartToken}`);
        console.log(`Cart retrieved. Subtotal: ${getCartRes.data.total}`);

        console.log('\n--- Testing Checkout ---');

        // 7. Checkout
        const checkoutRes = await axios.post(`${API_URL}/checkout`, {
            cartToken: cartToken,
            customer: {
                name: 'Jane Doe',
                email: 'jane@example.com',
                phone: '123-456-7890',
                address: {
                    street: '123 Beauty Ln',
                    city: 'Glow City',
                    state: 'CA',
                    zip: '90210',
                    country: 'USA'
                }
            }
        });
        console.log(`Order created! Order Number: ${checkoutRes.data.orderNumber}, Total: ${checkoutRes.data.total}`);

        console.log('\n--- Testing Reviews ---');

        // 8. Add Review
        const reviewRes = await axios.post(`${API_URL}/products/${productId}/reviews`, {
            rating: 5,
            text: 'Amazing product!',
            reviewerName: 'Jane D.'
        });
        console.log(`Review added. ID: ${reviewRes.data._id}`);

        // 9. Get Reviews
        const reviewsRes = await axios.get(`${API_URL}/products/${productId}/reviews`);
        console.log(`Reviews for product: ${reviewsRes.data.length}`);

        console.log('\n--- Testing Misc ---');

        // 10. Subscribe
        const subRes = await axios.post(`${API_URL}/subscribe`, { email: 'jane@example.com' });
        console.log(subRes.data.message);

        // 11. Recommendations
        const recsRes = await axios.get(`${API_URL}/recommendations`);
        console.log(`Recommendations: ${recsRes.data.length} found`);

        console.log('\n✅ ALL TESTS PASSED');

    } catch (err) {
        console.error('❌ Test Failed:', err.response ? err.response.data : err.message);
    }
}

runTests();

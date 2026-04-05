const mongoose = require('mongoose');
const axios = require('axios');
const Cart = require('./src/models/Cart');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

(async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/bare-beauty');
        
        console.log('--- STRIPE INTEGRATION VERIFICATION ---');

        // 1. Setup a cart to test checkout
        let product = await Product.findOne();
        if (!product) {
            console.log('Creating a temporary product for testing...');
            product = await Product.create({
                name: 'Test Product',
                category: 'Testing',
                price: 25.00,
                attributes: {},
                stock: 100
            });
        }

        const testCartToken = 'test-token-stripe';
        let cart = await Cart.findOne({ cartToken: testCartToken });
        if (!cart) {
            cart = new Cart({ cartToken: testCartToken, items: [] });
        }
        cart.items = [{
            product: product._id,
            quantity: 2,
            priceAtAdd: product.price
        }];
        await cart.save();
        console.log('🛒 1. Cart initialized with items.');

        // 2. Trigger Checkout Route
        console.log('💳 2. Triggering POST /checkout API ...');
        const checkoutRes = await axios.post('http://localhost:5001/checkout', {
            cartToken: testCartToken,
            customer: {
                name: 'Test Customer',
                email: 'test@stripe.com',
                phone: '555-5555',
                address: { street: '123 Fake St', city: 'Test City', state: 'NY', zip: '10001', country: 'USA' }
            }
        });

        console.log('   [SUCCESS] Received Client Secret:', checkoutRes.data.clientSecret);
        const orderId = checkoutRes.data.orderId;
        
        const pendingOrder = await Order.findById(orderId);
        console.log(`   [DATABASE] Order paymentStatus is: [${pendingOrder.paymentStatus}]`);
        console.log(`   [DATABASE] Order saved with stripePaymentIntentId: [${pendingOrder.stripePaymentIntentId}]`);

        // 3. Trigger Webhook Route simulating Stripe background success
        console.log('🎣 3. Firing Mock Webhook from Stripe servers...');
        const webhookPayload = {
            type: 'payment_intent.succeeded',
            data: {
                object: {
                    id: pendingOrder.stripePaymentIntentId,
                    metadata: { cartToken: testCartToken }
                }
            }
        };

        const webhookRes = await axios.post('http://localhost:5001/webhook/stripe', webhookPayload, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('   [SUCCESS] Webhook Response:', webhookRes.data);

        // 4. Verify the database updated
        console.log('🔍 4. Verifying final database state...');
        const finalOrder = await Order.findById(orderId);
        console.log(`   ✅ Final Order Status is: [${finalOrder.paymentStatus}] (Expected: Paid)`);

        const finalCart = await Cart.findOne({ cartToken: testCartToken });
        console.log(`   ✅ Final Cart Items length: ${finalCart.items.length} (Expected: 0)`);

        if (finalOrder.paymentStatus === 'Paid' && finalCart.items.length === 0) {
            console.log('🎉 FULL STRIPE CHECKOUT FLOW VERIFIED!');
        }

        process.exit(0);

    } catch (e) {
        console.error('Test Error:', e.response ? e.response.data : e.message);
        process.exit(1);
    }
})();

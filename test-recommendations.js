const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const { getRecommendations } = require('./src/controllers/productController');
const dotenv = require('dotenv');

dotenv.config();

const runTest = async () => {
    try {
        // Hardcode for testing to rule out dotenv issues
        const uri = 'mongodb://127.0.0.1:27017/bare-beauty';
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');

        // Create a mock Request/Response
        const mockRes = {
            json: (data) => {
                console.log('\n--- Recommendations Result ---');
                if (data.length === 0) {
                    console.log('No products found.');
                    return;
                }
                data.forEach((p, index) => {
                    console.log(`${index + 1}. [${p.score ? 'Score: ' + p.score : 'Pop'}] ${p.name} (${p.category}) - Skin: ${p.skinType}`);
                });
            },
            status: (code) => ({
                json: (data) => console.log(`Error ${code}:`, data)
            })
        };

        // Scenario 1: User with Oily skin and Acne concern
        console.log('\nScenario 1: User with Oily Skin + "Acne" Concern');
        const mockReq1 = {
            user: {
                preferences: {
                    skinType: 'Oily',
                    concerns: ['Acne', 'Blemishes']
                }
            }
        };
        await getRecommendations(mockReq1, mockRes);

        // Scenario 2: User with Dry skin and Anti-aging concern
        console.log('\nScenario 2: User with Dry Skin + "Aging" Concern');
        const mockReq2 = {
            user: {
                preferences: {
                    skinType: 'Dry',
                    concerns: ['Aging', 'Wrinkles', 'Hydration']
                }
            }
        };
        await getRecommendations(mockReq2, mockRes);

        // Scenario 3: User with no preferences (Should show popular)
        console.log('\nScenario 3: User with No Preferences');
        const mockReq3 = {
            user: {
                preferences: {}
            }
        };
        await getRecommendations(mockReq3, mockRes);

    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected');
        process.exit();
    }
};

runTest();

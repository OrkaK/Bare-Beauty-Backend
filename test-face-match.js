const mongoose = require('mongoose');
const User = require('./src/models/User');
const { analyzeFace } = require('./src/controllers/aiController');
const dotenv = require('dotenv');

dotenv.config();

// Mock Request/Response helpers
const mockReq = (user, file) => ({
    user,
    file
});
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const runTest = async () => {
    try {
        // Hardcode for testing
        const uri = 'mongodb://127.0.0.1:27017/bare-beauty';
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB');

        // Setup Test User
        const testEmail = 'face_match_test@example.com';
        await User.deleteOne({ email: testEmail });

        const user = await User.create({
            name: 'Face Match Tester',
            email: testEmail,
            password: 'password123',
            preferences: {
                concerns: ['Acne']
            }
        });
        console.log('\nCreated Test User:', user.email);
        console.log('Original Concerns:', user.preferences.concerns);

        // Mock File Upload
        const file = {
            path: 'src/uploads/test-selfie.jpg' // Path doesn't need to exist for mock service logic
        };

        // Call Controller
        console.log('\nAnalyzing Face...');
        const req = mockReq({ id: user._id }, file);
        const res = mockRes();

        await analyzeFace(req, res);

        console.log('Analysis Result:', res.data.message);
        console.log('Detected Profile:', res.data.analysis);

        // Verify Database Update
        const updatedUser = await User.findById(user._id);
        console.log('\nUpdated User Profile:');
        console.log(' - Skin Type:', updatedUser.preferences.skinType);
        console.log(' - Shade:', updatedUser.preferences.shade);
        console.log(' - Undertone:', updatedUser.preferences.undertone);
        console.log(' - Concerns:', updatedUser.preferences.concerns);
        console.log(' - Analysis Image:', updatedUser.faceAnalysisImage);

        if (updatedUser.preferences.shade && updatedUser.faceAnalysisImage) {
            console.log('\n✅ Face Match Verification Test PASSED');
        } else {
            console.log('\n❌ Face Match Verification Test FAILED');
        }

    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected');
        process.exit();
    }
};

runTest();

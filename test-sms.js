const mongoose = require('mongoose');
const User = require('./src/models/User');
const OTP = require('./src/models/OTP');
const { sendPhoneOTP, verifyPhoneOTP, registerUser } = require('./src/controllers/authController');
const sendSMS = require('./src/utils/smsService');
const dotenv = require('dotenv');

dotenv.config();

// Mock Request/Response helpers
const mockReq = (body) => ({ body });
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
    res.cookie = (name, value, options) => {
        return res; // Chainable
    };
    return res;
};

const runTest = async () => {
    try {
        // Hardcode for testing
        const uri = 'mongodb://127.0.0.1:27017/bare-beauty';
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB');

        // Cleanup
        await User.deleteOne({ email: 'sms_test@example.com' });
        await OTP.deleteMany({}); // Clear OTPs to avoid clutter

        // 1. Register User with Phone
        console.log('\n1. Registering User...');
        const regReq = mockReq({
            name: 'SMS Tester',
            email: 'sms_test@example.com',
            password: 'password123',
            phone: '+15550001111'
        });
        const regRes = mockRes();
        await registerUser(regReq, regRes);
        console.log('Register Result:', regRes.statusCode, regRes.data.success);

        if (!regRes.data.success) throw new Error('Registration failed');

        // 2. Request Phone OTP
        console.log('\n2. Requesting Phone OTP...');
        const sendReq = mockReq({ phone: '+15550001111' });
        const sendRes = mockRes();

        // Spy on console.log to catch the code? 
        // Or just query DB which is easier for test script
        await sendPhoneOTP(sendReq, sendRes);
        console.log('Send OTP Result:', sendRes.statusCode, sendRes.data.message);

        // 3. Find OTP in DB
        const validOTP = await OTP.findOne({ type: 'phone' }).sort({ createdAt: -1 });
        if (!validOTP) throw new Error('OTP not generated in DB');
        console.log(`\n -> Retrieved OTP Code from DB: ${validOTP.code}`);

        // 4. Verify OTP
        console.log('\n3. Verifying OTP...');
        const verifyReq = mockReq({
            phone: '+15550001111',
            code: validOTP.code
        });
        const verifyRes = mockRes();
        await verifyPhoneOTP(verifyReq, verifyRes);
        console.log('Verify Result:', verifyRes.statusCode, verifyRes.data.message);

        // 5. Check User Verification Status
        const verifiedUser = await User.findOne({ email: 'sms_test@example.com' });
        console.log(`\nUser isPhoneVerified: ${verifiedUser.isPhoneVerified}`);

        if (verifiedUser.isPhoneVerified) {
            console.log('\n✅ SMS Verification Test PASSED');
        } else {
            console.log('\n❌ SMS Verification Test FAILED');
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

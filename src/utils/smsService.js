// @desc    Mock SMS Service
// @param   phone   The recipient phone number
// @param   message The SMS content
const sendSMS = async ({ phone, message }) => {
    // In production, this would use Twilio or similar SDK
    // For now, we simulate sending by logging to console
    console.log(`\n============== MOCK SMS ==============`);
    console.log(`To: ${phone}`);
    console.log(`Message: ${message}`);
    console.log(`======================================\n`);

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true, messageId: 'mock-sms-' + Date.now() };
};

module.exports = sendSMS;

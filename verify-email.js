const sendEmail = require('./src/utils/emailService');

(async () => {
    try {
        console.log('📧 Sending standalone test email to trigger Ethereal API...');
        await sendEmail({
            email: 'test-walkthrough@example.com',
            subject: 'Standalone Verification Email',
            message: 'This is a console test of the email trigger pipeline.',
            html: '<h3>Test Ethereal Config</h3><p>Direct trigger successful!</p>'
        });
        console.log('✅ Email utility testing completed.');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
})();

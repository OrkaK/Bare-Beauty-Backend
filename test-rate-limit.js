const axios = require('axios');

(async () => {
    try {
        console.log('--- Testing Rate Limiter on /auth/login ---');
        console.log('Sending 15 parallel requests...');
        
        const requests = Array.from({ length: 15 }).map(() => {
            return axios.post('http://localhost:5001/auth/login', {
                email: 'test@example.com',
                password: 'wrong_password'
            }, { validateStatus: () => true });
        });

        const responses = await Promise.all(requests);
        const statusCodes = responses.map(r => r.status);
        console.log('Response status codes:', statusCodes.join(', '));
        
        const rateLimitedCount = statusCodes.filter(c => c === 429).length;
        console.log(`Expected 5 rejected requests. Actual: ${rateLimitedCount}`);
        
        if (rateLimitedCount === 5) {
            console.log('✅ Rate limiter works perfectly!');
        } else {
            console.log('❌ Rate limiter failed or behaved unexpectedly.');
        }

        process.exit(0);
    } catch (e) {
        console.error('Test Error:', e);
        process.exit(1);
    }
})();

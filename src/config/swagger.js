const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bare Beauty API',
            version: '1.0.0',
            description: 'API Documentation for the Bare Beauty E-commerce Backend',
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Local Active Server',
            },
            {
                url: 'http://localhost:5000',
                description: 'Local Default Server',
            }
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token'
                }
            }
        }
    },
    apis: ['src/routes/*.js'], // Targets all route files for JSDoc scanning
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

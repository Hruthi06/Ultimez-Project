const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your-Destination Real-Time Bus Tracking API',
      version: '2.0.0',
      description: 'Comprehensive REST API documentation for Phase 2 bus tracking, live ETA predictions, journey planning, nearby stop discovery, notifications, and administrative analytics.',
      contact: {
        name: 'Ultimez Project Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './server.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;

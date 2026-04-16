const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PMS API Documentation',
      version: '1.0.0',
      description: 'API for Performance Management System',
    },
    servers: [
      {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5001',
        description: process.env.VERCEL_URL ? 'Production server (Vercel)' : 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  // We can explicitly outline paths through comments in controllers OR define them directly here.
  // Defining them directly here provides instant out-of-the-box completeness for MVP.
  // Use __dirname-based absolute paths for Vercel serverless environment
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js')
  ]
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "PMS Integration Docs",
    customCss: '.swagger-ui .topbar { display: none }',
  }));
  console.log(`Swagger Docs available at http://localhost:${process.env.PORT || 5001}/api/docs`);
};

module.exports = setupSwagger;

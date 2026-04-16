const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
        url: 'http://localhost:5001',
        description: 'Local development server'
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
  apis: ['./routes/*.js', './controllers/*.js']
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

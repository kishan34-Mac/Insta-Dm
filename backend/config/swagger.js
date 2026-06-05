import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Insta-Dm API Documentation',
      version: '1.0.0',
      description: 'Production API documentation for Insta-Dm SaaS',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API Version 1',
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
  apis: ['./routes/*.js'], // Files containing annotations as above
};

export const swaggerSpec = swaggerJsdoc(options);

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { paths } from './paths';
import { schemas } from './schemas';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Kiraale API',
    version: '1.0.0',
    description: 'Property listing and management platform API',
    contact: {
      name: 'Kiraale Team',
      email: 'contact@kiraale.com',
    },
    license: {
      name: 'Proprietary',
      url: 'https://kiraale.com/license',
    },
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Development server',
    },
    {
      url: 'https://api.kiraale.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme',
      },
    },
    schemas,
  },
  tags: [
    {
      name: 'Health',
      description: 'Server health and monitoring endpoints',
    },
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Admin',
      description: 'Administrative endpoints for managing the platform',
    },
    {
      name: 'Properties',
      description: 'Property listing and management endpoints',
    },
    {
      name: 'Media',
      description: 'Property media management endpoints',
    },
    {
      name: 'File Uploads',
      description: 'File upload endpoints for AWS S3',
    },
    {
      name: 'Agencies',
      description: 'Real estate agency management endpoints',
    },
    {
      name: 'Payments',
      description: 'Payment processing endpoints - M-Pesa, EVC, and payment callbacks',
    },
    {
      name: 'Pricing',
      description: 'Service pricing management endpoints',
    },
    {
      name: 'Favorites',
      description: 'User favorites management endpoints',
    },
  ],
  paths,
};

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: [],
};

const specs = swaggerJSDoc(options);

export { specs, swaggerUi };

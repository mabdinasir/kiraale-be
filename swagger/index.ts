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
  ],
  paths,
};

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: [],
};

const specs = swaggerJSDoc(options);

export { specs, swaggerUi };

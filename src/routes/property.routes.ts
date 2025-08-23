import {
  createProperty,
  deleteProperty,
  getProperties,
  getProperty,
  updateProperty,
} from '@controllers/api/property';
import { authMiddleware } from '@middleware/authMiddleware';
import type { RouteGroup } from '@models/routes';

const propertyRoutes: RouteGroup = {
  basePath: '/properties',
  routes: [
    {
      path: '/',
      method: 'get',
      middlewares: [], // Public endpoint for browsing properties
      handler: getProperties,
    },
    {
      path: '/:id',
      method: 'get',
      middlewares: [], // Public endpoint for viewing property details
      handler: getProperty,
    },
    {
      path: '/',
      method: 'post',
      middlewares: [authMiddleware], // Requires authentication to create
      handler: createProperty,
    },
    {
      path: '/:id',
      method: 'put',
      middlewares: [authMiddleware], // Requires authentication to update
      handler: updateProperty,
    },
    {
      path: '/:id',
      method: 'delete',
      middlewares: [authMiddleware], // Requires authentication to delete
      handler: deleteProperty,
    },
  ],
};

export default propertyRoutes;

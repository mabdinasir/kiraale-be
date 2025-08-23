import {
  createProperty,
  deleteProperty,
  getProperties,
  getProperty,
  updateProperty,
} from '@controllers/api/property';
import { requireResourceAccess } from '@lib/permissions/middleware';
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
      middlewares: [authMiddleware], // Authenticated users can create properties
      handler: createProperty,
    },
    {
      path: '/:id',
      method: 'put',
      middlewares: [
        authMiddleware,
        requireResourceAccess((req) => req.params.propertyOwnerId, 'PROPERTY_WRITE'),
      ], // Property owner or admin
      handler: updateProperty,
    },
    {
      path: '/:id',
      method: 'delete',
      middlewares: [
        authMiddleware,
        requireResourceAccess((req) => req.params.propertyOwnerId, 'PROPERTY_DELETE'),
      ], // Property owner or admin
      handler: deleteProperty,
    },
  ],
};

export default propertyRoutes;

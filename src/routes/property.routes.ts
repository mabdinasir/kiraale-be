import {
  createProperty,
  deleteProperty,
  getProperties,
  getProperty,
  recordPropertyView,
  searchProperty,
  updateProperty,
} from '@controllers';
import { authMiddleware, optionalAuthMiddleware } from '@middleware';
import type { RouteGroup } from '@models';

const propertyRoutes: RouteGroup = {
  basePath: '/properties',
  routes: [
    // Public endpoints
    {
      path: '/',
      method: 'get',
      middlewares: [], // Basic property listing - public
      handler: getProperties,
    },
    {
      path: '/search',
      method: 'get',
      middlewares: [], // Advanced search - public
      handler: searchProperty,
    },
    {
      path: '/:id',
      method: 'get',
      middlewares: [optionalAuthMiddleware], // Optional auth to allow owners to see pending properties
      handler: getProperty,
    },

    // View tracking endpoints
    {
      path: '/views/record',
      method: 'post',
      middlewares: [optionalAuthMiddleware], // Optional auth to allow owners to record views on pending properties
      handler: recordPropertyView,
    },

    // Property management endpoints
    {
      path: '/',
      method: 'post',
      middlewares: [authMiddleware], // Create property - requires auth
      handler: createProperty,
    },
    {
      path: '/:id',
      method: 'put',
      middlewares: [authMiddleware], // Property ownership is checked in controller
      handler: updateProperty,
    },
    {
      path: '/:id',
      method: 'delete',
      middlewares: [authMiddleware], // Property ownership is checked in controller
      handler: deleteProperty,
    },
  ],
};

export default propertyRoutes;

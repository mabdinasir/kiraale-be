import {
  createProperty,
  deleteProperty,
  getProperties,
  getProperty,
  getPropertyAnalytics,
  getTrendingProperties,
  recordPropertyView,
  searchProperties,
  updateProperty,
} from '@controllers/api/property';
import { authMiddleware } from '@middleware/authMiddleware';
import type { RouteGroup } from '@models/routes';

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
      handler: searchProperties,
    },
    {
      path: '/trending',
      method: 'get',
      middlewares: [], // Trending properties - public
      handler: getTrendingProperties,
    },
    {
      path: '/:id',
      method: 'get',
      middlewares: [], // View tracking handled by separate API endpoint
      handler: getProperty,
    },

    // View tracking endpoints
    {
      path: '/views/record',
      method: 'post',
      middlewares: [], // Manual view recording - public
      handler: recordPropertyView,
    },
    {
      path: '/:id/analytics',
      method: 'get',
      middlewares: [authMiddleware], // Property analytics - requires auth
      handler: getPropertyAnalytics,
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

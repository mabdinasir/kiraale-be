import {
  createInspection,
  createMaintenance,
  createProperty,
  deleteInspection,
  deleteMaintenance,
  deleteProperty,
  getInspection,
  getMaintenance,
  getProperties,
  getProperty,
  recordPropertyView,
  searchInspections,
  searchMaintenance,
  searchProperty,
  updateMaintenance,
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

    // Search endpoints for inspections and maintenance (must be before /search to avoid conflict)
    {
      path: '/search/inspections',
      method: 'get',
      middlewares: [authMiddleware],
      handler: searchInspections,
    },
    {
      path: '/search/maintenance',
      method: 'get',
      middlewares: [authMiddleware],
      handler: searchMaintenance,
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

    // Inspection management
    {
      path: '/:id/inspections',
      method: 'post',
      middlewares: [authMiddleware],
      handler: createInspection,
    },
    {
      path: '/inspections/:id',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getInspection,
    },
    {
      path: '/inspections/:id',
      method: 'delete',
      middlewares: [authMiddleware],
      handler: deleteInspection,
    },

    // Maintenance management
    {
      path: '/:id/maintenance',
      method: 'post',
      middlewares: [authMiddleware],
      handler: createMaintenance,
    },
    {
      path: '/maintenance/:id',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getMaintenance,
    },
    {
      path: '/maintenance/:id',
      method: 'put',
      middlewares: [authMiddleware],
      handler: updateMaintenance,
    },
    {
      path: '/maintenance/:id',
      method: 'delete',
      middlewares: [authMiddleware],
      handler: deleteMaintenance,
    },
  ],
};

export default propertyRoutes;

import {
  adminUpdateUser,
  approveProperty,
  createPricing,
  getAdminStats,
  getPaymentById,
  getPayments,
  getPaymentStats,
  getPendingProperties,
  getPricing,
  getProperty,
  getPropertyAnalytics,
  getRejectedProperties,
  getTrendingProperties,
  getUsers,
  rejectProperty,
  searchUsers,
  suspendUser,
  updatePricing,
} from '@controllers/api/admin';
import { adminMiddleware } from '@lib/permissions/middleware';
import { authMiddleware } from '@middleware/authMiddleware';
import type { RouteGroup } from '@models/routes';

const adminRoutes: RouteGroup = {
  basePath: '/admin',
  routes: [
    {
      path: '/properties/pending',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: getPendingProperties,
    },
    {
      path: '/properties/:id/approve',
      method: 'put',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: approveProperty,
    },
    {
      path: '/properties/:id/reject',
      method: 'put',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: rejectProperty,
    },
    {
      path: '/properties/rejected',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: getRejectedProperties,
    },
    {
      path: '/stats',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: getAdminStats,
    },
    {
      path: '/payments',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: getPayments,
    },
    {
      path: '/payments/stats',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: getPaymentStats,
    },
    {
      path: '/payments/:paymentId',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: getPaymentById,
    },
    {
      path: '/pricing',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: getPricing,
    },
    {
      path: '/pricing',
      method: 'post',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: createPricing,
    },
    {
      path: '/pricing/:pricingId',
      method: 'put',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: updatePricing,
    },
    {
      path: '/users/search',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: searchUsers,
    },
    {
      path: '/users/:userId/suspend',
      method: 'put',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: suspendUser,
    },
    {
      path: '/users/:id',
      method: 'put',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: adminUpdateUser,
    },
    {
      path: '/users',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: getUsers,
    },
    {
      path: '/properties/trending',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: getTrendingProperties,
    },
    {
      path: '/properties/:id',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: getProperty,
    },
    {
      path: '/properties/:id/analytics',
      method: 'get',
      middlewares: [authMiddleware, adminMiddleware.requireAdmin], // Admin only
      handler: getPropertyAnalytics,
    },
  ],
};

export default adminRoutes;

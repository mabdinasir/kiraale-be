import {
  approveProperty,
  createPricing,
  getPaymentById,
  getPayments,
  getPaymentStats,
  getPendingProperties,
  getPricing,
  rejectProperty,
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
  ],
};

export default adminRoutes;

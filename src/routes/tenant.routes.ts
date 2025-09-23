import {
  addFamilyMember,
  createInspection,
  createMaintenance,
  createTenant,
  deleteTenantDocument,
  endTenantLease,
  getDeposits,
  getFamilyMembers,
  getMaintenanceHistory,
  getMyTenants,
  getMyTenantsPayments,
  getPaymentHistory,
  getTenant,
  getTenantDocuments,
  getTenants,
  recordDeposit,
  recordRentPayment,
  refundDeposit,
  removeFamilyMember,
  searchMyProperties,
  searchTenants,
  updateFamilyMember,
  updateMaintenance,
  updateTenant,
  uploadTenantDocument,
} from '@controllers';
import { authMiddleware } from '@middleware';
import type { RouteGroup } from '@models';

const tenantRoutes: RouteGroup = {
  basePath: '/tenants',
  routes: [
    // Search endpoints for UI
    {
      path: '/search',
      method: 'get',
      middlewares: [authMiddleware],
      handler: searchTenants,
    },
    {
      path: '/properties/search',
      method: 'get',
      middlewares: [authMiddleware],
      handler: searchMyProperties,
    },

    // Overview endpoints - all user's tenants
    {
      path: '/my-tenants',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getMyTenants,
    },
    {
      path: '/my-tenants/payments',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getMyTenantsPayments,
    },

    // Tenant management
    {
      path: '/properties/:id/tenants',
      method: 'post',
      middlewares: [authMiddleware],
      handler: createTenant,
    },
    {
      path: '/properties/:id/tenants',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getTenants,
    },
    {
      path: '/:id',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getTenant,
    },
    {
      path: '/:id',
      method: 'put',
      middlewares: [authMiddleware],
      handler: updateTenant,
    },
    {
      path: '/:id/end-tenant-lease',
      method: 'put',
      middlewares: [authMiddleware],
      handler: endTenantLease,
    },

    // Family member management
    {
      path: '/:id/family-members',
      method: 'post',
      middlewares: [authMiddleware],
      handler: addFamilyMember,
    },
    {
      path: '/:id/family-members',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getFamilyMembers,
    },
    {
      path: '/family-members/:id',
      method: 'put',
      middlewares: [authMiddleware],
      handler: updateFamilyMember,
    },
    {
      path: '/family-members/:id',
      method: 'delete',
      middlewares: [authMiddleware],
      handler: removeFamilyMember,
    },

    // Deposit management
    {
      path: '/:id/deposits',
      method: 'post',
      middlewares: [authMiddleware],
      handler: recordDeposit,
    },
    {
      path: '/:id/deposits',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getDeposits,
    },
    {
      path: '/deposits/:id/refund',
      method: 'put',
      middlewares: [authMiddleware],
      handler: refundDeposit,
    },

    // Payment management
    {
      path: '/:id/payments',
      method: 'post',
      middlewares: [authMiddleware],
      handler: recordRentPayment,
    },
    {
      path: '/:id/payments',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getPaymentHistory,
    },

    // Document management
    {
      path: '/:id/documents',
      method: 'post',
      middlewares: [authMiddleware],
      handler: uploadTenantDocument,
    },
    {
      path: '/:id/documents',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getTenantDocuments,
    },
    {
      path: '/documents/:id',
      method: 'delete',
      middlewares: [authMiddleware],
      handler: deleteTenantDocument,
    },

    // Inspection management
    {
      path: '/properties/:id/inspections',
      method: 'post',
      middlewares: [authMiddleware],
      handler: createInspection,
    },

    // Maintenance management
    {
      path: '/properties/:id/maintenance',
      method: 'post',
      middlewares: [authMiddleware],
      handler: createMaintenance,
    },
    {
      path: '/maintenance/:id',
      method: 'put',
      middlewares: [authMiddleware],
      handler: updateMaintenance,
    },
    {
      path: '/properties/:id/maintenance-history',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getMaintenanceHistory,
    },
  ],
};

export default tenantRoutes;

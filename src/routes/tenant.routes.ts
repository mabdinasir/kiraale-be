import {
  addFamilyMember,
  createInspection,
  createMaintenance,
  createTenant,
  deleteDeposit,
  deleteInspection,
  deleteMaintenance,
  deleteRentPayment,
  deleteTenant,
  deleteTenantDocument,
  endTenantLease,
  getFamilyMembers,
  getInspection,
  getMaintenance,
  getMyTenants,
  getTenant,
  getTenants,
  recordDeposit,
  recordRentPayment,
  refundDeposit,
  removeFamilyMember,
  searchDeposits,
  searchInactiveTenants,
  searchInspections,
  searchMaintenance,
  searchMyProperties,
  searchRentPayments,
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
      path: '/search/inactive',
      method: 'get',
      middlewares: [authMiddleware],
      handler: searchInactiveTenants,
    },
    {
      path: '/properties/search',
      method: 'get',
      middlewares: [authMiddleware],
      handler: searchMyProperties,
    },
    {
      path: '/search/rent-payments',
      method: 'get',
      middlewares: [authMiddleware],
      handler: searchRentPayments,
    },
    {
      path: '/search/deposits',
      method: 'get',
      middlewares: [authMiddleware],
      handler: searchDeposits,
    },
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

    // Overview endpoints - all user's tenants
    {
      path: '/my-tenants',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getMyTenants,
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
      path: '/:id',
      method: 'delete',
      middlewares: [authMiddleware],
      handler: deleteTenant,
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
      path: '/deposits/:id/refund',
      method: 'put',
      middlewares: [authMiddleware],
      handler: refundDeposit,
    },
    {
      path: '/deposits/:id',
      method: 'delete',
      middlewares: [authMiddleware],
      handler: deleteDeposit,
    },

    // Payment management
    {
      path: '/:id/rent-payments',
      method: 'post',
      middlewares: [authMiddleware],
      handler: recordRentPayment,
    },
    {
      path: '/rent-payments/:id',
      method: 'delete',
      middlewares: [authMiddleware],
      handler: deleteRentPayment,
    },

    // Document management
    {
      path: '/:id/documents',
      method: 'post',
      middlewares: [authMiddleware],
      handler: uploadTenantDocument,
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
      path: '/properties/:id/maintenance',
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

export default tenantRoutes;

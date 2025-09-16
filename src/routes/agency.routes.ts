import {
  addAgent,
  createAgency,
  deleteAgency,
  getAgencies,
  getAgency,
  removeAgent,
  searchAgency,
  updateAgency,
  updateAgentRole,
} from '@controllers';
import { requireAgencyAccess } from '@lib';
import { authMiddleware } from '@middleware';
import type { RouteGroup } from '@models';

const agencyRoutes: RouteGroup = {
  basePath: '/agencies',
  routes: [
    {
      path: '/',
      method: 'get',
      handler: getAgencies, // Public - anyone can browse agencies
    },
    {
      path: '/search',
      method: 'get',
      handler: searchAgency, // Public - agency search
    },
    {
      path: '/',
      method: 'post',
      middlewares: [authMiddleware],
      handler: createAgency, // Any authenticated user can create an agency
    },
    {
      path: '/:id',
      method: 'get',
      handler: getAgency, // Public - anyone can view agency details
    },
    {
      path: '/:id',
      method: 'put',
      middlewares: [authMiddleware, requireAgencyAccess('AGENCY_WRITE')],
      handler: updateAgency, // Agency owner/admin or platform admin
    },
    {
      path: '/:id',
      method: 'delete',
      middlewares: [authMiddleware, requireAgencyAccess('AGENCY_DELETE')],
      handler: deleteAgency, // Agency owner or platform admin
    },
    {
      path: '/:id/agents',
      method: 'post',
      middlewares: [authMiddleware, requireAgencyAccess('AGENCY_WRITE')],
      handler: addAgent, // Agency admin or platform admin
      // This api allows agency admin to add agents to their agency
    },
    {
      path: '/:agencyId/agents/:userId',
      method: 'delete',
      middlewares: [authMiddleware, requireAgencyAccess('AGENCY_WRITE')],
      handler: removeAgent, // Agency admin, platform admin, or self
    },
    {
      path: '/:agencyId/agents/:userId/role',
      method: 'put',
      middlewares: [authMiddleware, requireAgencyAccess('AGENCY_WRITE')],
      handler: updateAgentRole, // Agency admin or platform admin
    },
  ],
};

export default agencyRoutes;

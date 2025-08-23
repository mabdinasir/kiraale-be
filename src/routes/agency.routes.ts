import {
  addAgent,
  createAgency,
  deleteAgency,
  getAgencies,
  getAgency,
  removeAgent,
  updateAgency,
} from '@controllers/api/agency';
import { agencyMiddleware, requireAgencyAccess } from '@lib/permissions/middleware';
import { authMiddleware } from '@middleware/authMiddleware';
import type { RouteGroup } from '@models/routes';

const agencyRoutes: RouteGroup = {
  basePath: '/agencies',
  routes: [
    {
      path: '/',
      method: 'get',
      handler: getAgencies, // Public - anyone can browse agencies
    },
    {
      path: '/',
      method: 'post',
      middlewares: [authMiddleware, agencyMiddleware.canWrite],
      handler: createAgency, // Authenticated agents can create agencies
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
    },
    {
      path: '/:agencyId/agents/:userId',
      method: 'delete',
      middlewares: [authMiddleware, requireAgencyAccess('AGENCY_WRITE')],
      handler: removeAgent, // Agency admin, platform admin, or self
    },
  ],
};

export default agencyRoutes;

import type { RouteGroup } from '@models/routes';
import type { Router } from 'express';
import adminRoutes from './admin.routes';
import agencyRoutes from './agency.routes';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import mediaRoutes from './media.routes';
import propertyRoutes from './property.routes';
import { registerSwaggerRoutes } from './swagger.routes';
import userRoutes from './user.routes';

function registerRouteGroups(router: Router, groups: RouteGroup[]): void {
  groups.forEach((group) => {
    group.routes.forEach((route) => {
      const fullPath = `/api${group.basePath}${route.path}`;
      router[route.method](fullPath, ...(route.middlewares ?? []), route.handler);
    });
  });
}

function configureRoutes(router: Router): void {
  // Register swagger routes directly
  registerSwaggerRoutes(router);

  // Register other route groups
  const routeGroups = [
    adminRoutes,
    agencyRoutes,
    authRoutes,
    healthRoutes,
    mediaRoutes,
    propertyRoutes,
    userRoutes,
  ];
  registerRouteGroups(router, routeGroups);
}

export default configureRoutes;

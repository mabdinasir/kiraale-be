import type { Router } from 'express';
import { specs, swaggerUi } from '../../swagger';

// Simple function to register swagger directly on the router
export function registerSwaggerRoutes(router: Router): void {
  router.use('/api/swagger', swaggerUi.serve);
  router.get(
    '/api/swagger',
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Kiraale API Documentation',
    }),
  );
}

// Keep the old export for compatibility but it won't be used
export default {
  basePath: '/swagger',
  routes: [],
};

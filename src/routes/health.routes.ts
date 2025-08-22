import { health } from '@controllers/api/health';
import type { RouteGroup } from '@models/routes';

const healthRoutes: RouteGroup = {
  basePath: '/health',
  routes: [
    {
      path: '',
      method: 'get',
      handler: health,
    },
  ],
};

export default healthRoutes;

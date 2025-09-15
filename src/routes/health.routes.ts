import { health } from '@controllers';
import type { RouteGroup } from '@models';

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

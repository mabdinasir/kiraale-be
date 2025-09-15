import { getPublicPricing } from '@controllers';
import type { RouteGroup } from '@models';

const pricingRoutes: RouteGroup = {
  basePath: '/pricing',
  routes: [
    {
      path: '/',
      method: 'get',
      middlewares: [], // Public endpoint
      handler: getPublicPricing,
    },
  ],
};

export default pricingRoutes;

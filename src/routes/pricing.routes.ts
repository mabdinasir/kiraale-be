import { getPublicPricing } from '@controllers/api/pricing';
import type { RouteGroup } from '@models/routes';

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

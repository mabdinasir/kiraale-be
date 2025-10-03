import { createContact } from '@controllers';
import type { RouteGroup } from '@models';

const contactRoutes: RouteGroup = {
  basePath: '/contact',
  routes: [
    {
      path: '/',
      method: 'post',
      handler: createContact,
    },
  ],
};

export default contactRoutes;

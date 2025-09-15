import { evcCallback, evcPayment, mpesaCallback, stkPush } from '@controllers';
import { authMiddleware, mpesaAccessToken } from '@middleware';
import type { RouteGroup } from '@models';

const paymentRoutes: RouteGroup = {
  basePath: '/payments',
  routes: [
    {
      path: '/mpesa/stkpush',
      method: 'post',
      middlewares: [authMiddleware, mpesaAccessToken],
      handler: stkPush,
    },
    {
      path: '/evc/payment',
      method: 'post',
      middlewares: [authMiddleware],
      handler: evcPayment,
    },
    {
      path: '/callbacks/mpesa',
      method: 'post',
      middlewares: [],
      handler: mpesaCallback,
    },
    {
      path: '/callbacks/evc',
      method: 'post',
      middlewares: [],
      handler: evcCallback,
    },
  ],
};

export default paymentRoutes;

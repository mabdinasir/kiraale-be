import {
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  signup,
} from '@controllers';
import { authMiddleware } from '@middleware';
import type { RouteGroup } from '@models';

const authRoutes: RouteGroup = {
  basePath: '/auth',
  routes: [
    {
      path: '/signup',
      method: 'post',
      handler: signup,
    },
    {
      path: '/login',
      method: 'post',
      handler: login,
    },
    {
      path: '/logout',
      method: 'post',
      middlewares: [authMiddleware],
      handler: logout,
    },
    {
      path: '/request-password-reset',
      method: 'post',
      handler: requestPasswordReset,
    },
    {
      path: '/reset-password',
      method: 'post',
      handler: resetPassword,
    },
    {
      path: '/refresh-token',
      method: 'post',
      handler: refreshToken,
    },
  ],
};

export default authRoutes;

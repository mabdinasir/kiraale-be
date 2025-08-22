import { login, logout, requestPasswordReset, resetPassword, signup } from '@controllers/api/auth';
import refreshToken from '@controllers/api/auth/refreshToken';
import { authMiddleware } from '@middleware/authMiddleware';
import type { RouteGroup } from '@models/routes';

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

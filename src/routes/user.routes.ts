import { deleteUser, getUser, getUsers, updateUser } from '@controllers/api/user';
import { UserMiddleware } from '@lib/permissions';
import { authMiddleware } from '@middleware/authMiddleware';
import type { RouteGroup } from '@models/routes';

const userRoutes: RouteGroup = {
  basePath: '/users',
  routes: [
    {
      path: '/',
      method: 'get',
      middlewares: [authMiddleware, UserMiddleware.canRead],
      handler: getUsers,
    },
    {
      path: '/:id',
      method: 'get',
      middlewares: [authMiddleware, UserMiddleware.canRead],
      handler: getUser,
    },
    {
      path: '/:id',
      method: 'put',
      middlewares: [authMiddleware, UserMiddleware.canWrite],
      handler: updateUser,
    },
    {
      path: '/:id',
      method: 'delete',
      middlewares: [authMiddleware, UserMiddleware.canDelete],
      handler: deleteUser,
    },
  ],
};

export default userRoutes;

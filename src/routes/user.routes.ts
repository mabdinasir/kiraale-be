import { deleteUser, getUser, getUsers, updateUser, uploadProfilePic } from '@controllers/api/user';
import { authMiddleware } from '@middleware/authMiddleware';
import type { RouteGroup } from '@models/routes';

const userRoutes: RouteGroup = {
  basePath: '/users',
  routes: [
    {
      path: '/',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getUsers,
    },
    {
      path: '/:id',
      method: 'get',
      middlewares: [authMiddleware],
      handler: getUser,
    },
    {
      path: '/:id',
      method: 'put',
      middlewares: [authMiddleware],
      handler: updateUser,
    },
    {
      path: '/:id',
      method: 'delete',
      middlewares: [authMiddleware],
      handler: deleteUser,
    },
    {
      path: '/profile-picture/upload',
      method: 'post',
      middlewares: [authMiddleware],
      handler: uploadProfilePic,
    },
  ],
};

export default userRoutes;

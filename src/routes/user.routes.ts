import { changePassword } from '@controllers/api/auth';
import {
  addToFavorites,
  deactivateUser,
  deleteUser,
  getMyFavorites,
  getMyProperties,
  getUser,
  removeFromFavorites,
  updateUser,
  uploadProfilePic,
} from '@controllers/api/user';
import { requireResourceAccess } from '@lib/permissions/middleware';
import { authMiddleware } from '@middleware/authMiddleware';
import type { RouteGroup } from '@models/routes';

const userRoutes: RouteGroup = {
  basePath: '/users',
  routes: [
    // Specific routes must come before parameterized routes to avoid conflicts
    {
      path: '/change-password',
      method: 'patch',
      middlewares: [authMiddleware], // Users can change their own password
      handler: changePassword,
    },
    {
      path: '/deactivate',
      method: 'patch',
      middlewares: [authMiddleware], // Users can deactivate their own account
      handler: deactivateUser,
    },
    {
      path: '/profile-picture/upload',
      method: 'post',
      middlewares: [authMiddleware], // Authenticated users can upload their own profile picture
      handler: uploadProfilePic,
    },
    {
      path: '/myProperties',
      method: 'get',
      middlewares: [authMiddleware], // Users can view their own properties
      handler: getMyProperties,
    },
    {
      path: '/myFavorites',
      method: 'get',
      middlewares: [authMiddleware], // Users can view their own favorites
      handler: getMyFavorites,
    },
    {
      path: '/favorites',
      method: 'post',
      middlewares: [authMiddleware], // Users can add to their own favorites
      handler: addToFavorites,
    },
    {
      path: '/favorites/:propertyId',
      method: 'delete',
      middlewares: [authMiddleware], // Users can remove from their own favorites
      handler: removeFromFavorites,
    },
    // Parameterized routes come last to avoid matching specific routes
    {
      path: '/:id',
      method: 'get',
      middlewares: [authMiddleware, requireResourceAccess((req) => req.params.id, 'USER_READ')], // Self or admin
      handler: getUser,
    },
    {
      path: '/:id',
      method: 'put',
      middlewares: [authMiddleware, requireResourceAccess((req) => req.params.id, 'USER_WRITE')], // Self or admin
      handler: updateUser,
    },
    {
      path: '/:id',
      method: 'delete',
      middlewares: [authMiddleware, requireResourceAccess((req) => req.params.id, 'USER_DELETE')], // Self or admin
      handler: deleteUser,
    },
  ],
};

export default userRoutes;

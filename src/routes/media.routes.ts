import {
  createMedia,
  deleteMedia,
  deleteMediaUpload,
  getMedia,
  getMediaList,
  updateMedia,
  uploadMedia,
} from '@controllers/api/media';
import { authMiddleware } from '@middleware/authMiddleware';
import type { RouteGroup } from '@models/routes';

const mediaRoutes: RouteGroup = {
  basePath: '/media',
  routes: [
    {
      path: '/',
      method: 'get',
      middlewares: [], // Public endpoint for browsing media
      handler: getMediaList,
    },
    {
      path: '/:id',
      method: 'get',
      middlewares: [], // Public endpoint for viewing media details
      handler: getMedia,
    },
    {
      path: '/',
      method: 'post',
      middlewares: [authMiddleware], // Requires authentication to create
      handler: createMedia,
    },
    {
      path: '/:id',
      method: 'put',
      middlewares: [authMiddleware], // Requires authentication to update
      handler: updateMedia,
    },
    {
      path: '/:id',
      method: 'delete',
      middlewares: [authMiddleware], // Requires authentication to delete
      handler: deleteMedia,
    },
    {
      path: '/upload',
      method: 'post',
      middlewares: [authMiddleware], // AWS file upload
      handler: uploadMedia,
    },
    {
      path: '/upload/delete',
      method: 'delete',
      middlewares: [authMiddleware], // AWS file delete
      handler: deleteMediaUpload,
    },
  ],
};

export default mediaRoutes;

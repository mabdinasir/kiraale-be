import {
  createMedia,
  deleteMedia,
  deleteMediaUpload,
  getMedia,
  getMediaList,
  updateMedia,
  uploadMedia,
} from '@controllers';
import { authMiddleware, requireMediaOwnership } from '@middleware';
import type { RouteGroup } from '@models';

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
      middlewares: [authMiddleware], // Authenticated users can create media
      handler: createMedia,
    },
    {
      path: '/:id',
      method: 'put',
      middlewares: [authMiddleware, requireMediaOwnership('MEDIA_WRITE')], // Property owner or admin
      handler: updateMedia,
    },
    {
      path: '/:id',
      method: 'delete',
      middlewares: [authMiddleware, requireMediaOwnership('MEDIA_DELETE')], // Property owner or admin
      handler: deleteMedia,
    },
    {
      path: '/upload',
      method: 'post',
      middlewares: [authMiddleware], // Authenticated users can upload media
      handler: uploadMedia,
    },
    {
      path: '/upload/delete',
      method: 'delete',
      middlewares: [authMiddleware], // Authenticated users can delete uploads
      handler: deleteMediaUpload,
    },
  ],
};

export default mediaRoutes;

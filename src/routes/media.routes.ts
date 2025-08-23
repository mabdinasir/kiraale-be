import {
  createMedia,
  deleteMedia,
  deleteMediaUpload,
  getMedia,
  getMediaList,
  updateMedia,
  uploadMedia,
} from '@controllers/api/media';
import { requireResourceAccess } from '@lib/permissions/middleware';
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
      middlewares: [authMiddleware], // Authenticated users can create media
      handler: createMedia,
    },
    {
      path: '/:id',
      method: 'put',
      middlewares: [
        authMiddleware,
        requireResourceAccess((req) => req.params.propertyOwnerId, 'MEDIA_WRITE'),
      ], // Property owner or admin
      handler: updateMedia,
    },
    {
      path: '/:id',
      method: 'delete',
      middlewares: [
        authMiddleware,
        requireResourceAccess((req) => req.params.propertyOwnerId, 'MEDIA_DELETE'),
      ], // Property owner or admin
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

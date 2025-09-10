/* eslint-disable @typescript-eslint/naming-convention */
export const mediaUploadsPaths = {
  '/api/media/upload': {
    post: {
      tags: ['File Uploads'],
      summary: 'Upload property media files',
      description: 'Upload property media files to AWS S3 (First upload requires 4+ images, Max 25MB each)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['propertyId', 'files'],
              properties: {
                propertyId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'ID of the property to upload media for',
                },
                files: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'binary',
                  },
                  description: 'Media files to upload (images/videos)',
                  minItems: 1,
                  maxItems: 10,
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Media uploaded successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FileUploadResponse' },
            },
          },
        },
        400: {
          description: 'Validation error (file type, size, or first upload requirements)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        401: {
          description: 'Unauthorized - Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Forbidden - Can only upload to own properties',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Property not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error or S3 upload failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/media/upload/delete': {
    delete: {
      tags: ['File Uploads'],
      summary: 'Delete media files from S3 and database',
      description: 'Delete media files from both S3 and database (property owner or admin only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/DeleteMediaRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Media files deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Media deleted successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      deletedIds: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' },
                        example: ['123e4567-e89b-12d3-a456-426614174000'],
                      },
                      deletedCount: { type: 'integer', example: 1 },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error or media IDs mismatch',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        401: {
          description: 'Unauthorized - Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Forbidden - Can only delete from own properties',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Property not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error or S3 deletion failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
};

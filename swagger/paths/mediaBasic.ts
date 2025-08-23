/* eslint-disable @typescript-eslint/naming-convention */
export const mediaBasicPaths = {
  '/api/media': {
    get: {
      tags: ['Media'],
      summary: 'Get all media',
      description: 'Retrieve a paginated list of media with optional filtering',
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
        {
          name: 'propertyId',
          in: 'query',
          description: 'Filter by property ID',
          required: false,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          name: 'type',
          in: 'query',
          description: 'Filter by media type',
          required: false,
          schema: {
            type: 'string',
            enum: ['IMAGE', 'VIDEO', 'VIRTUAL_TOUR', 'FLOOR_PLAN'],
          },
        },
        {
          name: 'isPrimary',
          in: 'query',
          description: 'Filter by primary media',
          required: false,
          schema: { type: 'boolean' },
        },
      ],
      responses: {
        200: {
          description: 'Media retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MediaPaginatedResponse' },
            },
          },
        },
        400: {
          description: 'Invalid query parameters',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    post: {
      tags: ['Media'],
      summary: 'Create media record',
      description: 'Create a new media record manually (property owner or admin only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateMediaRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Media created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Media created successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      media: { $ref: '#/components/schemas/Media' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error',
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
          description: 'Forbidden - Access denied',
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
          description: 'Internal server error',
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

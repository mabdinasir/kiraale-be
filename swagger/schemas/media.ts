/* eslint-disable @typescript-eslint/naming-convention */
export const mediaSchemas = {
  Media: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      propertyId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      type: {
        type: 'string',
        enum: ['IMAGE', 'VIDEO', 'VIRTUAL_TOUR', 'FLOOR_PLAN'],
        example: 'IMAGE',
      },
      url: {
        type: 'string',
        format: 'uri',
        example: 'https://s3.amazonaws.com/bucket/image.jpg',
      },
      fileName: {
        type: 'string',
        example: 'house-front-view.jpg',
      },
      fileSize: {
        type: 'integer',
        example: 2048576,
      },
      displayOrder: {
        type: 'integer',
        minimum: 1,
        example: 1,
      },
      isPrimary: {
        type: 'boolean',
        example: true,
      },
      uploadedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00Z',
      },
    },
  },
  CreateMediaRequest: {
    type: 'object',
    required: ['propertyId', 'type', 'url', 'fileName'],
    properties: {
      propertyId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      type: {
        type: 'string',
        enum: ['IMAGE', 'VIDEO', 'VIRTUAL_TOUR', 'FLOOR_PLAN'],
        example: 'IMAGE',
      },
      url: {
        type: 'string',
        format: 'uri',
        example: 'https://s3.amazonaws.com/bucket/image.jpg',
      },
      fileName: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        example: 'house-front-view.jpg',
      },
      fileSize: {
        type: 'integer',
        minimum: 1,
        maximum: 15728640,
        example: 2048576,
      },
      displayOrder: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        example: 1,
      },
      isPrimary: {
        type: 'boolean',
        default: false,
        example: false,
      },
    },
  },
  UpdateMediaRequest: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['IMAGE', 'VIDEO', 'VIRTUAL_TOUR', 'FLOOR_PLAN'],
        example: 'IMAGE',
      },
      url: {
        type: 'string',
        format: 'uri',
        example: 'https://s3.amazonaws.com/bucket/updated-image.jpg',
      },
      fileName: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        example: 'updated-house-front-view.jpg',
      },
      fileSize: {
        type: 'integer',
        minimum: 1,
        maximum: 15728640,
        example: 2048576,
      },
      displayOrder: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        example: 1,
      },
      isPrimary: {
        type: 'boolean',
        example: true,
      },
    },
  },
  FileUploadResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      message: {
        type: 'string',
        example: 'Media uploaded successfully',
      },
      data: {
        type: 'object',
        properties: {
          media: {
            type: 'array',
            items: { $ref: '#/components/schemas/Media' },
          },
          uploadedUrls: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri',
            },
            example: ['https://s3.amazonaws.com/bucket/image1.jpg'],
          },
          isFirstUpload: {
            type: 'boolean',
            example: true,
          },
          totalMediaCount: {
            type: 'integer',
            example: 4,
          },
        },
      },
    },
  },
  DeleteMediaRequest: {
    type: 'object',
    required: ['mediaIds', 'propertyId'],
    properties: {
      mediaIds: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
        },
        minItems: 1,
        example: ['123e4567-e89b-12d3-a456-426614174000'],
      },
      propertyId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  },
  MediaPaginatedResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'object',
        properties: {
          media: {
            type: 'array',
            items: { $ref: '#/components/schemas/Media' },
          },
          pagination: {
            type: 'object',
            properties: {
              currentPage: { type: 'integer', example: 1 },
              totalPages: { type: 'integer', example: 3 },
              totalItems: { type: 'integer', example: 24 },
              itemsPerPage: { type: 'integer', example: 10 },
            },
          },
        },
      },
    },
  },
};

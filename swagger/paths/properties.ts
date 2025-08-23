/* eslint-disable @typescript-eslint/naming-convention */
export const propertyPaths = {
  '/api/properties': {
    get: {
      tags: ['Properties'],
      summary: 'Get all properties',
      description: 'Retrieve a paginated list of properties with optional filtering',
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
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
        },
        {
          name: 'propertyType',
          in: 'query',
          description: 'Filter by property type',
          required: false,
          schema: {
            type: 'string',
            enum: ['HOUSE', 'APARTMENT', 'TOWNHOUSE', 'VILLA', 'LAND'],
          },
        },
        {
          name: 'listingType',
          in: 'query',
          description: 'Filter by listing type',
          required: false,
          schema: { type: 'string', enum: ['SALE', 'RENT'] },
        },
        {
          name: 'country',
          in: 'query',
          description: 'Filter by country',
          required: false,
          schema: { type: 'string', enum: ['SOMALIA', 'KENYA'] },
        },
        {
          name: 'minPrice',
          in: 'query',
          description: 'Minimum price filter',
          required: false,
          schema: { type: 'number', minimum: 0 },
        },
        {
          name: 'maxPrice',
          in: 'query',
          description: 'Maximum price filter',
          required: false,
          schema: { type: 'number', minimum: 0 },
        },
        {
          name: 'bedrooms',
          in: 'query',
          description: 'Filter by number of bedrooms',
          required: false,
          schema: { type: 'integer', minimum: 0 },
        },
        {
          name: 'bathrooms',
          in: 'query',
          description: 'Filter by number of bathrooms',
          required: false,
          schema: { type: 'integer', minimum: 0 },
        },
        {
          name: 'hasAirConditioning',
          in: 'query',
          description: 'Filter by air conditioning availability',
          required: false,
          schema: { type: 'boolean' },
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by property status',
          required: false,
          schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SOLD', 'RENTED'] },
        },
      ],
      responses: {
        200: {
          description: 'Properties retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PropertyPaginatedResponse' },
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
      tags: ['Properties'],
      summary: 'Create a new property',
      description: 'Create a new property listing (requires authentication)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePropertyRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Property created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Property created successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      property: { $ref: '#/components/schemas/Property' },
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
  '/api/properties/{id}': {
    get: {
      tags: ['Properties'],
      summary: 'Get property by ID',
      description: 'Retrieve a specific property by its ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'Property ID',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Property retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      property: { $ref: '#/components/schemas/Property' },
                    },
                  },
                },
              },
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
    put: {
      tags: ['Properties'],
      summary: 'Update property',
      description: 'Update an existing property (owner or admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'Property ID',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdatePropertyRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Property updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Property updated successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      property: { $ref: '#/components/schemas/Property' },
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
    delete: {
      tags: ['Properties'],
      summary: 'Delete property',
      description: 'Soft delete a property (owner or admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'Property ID',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Property deleted successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
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

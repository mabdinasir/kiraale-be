/* eslint-disable @typescript-eslint/naming-convention */
import {
  countryValues,
  listingTypeValues,
  priceTypeValues,
  propertyTypeValues,
  rentFrequencyValues,
} from '@db/schemas/enums';

export const propertySearchPaths = {
  '/api/properties/search': {
    get: {
      tags: ['Properties'],
      summary: 'Search properties with advanced filtering',
      description: 'Search and filter properties by any field with comprehensive filtering options',
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
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        },
        {
          name: 'search',
          in: 'query',
          description: 'Full-text search in title, description, and address',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'propertyType',
          in: 'query',
          description: 'Filter by property type',
          required: false,
          schema: { type: 'string', enum: propertyTypeValues },
        },
        {
          name: 'listingType',
          in: 'query',
          description: 'Filter by listing type',
          required: false,
          schema: { type: 'string', enum: listingTypeValues },
        },
        {
          name: 'country',
          in: 'query',
          description: 'Filter by country',
          required: false,
          schema: { type: 'string', enum: countryValues },
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
          name: 'priceType',
          in: 'query',
          description: 'Filter by price type',
          required: false,
          schema: { type: 'string', enum: priceTypeValues },
        },
        {
          name: 'rentFrequency',
          in: 'query',
          description: 'Filter by rent frequency (for rentals)',
          required: false,
          schema: { type: 'string', enum: rentFrequencyValues },
        },
        {
          name: 'minBedrooms',
          in: 'query',
          description: 'Minimum number of bedrooms',
          required: false,
          schema: { type: 'integer', minimum: 0 },
        },
        {
          name: 'maxBedrooms',
          in: 'query',
          description: 'Maximum number of bedrooms',
          required: false,
          schema: { type: 'integer', minimum: 0 },
        },
        {
          name: 'minBathrooms',
          in: 'query',
          description: 'Minimum number of bathrooms',
          required: false,
          schema: { type: 'integer', minimum: 0 },
        },
        {
          name: 'maxBathrooms',
          in: 'query',
          description: 'Maximum number of bathrooms',
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
          name: 'address',
          in: 'query',
          description: 'Search in property address',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'sortBy',
          in: 'query',
          description: 'Sort properties by field',
          required: false,
          schema: {
            type: 'string',
            enum: ['createdAt', 'updatedAt', 'price', 'bedrooms', 'bathrooms', 'landSize', 'floorArea'],
            default: 'createdAt',
          },
        },
        {
          name: 'sortOrder',
          in: 'query',
          description: 'Sort order',
          required: false,
          schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
        },
      ],
      responses: {
        200: {
          description: 'Properties retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PropertySearchResponse' },
            },
          },
        },
        400: {
          description: 'Invalid search parameters',
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
  },
  '/api/properties/trending': {
    get: {
      tags: ['Properties'],
      summary: 'Get trending properties',
      description: 'Get properties with highest view counts in a specified time period',
      parameters: [
        {
          name: 'limit',
          in: 'query',
          description: 'Number of trending properties to return',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
        },
        {
          name: 'period',
          in: 'query',
          description: 'Time period for trending calculation',
          required: false,
          schema: { type: 'string', enum: ['day', 'week', 'month'], default: 'week' },
        },
        {
          name: 'country',
          in: 'query',
          description: 'Filter by country',
          required: false,
          schema: { type: 'string', enum: countryValues },
        },
        {
          name: 'propertyType',
          in: 'query',
          description: 'Filter by property type',
          required: false,
          schema: { type: 'string', enum: propertyTypeValues },
        },
        {
          name: 'listingType',
          in: 'query',
          description: 'Filter by listing type',
          required: false,
          schema: { type: 'string', enum: listingTypeValues },
        },
      ],
      responses: {
        200: {
          description: 'Trending properties retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TrendingPropertiesResponse' },
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
  },
  '/api/properties/views/record': {
    post: {
      tags: ['Properties'],
      summary: 'Record property view',
      description: 'Manually record a property view for analytics',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RecordPropertyViewRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'View already recorded (duplicate within 24 hours)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RecordViewResponse' },
            },
          },
        },
        201: {
          description: 'Property view recorded successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RecordViewResponse' },
            },
          },
        },
        400: {
          description: 'Invalid request body',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        404: {
          description: 'Property not found or not approved',
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
  '/api/properties/{id}/analytics': {
    get: {
      tags: ['Properties'],
      summary: 'Get property analytics',
      description: 'Get detailed analytics and view statistics for a property (Property owner or Admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'Property ID',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          name: 'period',
          in: 'query',
          description: 'Analytics time period',
          required: false,
          schema: { type: 'string', enum: ['day', 'week', 'month', 'year'], default: 'week' },
        },
        {
          name: 'startDate',
          in: 'query',
          description: 'Custom start date (ISO 8601)',
          required: false,
          schema: { type: 'string', format: 'date-time' },
        },
        {
          name: 'endDate',
          in: 'query',
          description: 'Custom end date (ISO 8601)',
          required: false,
          schema: { type: 'string', format: 'date-time' },
        },
      ],
      responses: {
        200: {
          description: 'Property analytics retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PropertyAnalyticsResponse' },
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
        401: {
          description: 'Unauthorized - Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Forbidden - Not authorized to view analytics for this property',
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

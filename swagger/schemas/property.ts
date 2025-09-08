/* eslint-disable @typescript-eslint/naming-convention */
import {
  countryValues,
  listingTypeValues,
  priceTypeValues,
  propertyStatusValues,
  propertyTypeValues,
  rentFrequencyValues,
} from '@db/schemas/enums';

export const propertySchemas = {
  Property: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      userId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      title: {
        type: 'string',
        example: 'Beautiful 3BR House',
      },
      description: {
        type: 'string',
        example: 'Spacious house with garden',
      },
      propertyType: {
        type: 'string',
        enum: propertyTypeValues,
        example: 'HOUSE',
      },
      listingType: {
        type: 'string',
        enum: listingTypeValues,
        example: 'RENT',
      },
      bedrooms: {
        type: 'integer',
        minimum: 0,
        maximum: 20,
        example: 3,
      },
      bathrooms: {
        type: 'integer',
        minimum: 0,
        maximum: 20,
        example: 2,
      },
      parkingSpaces: {
        type: 'integer',
        minimum: 0,
        maximum: 10,
        example: 2,
      },
      landSize: {
        type: 'number',
        example: 500.5,
      },
      floorArea: {
        type: 'number',
        example: 150.0,
      },
      hasAirConditioning: {
        type: 'boolean',
        example: true,
      },
      address: {
        type: 'string',
        example: '123 Main St, Downtown',
      },
      country: {
        type: 'string',
        enum: countryValues,
        example: 'SOMALIA',
      },
      price: {
        type: 'number',
        example: 1500.00,
      },
      priceType: {
        type: 'string',
        enum: priceTypeValues,
        example: 'NEGOTIABLE',
      },
      rentFrequency: {
        type: 'string',
        enum: rentFrequencyValues,
        example: 'MONTHLY',
      },
      status: {
        type: 'string',
        enum: propertyStatusValues,
        example: 'AVAILABLE',
      },
      availableFrom: {
        type: 'string',
        format: 'date',
        example: '2024-02-01',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00Z',
      },
      user: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          profilePicture: {
            type: 'string',
            nullable: true,
            example: 'https://example.com/profile.jpg',
          },
          agentNumber: {
            type: 'string',
            nullable: true,
            example: 'AGT001',
          },
        },
      },
    },
  },
  CreatePropertyRequest: {
    type: 'object',
    required: ['title', 'propertyType', 'listingType', 'address', 'country', 'price'],
    properties: {
      title: {
        type: 'string',
        minLength: 5,
        maxLength: 200,
        example: 'Beautiful 3BR House',
      },
      description: {
        type: 'string',
        maxLength: 2000,
        example: 'Spacious house with garden',
      },
      propertyType: {
        type: 'string',
        enum: propertyTypeValues,
        example: 'HOUSE',
      },
      listingType: {
        type: 'string',
        enum: listingTypeValues,
        example: 'RENT',
      },
      bedrooms: {
        type: 'integer',
        minimum: 0,
        maximum: 20,
        default: 0,
        example: 3,
      },
      bathrooms: {
        type: 'integer',
        minimum: 0,
        maximum: 20,
        default: 0,
        example: 2,
      },
      parkingSpaces: {
        type: 'integer',
        minimum: 0,
        maximum: 10,
        default: 0,
        example: 2,
      },
      landSize: {
        type: 'number',
        minimum: 0,
        example: 500.5,
      },
      floorArea: {
        type: 'number',
        minimum: 0,
        example: 150.0,
      },
      hasAirConditioning: {
        type: 'boolean',
        default: false,
        example: true,
      },
      address: {
        type: 'string',
        minLength: 10,
        maxLength: 500,
        example: '123 Main St, Downtown',
      },
      country: {
        type: 'string',
        enum: countryValues,
        example: 'SOMALIA',
      },
      price: {
        type: 'number',
        minimum: 0,
        example: 1500.00,
      },
      priceType: {
        type: 'string',
        enum: priceTypeValues,
        default: 'NEGOTIABLE',
        example: 'NEGOTIABLE',
      },
      rentFrequency: {
        type: 'string',
        enum: rentFrequencyValues,
        example: 'MONTHLY',
      },
      availableFrom: {
        type: 'string',
        format: 'date',
        example: '2024-02-01',
      },
    },
  },
  UpdatePropertyRequest: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 5,
        maxLength: 200,
        example: 'Updated Beautiful 3BR House',
      },
      description: {
        type: 'string',
        maxLength: 2000,
        example: 'Updated spacious house with garden',
      },
      propertyType: {
        type: 'string',
        enum: propertyTypeValues,
        example: 'HOUSE',
      },
      listingType: {
        type: 'string',
        enum: listingTypeValues,
        example: 'RENT',
      },
      bedrooms: {
        type: 'integer',
        minimum: 0,
        maximum: 20,
        example: 3,
      },
      bathrooms: {
        type: 'integer',
        minimum: 0,
        maximum: 20,
        example: 2,
      },
      parkingSpaces: {
        type: 'integer',
        minimum: 0,
        maximum: 10,
        example: 2,
      },
      landSize: {
        type: 'number',
        minimum: 0,
        example: 500.5,
      },
      floorArea: {
        type: 'number',
        minimum: 0,
        example: 150.0,
      },
      hasAirConditioning: {
        type: 'boolean',
        example: true,
      },
      address: {
        type: 'string',
        minLength: 10,
        maxLength: 500,
        example: '123 Main St, Downtown',
      },
      country: {
        type: 'string',
        enum: countryValues,
        example: 'SOMALIA',
      },
      price: {
        type: 'number',
        minimum: 0,
        example: 1500.00,
      },
      priceType: {
        type: 'string',
        enum: priceTypeValues,
        example: 'NEGOTIABLE',
      },
      rentFrequency: {
        type: 'string',
        enum: rentFrequencyValues,
        example: 'MONTHLY',
      },
      status: {
        type: 'string',
        enum: propertyStatusValues,
        example: 'AVAILABLE',
      },
      availableFrom: {
        type: 'string',
        format: 'date',
        example: '2024-02-01',
      },
    },
  },
  PropertyPaginatedResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'object',
        properties: {
          properties: {
            type: 'array',
            items: { $ref: '#/components/schemas/Property' },
          },
          pagination: {
            type: 'object',
            properties: {
              currentPage: { type: 'integer', example: 1 },
              totalPages: { type: 'integer', example: 5 },
              totalItems: { type: 'integer', example: 47 },
              itemsPerPage: { type: 'integer', example: 10 },
            },
          },
        },
      },
    },
  },
};

/* eslint-disable @typescript-eslint/naming-convention */
export const PricingSchemas = {
  ServicePricing: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier for the pricing entry',
      },
      serviceType: {
        type: 'string',
        enum: ['PROPERTY_LISTING', 'HOTEL_LISTING', 'FEATURED_PROPERTY', 'URGENT_LISTING'],
        description: 'Type of service',
        example: 'PROPERTY_LISTING',
      },
      serviceName: {
        type: 'string',
        description: 'Display name for the service',
        example: 'Property Listing Fee',
      },
      amount: {
        type: 'string',
        description: 'Service price (stored as decimal string, can be 0.00 for free promotions)',
        example: '20.00',
      },
      currency: {
        type: 'string',
        enum: ['USD', 'KES', 'SOS'],
        description: 'Currency code',
        default: 'USD',
        example: 'USD',
      },
      description: {
        type: 'string',
        description: 'Optional description of the service',
        example: 'Standard fee for listing a property on Kiraale',
        nullable: true,
      },
      active: {
        type: 'boolean',
        description: 'Whether this pricing is currently active',
        default: true,
        example: true,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'When the pricing was created',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'When the pricing was last updated',
      },
    },
    required: ['serviceType', 'serviceName', 'amount'],
  },

  CreatePricingRequest: {
    type: 'object',
    properties: {
      serviceType: {
        type: 'string',
        enum: ['PROPERTY_LISTING', 'HOTEL_LISTING', 'FEATURED_PROPERTY', 'URGENT_LISTING'],
        description: 'Type of service',
        example: 'PROPERTY_LISTING',
      },
      serviceName: {
        type: 'string',
        description: 'Display name for the service',
        example: 'Property Listing Fee',
      },
      amount: {
        type: 'number',
        description: 'Service price (can be 0 for free promotions)',
        example: 20.00,
        minimum: 0,
      },
      currency: {
        type: 'string',
        enum: ['USD', 'KES', 'SOS'],
        description: 'Currency code',
        default: 'USD',
        example: 'USD',
      },
      description: {
        type: 'string',
        description: 'Optional description of the service',
        example: 'Standard fee for listing a property on Kiraale',
      },
    },
    required: ['serviceType', 'serviceName', 'amount'],
  },

  UpdatePricingRequest: {
    type: 'object',
    properties: {
      serviceName: {
        type: 'string',
        description: 'Display name for the service',
        example: 'Updated Property Listing Fee',
      },
      amount: {
        type: 'number',
        description: 'Service price (can be 0 for free promotions)',
        example: 25.00,
        minimum: 0,
      },
      currency: {
        type: 'string',
        enum: ['USD', 'KES', 'SOS'],
        description: 'Currency code',
        example: 'USD',
      },
      description: {
        type: 'string',
        description: 'Optional description of the service',
        example: 'Updated standard fee for property listing',
      },
      active: {
        type: 'boolean',
        description: 'Whether this pricing should be active',
        example: true,
      },
    },
  },

  PricingListResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/ServicePricing',
        },
      },
    },
  },

  PricingResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        $ref: '#/components/schemas/ServicePricing',
      },
    },
  },

  ServiceType: {
    type: 'string',
    enum: ['PROPERTY_LISTING', 'HOTEL_LISTING', 'FEATURED_PROPERTY', 'URGENT_LISTING'],
    description: 'Available service types for pricing',
  },

  Currency: {
    type: 'string',
    enum: ['USD', 'KES', 'SOS'],
    description: 'Supported currency codes',
  },
};

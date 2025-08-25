/* eslint-disable @typescript-eslint/naming-convention */
export const PricingPaths = {
  '/pricing': {
    get: {
      tags: ['Service Pricing'],
      summary: 'Get all active service pricing',
      description: 'Retrieve all currently active service pricing information. This is a public endpoint.',
      responses: {
        200: {
          description: 'Active pricing retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PricingListResponse',
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },

  '/pricing/{serviceType}': {
    get: {
      tags: ['Service Pricing'],
      summary: 'Get pricing for specific service type',
      description: 'Retrieve pricing information for a specific service type. This is a public endpoint.',
      parameters: [
        {
          name: 'serviceType',
          in: 'path',
          required: true,
          description: 'The type of service to get pricing for',
          schema: {
            $ref: '#/components/schemas/ServiceType',
          },
          example: 'PROPERTY_LISTING',
        },
      ],
      responses: {
        200: {
          description: 'Service pricing retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PricingResponse',
              },
            },
          },
        },
        404: {
          description: 'No active pricing found for this service type',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },

  '/admin/pricing': {
    post: {
      tags: ['Service Pricing Management'],
      summary: 'Create new service pricing (Admin only)',
      description: 'Create a new service pricing entry. Requires admin privileges.',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreatePricingRequest',
            },
            examples: {
              propertyListing: {
                summary: 'Property Listing Pricing',
                value: {
                  serviceType: 'PROPERTY_LISTING',
                  serviceName: 'Property Listing Fee',
                  amount: 20.00,
                  currency: 'USD',
                  description: 'Standard fee for listing a property on Kiraale (can be 0 for free promotions)',
                },
              },
              featuredProperty: {
                summary: 'Featured Property Pricing',
                value: {
                  serviceType: 'FEATURED_PROPERTY',
                  serviceName: 'Featured Property Boost',
                  amount: 35.00,
                  currency: 'USD',
                  description: 'Boost your property to featured section for 30 days',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Service pricing created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PricingResponse',
              },
            },
          },
        },
        400: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Invalid or missing JWT token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        403: {
          description: 'Forbidden - Admin privileges required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },

  '/admin/pricing/{id}': {
    put: {
      tags: ['Service Pricing Management'],
      summary: 'Update service pricing (Admin only)',
      description: 'Update an existing service pricing entry. Requires admin privileges.',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'The ID of the pricing entry to update',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdatePricingRequest',
            },
            examples: {
              updateAmount: {
                summary: 'Update Price Amount',
                value: {
                  amount: 25.00,
                  serviceName: 'Updated Property Listing Fee',
                  description: 'Updated standard fee for property listing',
                },
              },
              freePromotion: {
                summary: 'Free Promotion Example',
                value: {
                  amount: 0,
                  serviceName: 'Free Property Listing (Limited Time)',
                  description: 'Free property listing promotion - no charge for first month',
                },
              },
              deactivate: {
                summary: 'Deactivate Pricing',
                value: {
                  active: false,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Service pricing updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PricingResponse',
              },
            },
          },
        },
        400: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Invalid or missing JWT token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        403: {
          description: 'Forbidden - Admin privileges required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Pricing entry not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },

    delete: {
      tags: ['Service Pricing Management'],
      summary: 'Deactivate service pricing (Admin only)',
      description: 'Soft delete (deactivate) a service pricing entry. Requires admin privileges.',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'The ID of the pricing entry to deactivate',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        200: {
          description: 'Service pricing deactivated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'Service pricing deactivated successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/ServicePricing',
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Invalid or missing JWT token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        403: {
          description: 'Forbidden - Admin privileges required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Pricing entry not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
};

/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/naming-convention */
export const adminPaths = {
  '/admin/properties/pending': {
    get: {
      tags: ['Admin'],
      summary: 'Get pending properties for review',
      description: 'Retrieve all properties that are pending admin approval with pagination',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
          },
        },
      ],
      responses: {
        200: {
          description: 'Successful response with pending properties',
          content: {
            'application/json': {
              schema: {
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
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              format: 'uuid',
                              example: 'a7476e97-9cc7-4085-ae0b-ea4d384199ef',
                            },
                            title: {
                              type: 'string',
                              example: 'Beautiful Villa in Hargeisa',
                            },
                            description: {
                              type: 'string',
                              example: 'Spacious 4-bedroom villa with modern amenities',
                            },
                            propertyType: {
                              type: 'string',
                              enum: ['RESIDENTIAL', 'COMMERCIAL', 'LAND'],
                              example: 'RESIDENTIAL',
                            },
                            listingType: {
                              type: 'string',
                              enum: ['SALE', 'RENT', 'LEASE'],
                              example: 'SALE',
                            },
                            address: {
                              type: 'string',
                              example: 'Jigjiga-yar, Hargeisa',
                            },
                            country: {
                              type: 'string',
                              enum: ['SOMALIA', 'SOMALILAND', 'DJIBOUTI', 'ETHIOPIA', 'KENYA'],
                              example: 'SOMALILAND',
                            },
                            price: {
                              type: 'string',
                              example: '150000',
                            },
                            priceType: {
                              type: 'string',
                              enum: ['FIXED', 'NEGOTIABLE', 'STARTING_FROM'],
                              example: 'NEGOTIABLE',
                            },
                            status: {
                              type: 'string',
                              example: 'PENDING',
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
                            owner: {
                              type: 'object',
                              properties: {
                                id: {
                                  type: 'string',
                                  format: 'uuid',
                                },
                                firstName: {
                                  type: 'string',
                                  example: 'Ahmed',
                                },
                                lastName: {
                                  type: 'string',
                                  example: 'Hassan',
                                },
                                email: {
                                  type: 'string',
                                  format: 'email',
                                  example: 'ahmed.hassan@example.com',
                                },
                              },
                            },
                          },
                        },
                      },
                      pagination: {
                        $ref: '#/components/schemas/Pagination',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/properties/{id}/approve': {
    put: {
      tags: ['Admin'],
      summary: 'Approve a pending property',
      description: 'Approve a property that is currently in pending status',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Property ID to approve',
          schema: {
            type: 'string',
            format: 'uuid',
            example: 'a7476e97-9cc7-4085-ae0b-ea4d384199ef',
          },
        },
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                adminNotes: {
                  type: 'string',
                  description: 'Optional notes from admin about the approval',
                  example: 'Property meets all requirements and looks great!',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Property approved successfully',
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
                    example: 'Property approved successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      property: {
                        $ref: '#/components/schemas/Property',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/properties/{id}/reject': {
    put: {
      tags: ['Admin'],
      summary: 'Reject a pending property',
      description: 'Reject a property that is currently in pending status with a reason',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Property ID to reject',
          schema: {
            type: 'string',
            format: 'uuid',
            example: 'a7476e97-9cc7-4085-ae0b-ea4d384199ef',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['rejectionReason'],
              properties: {
                rejectionReason: {
                  type: 'string',
                  description: 'Reason for rejecting the property',
                  minLength: 1,
                  example: 'Missing required documentation. Please provide clear property photos and ownership documents.',
                },
                adminNotes: {
                  type: 'string',
                  description: 'Optional additional notes from admin',
                  example: 'Please resubmit with better quality images and legal documents.',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Property rejected successfully',
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
                    example: 'Property rejected successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      property: {
                        $ref: '#/components/schemas/Property',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/properties/rejected': {
    get: {
      tags: ['Admin'],
      summary: 'Get rejected properties',
      description: 'Retrieve all properties that have been rejected with pagination',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
          },
        },
      ],
      responses: {
        200: {
          description: 'Successful response with rejected properties',
          content: {
            'application/json': {
              schema: {
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
                        items: {
                          $ref: '#/components/schemas/Property',
                        },
                      },
                      pagination: {
                        $ref: '#/components/schemas/Pagination',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/properties/trending': {
    get: {
      tags: ['Admin'],
      summary: 'Get trending properties',
      description: 'Retrieve properties with high engagement metrics',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
          },
        },
      ],
      responses: {
        200: {
          description: 'Successful response with trending properties',
          content: {
            'application/json': {
              schema: {
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
                        items: {
                          $ref: '#/components/schemas/Property',
                        },
                      },
                      pagination: {
                        $ref: '#/components/schemas/Pagination',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/properties/{id}': {
    get: {
      tags: ['Admin'],
      summary: 'Get property details (admin view)',
      description: 'Get detailed property information with admin-specific data',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Property ID',
          schema: {
            type: 'string',
            format: 'uuid',
            example: 'a7476e97-9cc7-4085-ae0b-ea4d384199ef',
          },
        },
      ],
      responses: {
        200: {
          description: 'Property details retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    $ref: '#/components/schemas/Property',
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/properties/{id}/analytics': {
    get: {
      tags: ['Admin'],
      summary: 'Get property analytics',
      description: 'Get detailed analytics for a specific property',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Property ID',
          schema: {
            type: 'string',
            format: 'uuid',
            example: 'a7476e97-9cc7-4085-ae0b-ea4d384199ef',
          },
        },
        {
          name: 'startDate',
          in: 'query',
          description: 'Start date for analytics (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            example: '2024-01-01',
          },
        },
        {
          name: 'endDate',
          in: 'query',
          description: 'End date for analytics (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            example: '2024-12-31',
          },
        },
      ],
      responses: {
        200: {
          description: 'Property analytics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PropertyAnalytics',
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/stats': {
    get: {
      tags: ['Admin'],
      summary: 'Get admin dashboard statistics',
      description: 'Get comprehensive statistics for the admin dashboard',
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Admin statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    type: 'object',
                    properties: {
                      users: {
                        type: 'object',
                        properties: {
                          total: {
                            type: 'integer',
                            example: 1250,
                          },
                          active: {
                            type: 'integer',
                            example: 1180,
                          },
                          newThisMonth: {
                            type: 'integer',
                            example: 45,
                          },
                        },
                      },
                      properties: {
                        type: 'object',
                        properties: {
                          total: {
                            type: 'integer',
                            example: 850,
                          },
                          pending: {
                            type: 'integer',
                            example: 12,
                          },
                          approved: {
                            type: 'integer',
                            example: 790,
                          },
                          rejected: {
                            type: 'integer',
                            example: 48,
                          },
                        },
                      },
                      payments: {
                        type: 'object',
                        properties: {
                          totalRevenue: {
                            type: 'string',
                            example: '15750.00',
                          },
                          thisMonth: {
                            type: 'string',
                            example: '2340.00',
                          },
                          transactionCount: {
                            type: 'integer',
                            example: 156,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/payments': {
    get: {
      tags: ['Admin'],
      summary: 'Get all payments',
      description: 'Retrieve all payment records with pagination and filtering',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by payment status',
          required: false,
          schema: {
            type: 'string',
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
          },
        },
        {
          name: 'provider',
          in: 'query',
          description: 'Filter by payment provider',
          required: false,
          schema: {
            type: 'string',
            enum: ['MPESA', 'EVC'],
          },
        },
      ],
      responses: {
        200: {
          description: 'Payments retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    type: 'object',
                    properties: {
                      payments: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Payment',
                        },
                      },
                      pagination: {
                        $ref: '#/components/schemas/Pagination',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/payments/stats': {
    get: {
      tags: ['Admin'],
      summary: 'Get payment statistics',
      description: 'Get comprehensive payment statistics for admin dashboard',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'startDate',
          in: 'query',
          description: 'Start date for statistics (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            example: '2024-01-01',
          },
        },
        {
          name: 'endDate',
          in: 'query',
          description: 'End date for statistics (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            example: '2024-12-31',
          },
        },
      ],
      responses: {
        200: {
          description: 'Payment statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    type: 'object',
                    properties: {
                      totalRevenue: {
                        type: 'string',
                        example: '15750.00',
                      },
                      totalTransactions: {
                        type: 'integer',
                        example: 156,
                      },
                      successRate: {
                        type: 'number',
                        format: 'float',
                        example: 94.5,
                      },
                      byProvider: {
                        type: 'object',
                        properties: {
                          MPESA: {
                            type: 'object',
                            properties: {
                              count: {
                                type: 'integer',
                                example: 89,
                              },
                              revenue: {
                                type: 'string',
                                example: '8920.00',
                              },
                            },
                          },
                          EVC: {
                            type: 'object',
                            properties: {
                              count: {
                                type: 'integer',
                                example: 67,
                              },
                              revenue: {
                                type: 'string',
                                example: '6830.00',
                              },
                            },
                          },
                        },
                      },
                      byStatus: {
                        type: 'object',
                        properties: {
                          COMPLETED: {
                            type: 'integer',
                            example: 148,
                          },
                          PENDING: {
                            type: 'integer',
                            example: 3,
                          },
                          FAILED: {
                            type: 'integer',
                            example: 5,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/payments/{paymentId}': {
    get: {
      tags: ['Admin'],
      summary: 'Get payment by ID',
      description: 'Get detailed information about a specific payment',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'paymentId',
          in: 'path',
          required: true,
          description: 'Payment ID',
          schema: {
            type: 'string',
            format: 'uuid',
            example: 'a7476e97-9cc7-4085-ae0b-ea4d384199ef',
          },
        },
      ],
      responses: {
        200: {
          description: 'Payment details retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    $ref: '#/components/schemas/Payment',
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/pricing': {
    get: {
      tags: ['Admin'],
      summary: 'Get pricing configurations',
      description: 'Get all pricing configurations for admin management',
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Pricing configurations retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Pricing',
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
    post: {
      tags: ['Admin'],
      summary: 'Create pricing configuration',
      description: 'Create a new pricing configuration',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreatePricing',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Pricing configuration created successfully',
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
                    example: 'Pricing configuration created successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/Pricing',
                  },
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/pricing/{pricingId}': {
    put: {
      tags: ['Admin'],
      summary: 'Update pricing configuration',
      description: 'Update an existing pricing configuration',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'pricingId',
          in: 'path',
          required: true,
          description: 'Pricing configuration ID',
          schema: {
            type: 'string',
            format: 'uuid',
            example: 'a7476e97-9cc7-4085-ae0b-ea4d384199ef',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdatePricing',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Pricing configuration updated successfully',
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
                    example: 'Pricing configuration updated successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/Pricing',
                  },
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/users': {
    get: {
      tags: ['Admin'],
      summary: 'Get all users (admin view)',
      description: 'Get all users with admin-specific data and filtering',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by user status',
          required: false,
          schema: {
            type: 'string',
            enum: ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'],
          },
        },
      ],
      responses: {
        200: {
          description: 'Users retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    type: 'object',
                    properties: {
                      users: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                      pagination: {
                        $ref: '#/components/schemas/Pagination',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/users/search': {
    get: {
      tags: ['Admin'],
      summary: 'Search users',
      description: 'Search users by various criteria',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'q',
          in: 'query',
          description: 'Search query (name, email, etc.)',
          required: true,
          schema: {
            type: 'string',
            minLength: 1,
            example: 'ahmed',
          },
        },
        {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            default: 10,
          },
        },
      ],
      responses: {
        200: {
          description: 'User search results',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    type: 'object',
                    properties: {
                      users: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                      pagination: {
                        $ref: '#/components/schemas/Pagination',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/users/{id}': {
    put: {
      tags: ['Admin'],
      summary: 'Update user (admin)',
      description: 'Update user information with admin privileges',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID',
          schema: {
            type: 'string',
            format: 'uuid',
            example: 'a7476e97-9cc7-4085-ae0b-ea4d384199ef',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AdminUpdateUser',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User updated successfully',
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
                    example: 'User updated successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
  '/admin/users/{userId}/suspend': {
    put: {
      tags: ['Admin'],
      summary: 'Suspend user',
      description: 'Suspend a user account',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'userId',
          in: 'path',
          required: true,
          description: 'User ID to suspend',
          schema: {
            type: 'string',
            format: 'uuid',
            example: 'a7476e97-9cc7-4085-ae0b-ea4d384199ef',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['suspensionReason'],
              properties: {
                suspensionReason: {
                  type: 'string',
                  description: 'Reason for suspension',
                  minLength: 1,
                  example: 'Violation of community guidelines',
                },
                suspensionDuration: {
                  type: 'integer',
                  description: 'Suspension duration in days (optional, permanent if not specified)',
                  minimum: 1,
                  example: 30,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User suspended successfully',
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
                    example: 'User suspended successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
        500: {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    },
  },
};

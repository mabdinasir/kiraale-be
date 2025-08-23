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
};

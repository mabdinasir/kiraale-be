/* eslint-disable @typescript-eslint/naming-convention, max-lines */

export const userPaths = {
  '/api/users': {
    get: {
      tags: ['Users'],
      summary: 'Get all users',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of users retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  users: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
        403: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get user by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'User retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  user: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    put: {
      tags: ['Users'],
      summary: 'Update user',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUser' },
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
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  user: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    delete: {
      tags: ['Users'],
      summary: 'Delete user',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'User deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/users/change-password': {
    patch: {
      tags: ['Users'],
      summary: 'Change user password',
      description: 'Change the authenticated user\'s password',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['currentPassword', 'newPassword', 'confirmNewPassword'],
              properties: {
                currentPassword: {
                  type: 'string',
                  description: 'Current password',
                  example: 'CurrentPass123@',
                },
                newPassword: {
                  type: 'string',
                  description: 'New password (min 8 chars, must contain uppercase, lowercase, number, special char)',
                  example: 'NewPass123@',
                  minLength: 8,
                },
                confirmNewPassword: {
                  type: 'string',
                  description: 'Confirm new password (must match newPassword)',
                  example: 'NewPass123@',
                  minLength: 8,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password changed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Password changed successfully' },
                },
              },
            },
          },
        },
        400: {
          description: 'Bad request - validation error or invalid current password',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              examples: {
                invalidCurrentPassword: {
                  summary: 'Invalid current password',
                  value: {
                    success: false,
                    message: 'Current password is incorrect',
                  },
                },
                samePassword: {
                  summary: 'Same password',
                  value: {
                    success: false,
                    message: 'New password must be different from current password',
                  },
                },
                passwordMismatch: {
                  summary: 'Passwords don\'t match',
                  value: {
                    success: false,
                    message: 'Passwords don\'t match',
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'User not found',
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
  '/users/favorites': {
    post: {
      tags: ['Users', 'Favorites'],
      summary: 'Add property to favorites',
      description: 'Add a property to the authenticated user\'s favorites list',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['propertyId'],
              properties: {
                propertyId: {
                  type: 'string',
                  format: 'uuid',
                  example: 'a7476e97-9cc7-4085-ae0b-ea4d384199ef',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Property added to favorites successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Property added to favorites successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      favorite: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          userId: { type: 'string', format: 'uuid' },
                          propertyId: { type: 'string', format: 'uuid' },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Bad request - Property already in favorites or not available',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        401: {
          description: 'Unauthorized',
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
      },
    },
    get: {
      tags: ['Users', 'Favorites'],
      summary: 'Get user\'s favorite properties',
      description: 'Retrieve the authenticated user\'s favorite properties with pagination',
      security: [{ bearerAuth: [] }],
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
          description: 'Favorites retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      favorites: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            favoriteId: { type: 'string', format: 'uuid' },
                            favoritedAt: { type: 'string', format: 'date-time' },
                            property: { $ref: '#/components/schemas/Property' },
                            owner: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', format: 'uuid' },
                                firstName: { type: 'string' },
                                lastName: { type: 'string' },
                              },
                            },
                          },
                        },
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/users/favorites/{propertyId}': {
    delete: {
      tags: ['Users', 'Favorites'],
      summary: 'Remove property from favorites',
      description: 'Remove a property from the authenticated user\'s favorites list',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'propertyId',
          in: 'path',
          required: true,
          description: 'Property ID to remove from favorites',
          schema: {
            type: 'string',
            format: 'uuid',
            example: 'a7476e97-9cc7-4085-ae0b-ea4d384199ef',
          },
        },
      ],
      responses: {
        200: {
          description: 'Property removed from favorites successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Property removed from favorites successfully' },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Property not found in favorites',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/users/properties': {
    get: {
      tags: ['Users', 'Properties'],
      summary: 'Get user\'s own properties',
      description: 'Retrieve the authenticated user\'s own properties with optional status filter and pagination',
      security: [{ bearerAuth: [] }],
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
        {
          name: 'status',
          in: 'query',
          description: 'Filter properties by status',
          required: false,
          schema: {
            type: 'string',
            enum: ['PENDING', 'AVAILABLE', 'REJECTED', 'SOLD', 'LEASED', 'EXPIRED'],
            example: 'AVAILABLE',
          },
        },
      ],
      responses: {
        200: {
          description: 'User properties retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      properties: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            propertyType: { type: 'string' },
                            listingType: { type: 'string' },
                            address: { type: 'string' },
                            country: { type: 'string' },
                            price: { type: 'string' },
                            priceType: { type: 'string' },
                            status: { type: 'string' },
                            reviewedAt: { type: 'string', format: 'date-time' },
                            rejectionReason: { type: 'string' },
                            adminNotes: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                            reviewer: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', format: 'uuid' },
                                firstName: { type: 'string' },
                                lastName: { type: 'string' },
                              },
                            },
                          },
                        },
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
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

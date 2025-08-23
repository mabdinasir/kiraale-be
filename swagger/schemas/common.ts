/* eslint-disable @typescript-eslint/naming-convention */
export const commonSchemas = {
  Error: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      message: {
        type: 'string',
        example: 'Error message',
      },
      error: {
        type: 'string',
        example: 'Detailed error description',
      },
    },
  },
  ValidationError: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      message: {
        type: 'string',
        example: 'Validation failed',
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              example: 'email',
            },
            message: {
              type: 'string',
              example: 'Invalid email format',
            },
          },
        },
      },
    },
  },
  Pagination: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        example: 1,
      },
      limit: {
        type: 'integer',
        example: 20,
      },
      totalCount: {
        type: 'integer',
        example: 100,
      },
      totalPages: {
        type: 'integer',
        example: 5,
      },
      hasNextPage: {
        type: 'boolean',
        example: true,
      },
      hasPreviousPage: {
        type: 'boolean',
        example: false,
      },
    },
  },
  SuccessResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      message: {
        type: 'string',
        example: 'Operation completed successfully',
      },
      data: {
        type: 'object',
        description: 'Response data varies by endpoint',
      },
    },
  },
  HealthCheck: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      message: {
        type: 'string',
        example: 'Health check passed',
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
      },
      status: {
        type: 'string',
        enum: ['healthy', 'unhealthy'],
        example: 'healthy',
      },
      checks: {
        type: 'object',
        properties: {
          database: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                example: 'connected',
              },
              responseTime: {
                type: 'number',
                example: 15.5,
                description: 'Database response time in milliseconds',
              },
            },
          },
          server: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                example: 'running',
              },
              uptime: {
                type: 'number',
                example: 86400,
                description: 'Server uptime in seconds',
              },
              memory: {
                type: 'object',
                properties: {
                  used: {
                    type: 'number',
                    example: 512,
                    description: 'Used memory in MB',
                  },
                  total: {
                    type: 'number',
                    example: 2048,
                    description: 'Total memory in MB',
                  },
                },
              },
            },
          },
        },
      },
      environment: {
        type: 'string',
        example: 'production',
      },
      version: {
        type: 'string',
        example: '1.0.0',
      },
    },
  },
};

/* eslint-disable @typescript-eslint/naming-convention */
export const schemas = {
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
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      firstName: {
        type: 'string',
        example: 'Ahmed',
      },
      lastName: {
        type: 'string',
        example: 'Mohamed',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'ahmed@example.com',
      },
      mobile: {
        type: 'string',
        example: '+252123456789',
      },
      hasAcceptedTnC: {
        type: 'boolean',
        example: true,
      },
      isDeactivated: {
        type: 'boolean',
        example: false,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z',
      },
    },
  },
  Word: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      text: {
        type: 'string',
        example: 'house',
      },
      language: {
        type: 'string',
        enum: ['ENGLISH', 'SOMALI', 'ARABIC'],
        example: 'ENGLISH',
      },
      partOfSpeech: {
        type: 'string',
        example: 'noun',
      },
      definition: {
        type: 'string',
        example: 'A building for human habitation',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z',
      },
    },
  },
  WordWithTranslations: {
    allOf: [
      { $ref: '#/components/schemas/Word' },
      {
        type: 'object',
        properties: {
          translations: {
            type: 'array',
            items: { $ref: '#/components/schemas/Translation' },
          },
        },
      },
    ],
  },
  Translation: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      wordId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      sourceLanguage: {
        type: 'string',
        enum: ['ENGLISH', 'SOMALI', 'ARABIC'],
        example: 'ENGLISH',
      },
      targetText: {
        type: 'string',
        example: 'guriga',
      },
      somaliDialect: {
        type: 'string',
        enum: ['MAXAA_TIRI', 'MAAY'],
        example: 'MAXAA_TIRI',
      },
      context: {
        type: 'string',
        example: 'Used when referring to a family home',
      },
      contributorId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true,
      },
      contributorName: {
        type: 'string',
        example: 'Ahmed Mohamed',
      },
      status: {
        type: 'string',
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        example: 'APPROVED',
      },
      upvotes: {
        type: 'integer',
        example: 15,
      },
      downvotes: {
        type: 'integer',
        example: 2,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z',
      },
    },
  },
  TranslationWithVotes: {
    allOf: [
      { $ref: '#/components/schemas/Translation' },
      {
        type: 'object',
        properties: {
          votes: {
            type: 'array',
            items: { $ref: '#/components/schemas/Vote' },
          },
        },
      },
    ],
  },
  Vote: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      translationId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      userId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true,
      },
      sessionId: {
        type: 'string',
        example: 'anonymous-session-123',
        nullable: true,
      },
      voteType: {
        type: 'string',
        enum: ['UPVOTE', 'DOWNVOTE'],
        example: 'UPVOTE',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z',
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
        example: 150,
      },
      totalPages: {
        type: 'integer',
        example: 8,
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
  HealthCheck: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      message: {
        type: 'string',
        example: 'Server is healthy',
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z',
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
                example: 'healthy',
              },
              responseTime: {
                type: 'string',
                example: '15ms',
              },
            },
          },
          server: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                example: 'healthy',
              },
              uptime: {
                type: 'string',
                example: '3600s',
              },
              memory: {
                type: 'object',
                properties: {
                  used: {
                    type: 'string',
                    example: '128MB',
                  },
                  total: {
                    type: 'string',
                    example: '256MB',
                  },
                },
              },
            },
          },
        },
      },
      environment: {
        type: 'string',
        example: 'development',
      },
      version: {
        type: 'string',
        example: '1.0.0',
      },
    },
  },
};

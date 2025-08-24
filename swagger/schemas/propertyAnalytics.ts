/* eslint-disable @typescript-eslint/naming-convention */

export const propertyAnalyticsSchemas = {
  PropertySearchResponse: {
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
              hasNextPage: { type: 'boolean', example: true },
              hasPreviousPage: { type: 'boolean', example: false },
            },
          },
          filters: {
            type: 'object',
            properties: {
              applied: {
                type: 'object',
                example: {
                  search: 'house',
                  propertyType: 'HOUSE',
                  minPrice: 50000,
                  maxPrice: 500000,
                },
              },
              total: { type: 'integer', example: 4 },
            },
          },
        },
      },
    },
  },
  TrendingPropertiesResponse: {
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
              allOf: [
                { $ref: '#/components/schemas/Property' },
                {
                  type: 'object',
                  properties: {
                    viewCount: { type: 'integer', example: 125 },
                    uniqueViewCount: { type: 'integer', example: 89 },
                  },
                },
              ],
            },
          },
          period: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'week' },
              startDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00Z' },
              endDate: { type: 'string', format: 'date-time', example: '2024-01-22T23:59:59Z' },
            },
          },
          metadata: {
            type: 'object',
            properties: {
              totalProperties: { type: 'integer', example: 150 },
              showing: { type: 'integer', example: 10 },
              filters: {
                type: 'object',
                example: {
                  country: 'SOMALIA',
                  propertyType: 'HOUSE',
                },
              },
            },
          },
        },
      },
    },
  },
  RecordPropertyViewRequest: {
    type: 'object',
    required: ['propertyId'],
    properties: {
      propertyId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      userId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      sessionId: {
        type: 'string',
        example: 'anonymous-session-123',
      },
      userAgent: {
        type: 'string',
        example: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      referrer: {
        type: 'string',
        example: 'https://kiraale.com/search',
      },
    },
  },
  RecordViewResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      message: {
        type: 'string',
        example: 'Property view recorded successfully',
      },
      data: {
        type: 'object',
        properties: {
          recorded: { type: 'boolean', example: true },
          viewId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
          viewedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
        },
      },
    },
  },
  PropertyAnalyticsResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'object',
        properties: {
          property: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
              title: { type: 'string', example: 'Beautiful 3BR House' },
            },
          },
          period: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'week' },
              startDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00Z' },
              endDate: { type: 'string', format: 'date-time', example: '2024-01-22T23:59:59Z' },
            },
          },
          overview: {
            type: 'object',
            properties: {
              totalViews: { type: 'integer', example: 125 },
              uniqueUsers: { type: 'integer', example: 45 },
              uniqueSessions: { type: 'integer', example: 89 },
              viewsGrowth: { type: 'number', example: 15.5 },
            },
          },
          dailyViews: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date', example: '2024-01-15' },
                views: { type: 'integer', example: 18 },
                uniqueViews: { type: 'integer', example: 12 },
              },
            },
          },
          topReferrers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                referrer: { type: 'string', example: 'https://google.com' },
                views: { type: 'integer', example: 25 },
              },
            },
          },
          hourlyDistribution: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                hour: { type: 'integer', example: 14 },
                views: { type: 'integer', example: 8 },
              },
            },
          },
        },
      },
    },
  },
};

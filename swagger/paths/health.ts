/* eslint-disable @typescript-eslint/naming-convention */

export const healthPaths = {
  '/api/health': {
    get: {
      tags: ['Health'],
      summary: 'Check server health status',
      description:
        'Returns comprehensive health information including database connectivity, server metrics, and environment details',
      responses: {
        '200': {
          description: 'Server is healthy',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/HealthCheck',
              },
            },
          },
        },
        '503': {
          description: 'Server is unhealthy',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/HealthCheck' },
                  {
                    type: 'object',
                    properties: {
                      success: { example: false },
                      message: { example: 'Server is unhealthy' },
                      status: { example: 'unhealthy' },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
};

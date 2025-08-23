/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-lines */
import { countryValues } from '@db/schemas/enums';

export const agencyPaths = {
  '/api/agencies': {
    get: {
      tags: ['Agencies'],
      summary: 'Get all agencies',
      description: 'Retrieve a paginated list of agencies with optional filtering',
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
        {
          name: 'country',
          in: 'query',
          description: 'Filter by country',
          required: false,
          schema: { type: 'string', enum: countryValues },
        },
        {
          name: 'isActive',
          in: 'query',
          description: 'Filter by active status',
          required: false,
          schema: { type: 'boolean' },
        },
        {
          name: 'search',
          in: 'query',
          description: 'Search in agency name',
          required: false,
          schema: { type: 'string', minLength: 1, maxLength: 100 },
        },
      ],
      responses: {
        200: {
          description: 'Agencies retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AgencyPaginatedResponse' },
            },
          },
        },
        400: {
          description: 'Invalid query parameters',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
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
    post: {
      tags: ['Agencies'],
      summary: 'Create a new agency',
      description: 'Create a new real estate agency (Requires AGENT role and AGENCY_WRITE permission)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateAgencyRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Agency created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Agency created successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      agency: { $ref: '#/components/schemas/Agency' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        401: {
          description: 'Unauthorized - Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Forbidden - Insufficient permissions',
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
  '/api/agencies/{id}': {
    get: {
      tags: ['Agencies'],
      summary: 'Get agency by ID',
      description: 'Retrieve a specific agency by its ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'Agency ID',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Agency retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      agency: { $ref: '#/components/schemas/Agency' },
                    },
                  },
                },
              },
            },
          },
        },
        404: {
          description: 'Agency not found',
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
    put: {
      tags: ['Agencies'],
      summary: 'Update agency',
      description: 'Update an existing agency (Agency owner/admin or platform admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'Agency ID',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateAgencyRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Agency updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Agency updated successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      agency: { $ref: '#/components/schemas/Agency' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        401: {
          description: 'Unauthorized - Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Forbidden - Access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Agency not found',
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
    delete: {
      tags: ['Agencies'],
      summary: 'Delete agency',
      description: 'Delete an agency (Agency owner or platform admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'Agency ID',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Agency deleted successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        401: {
          description: 'Unauthorized - Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Forbidden - Access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Agency not found',
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
  '/api/agencies/{id}/agents': {
    post: {
      tags: ['Agencies'],
      summary: 'Add agent to agency',
      description: 'Add an agent to the agency (Agency admin or platform admin only). Users can only belong to one agency at a time.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'Agency ID',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddAgentToAgencyRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Agent added to agency successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Agent added to agency successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      agent: { $ref: '#/components/schemas/AgencyAgent' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error or user already in agency',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        401: {
          description: 'Unauthorized - Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Forbidden - Access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Agency or user not found',
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
  '/api/agencies/{agencyId}/agents/{userId}': {
    delete: {
      tags: ['Agencies'],
      summary: 'Remove agent from agency',
      description: 'Remove an agent from the agency (Agency admin, platform admin, or the agent themselves)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'agencyId',
          in: 'path',
          description: 'Agency ID',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          name: 'userId',
          in: 'path',
          description: 'User ID of the agent to remove',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Agent removed from agency successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        401: {
          description: 'Unauthorized - Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Forbidden - Access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Agency or agent not found',
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
};

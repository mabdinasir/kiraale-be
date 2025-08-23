/* eslint-disable @typescript-eslint/naming-convention */
import { agencyRoleValues, countryValues } from '@db/schemas/enums';

export const agencySchemas = {
  Agency: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      name: {
        type: 'string',
        example: 'Kiraale Properties',
      },
      description: {
        type: 'string',
        example: 'Leading real estate agency in Mogadishu',
      },
      country: {
        type: 'string',
        enum: countryValues,
        example: 'SOMALIA',
      },
      address: {
        type: 'string',
        example: 'Hamarweyne District, Mogadishu, Somalia',
      },
      phone: {
        type: 'string',
        example: '+252-1-234567',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'info@kiraaleproperties.so',
      },
      website: {
        type: 'string',
        format: 'uri',
        example: 'https://kiraaleproperties.so',
      },
      licenseNumber: {
        type: 'string',
        example: 'REA-2024-001',
      },
      isActive: {
        type: 'boolean',
        example: true,
      },
      createdById: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
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
    },
  },
  CreateAgencyRequest: {
    type: 'object',
    required: ['name', 'country', 'address'],
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 200,
        example: 'Kiraale Properties',
      },
      description: {
        type: 'string',
        maxLength: 2000,
        example: 'Leading real estate agency in Mogadishu',
      },
      country: {
        type: 'string',
        enum: countryValues,
        example: 'SOMALIA',
      },
      address: {
        type: 'string',
        minLength: 10,
        maxLength: 500,
        example: 'Hamarweyne District, Mogadishu, Somalia',
      },
      phone: {
        type: 'string',
        maxLength: 20,
        example: '+252-1-234567',
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 100,
        example: 'info@kiraaleproperties.so',
      },
      website: {
        type: 'string',
        format: 'uri',
        maxLength: 200,
        example: 'https://kiraaleproperties.so',
      },
      licenseNumber: {
        type: 'string',
        maxLength: 100,
        example: 'REA-2024-001',
      },
    },
  },
  UpdateAgencyRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 200,
        example: 'Updated Kiraale Properties',
      },
      description: {
        type: 'string',
        maxLength: 2000,
        example: 'Updated description for leading real estate agency',
      },
      address: {
        type: 'string',
        minLength: 10,
        maxLength: 500,
        example: 'Updated address, Mogadishu, Somalia',
      },
      phone: {
        type: 'string',
        maxLength: 20,
        example: '+252-1-999999',
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 100,
        example: 'updated@kiraaleproperties.so',
      },
      website: {
        type: 'string',
        format: 'uri',
        maxLength: 200,
        example: 'https://updated-kiraaleproperties.so',
      },
      licenseNumber: {
        type: 'string',
        maxLength: 100,
        example: 'REA-2024-001-UPDATED',
      },
      isActive: {
        type: 'boolean',
        example: true,
      },
    },
  },
  AgencyAgent: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      agencyId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      userId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      role: {
        type: 'string',
        enum: agencyRoleValues,
        example: 'AGENT',
      },
      isActive: {
        type: 'boolean',
        example: true,
      },
      joinedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00Z',
      },
      leftAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: null,
      },
      user: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          mobile: {
            type: 'string',
          },
        },
      },
    },
  },
  AddAgentToAgencyRequest: {
    type: 'object',
    required: ['userId', 'role'],
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      role: {
        type: 'string',
        enum: agencyRoleValues,
        default: 'AGENT',
        example: 'AGENT',
      },
    },
  },
  AgencyPaginatedResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'object',
        properties: {
          agencies: {
            type: 'array',
            items: { $ref: '#/components/schemas/Agency' },
          },
          pagination: {
            type: 'object',
            properties: {
              currentPage: { type: 'integer', example: 1 },
              totalPages: { type: 'integer', example: 3 },
              totalItems: { type: 'integer', example: 25 },
              itemsPerPage: { type: 'integer', example: 10 },
            },
          },
        },
      },
    },
  },
};

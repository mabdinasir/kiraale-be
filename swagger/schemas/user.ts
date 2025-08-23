/* eslint-disable @typescript-eslint/naming-convention */
export const userSchemas = {
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
        example: 'John',
      },
      lastName: {
        type: 'string',
        example: 'Doe',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'john.doe@example.com',
      },
      mobile: {
        type: 'string',
        example: '+1234567890',
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
        example: '2024-01-15T10:30:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00Z',
      },
    },
  },
  ProfilePictureUploadResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      message: {
        type: 'string',
        example: 'Profile picture uploaded successfully',
      },
      data: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              profilePicture: { type: 'string', format: 'uri' },
            },
          },
          profilePicture: {
            type: 'string',
            format: 'uri',
            example: 'https://s3.amazonaws.com/bucket/profile-pic.jpg',
          },
        },
      },
    },
  },
};

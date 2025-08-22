/* eslint-disable @typescript-eslint/naming-convention */

export const authPaths = {
  '/api/auth/signup': {
    post: {
      tags: ['Authentication'],
      summary: 'Register a new user account',
      description: 'Create a new user account with email verification',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['firstName', 'lastName', 'email', 'password', 'mobile', 'hasAcceptedTnC'],
              properties: {
                firstName: {
                  type: 'string',
                  minLength: 2,
                  example: 'Ahmed',
                },
                lastName: {
                  type: 'string',
                  minLength: 2,
                  example: 'Mohamed',
                },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'ahmed@example.com',
                },
                password: {
                  type: 'string',
                  minLength: 8,
                  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
                  description:
                    'Must contain at least one uppercase, lowercase, number, and special character',
                  example: 'SecurePass123!',
                },
                mobile: {
                  type: 'string',
                  minLength: 10,
                  example: '+252123456789',
                },
                hasAcceptedTnC: {
                  type: 'boolean',
                  description: 'Must accept Terms and Conditions',
                  example: true,
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'User created successfully!' },
                  data: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Validation error or email already exists',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        '409': {
          description: 'User already exists',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        '500': {
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

  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Authenticate user and get token',
      description: 'Login with email and password to receive JWT token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'user@example.com',
                },
                password: {
                  type: 'string',
                  example: 'Password123!',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'User signed in successfully!' },
                  data: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      jwt: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    },
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        '500': {
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

  '/api/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Log out user',
      description: 'Log out user and invalidate token',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'User logged out successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Logged out successfully' },
                },
              },
            },
          },
        },
        '401': {
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

  '/api/auth/request-password-reset': {
    post: {
      tags: ['Authentication'],
      summary: 'Request password reset',
      description: 'Request password reset email',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'user@example.com',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Password reset email sent',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Password reset email sent' },
                },
              },
            },
          },
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        '500': {
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

  '/api/auth/reset-password': {
    post: {
      tags: ['Authentication'],
      summary: 'Reset password',
      description: 'Reset password using token from email',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token', 'newPassword'],
              properties: {
                token: {
                  type: 'string',
                  example: 'reset_token_here',
                },
                newPassword: {
                  type: 'string',
                  minLength: 8,
                  example: 'NewPassword123!',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Password reset successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Password reset successful' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid or expired token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        '500': {
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

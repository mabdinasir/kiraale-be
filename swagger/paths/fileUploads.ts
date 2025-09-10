/* eslint-disable @typescript-eslint/naming-convention */
export const fileUploadPaths = {
  '/api/users/profile-picture/upload': {
    post: {
      tags: ['File Uploads'],
      summary: 'Upload profile picture',
      description: 'Upload user profile picture to AWS S3 (Max 25MB, Images only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['file'],
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description: 'Profile picture file (JPEG, PNG, GIF only, max 25MB)',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Profile picture uploaded successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfilePictureUploadResponse' },
            },
          },
        },
        400: {
          description: 'Validation error (file type, size, or missing file)',
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
        500: {
          description: 'Internal server error or S3 upload failed',
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

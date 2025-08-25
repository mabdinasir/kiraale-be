/* eslint-disable @typescript-eslint/naming-convention */
export const PaymentPaths = {
  '/payments/mpesa/stkpush': {
    post: {
      tags: ['Payment System'],
      summary: 'Initiate M-Pesa STK Push payment',
      description: 'Initiate M-Pesa STK Push payment for property listing. Amount is determined by server based on service type.',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/PaymentRequest',
            },
            examples: {
              propertyListing: {
                summary: 'Property Listing Payment',
                value: {
                  phoneNumber: '+254712345678',
                  userId: '123e4567-e89b-12d3-a456-426614174000',
                  propertyId: '123e4567-e89b-12d3-a456-426614174001',
                  serviceType: 'PROPERTY_LISTING',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'M-Pesa payment initiated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MpesaPaymentResponse',
              },
            },
          },
        },
        400: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Invalid or missing JWT token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        500: {
          description: 'Internal server error - M-Pesa service failure',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },

  '/payments/evc': {
    post: {
      tags: ['Payment System'],
      summary: 'Initiate EVC payment',
      description: 'Initiate EVC (Waafi Pay) payment for property listing. Amount is determined by server based on service type.',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/PaymentRequest',
            },
            examples: {
              propertyListing: {
                summary: 'Property Listing Payment',
                value: {
                  phoneNumber: '+252612345678',
                  userId: '123e4567-e89b-12d3-a456-426614174000',
                  propertyId: '123e4567-e89b-12d3-a456-426614174001',
                  serviceType: 'PROPERTY_LISTING',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'EVC payment initiated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/EvcPaymentResponse',
              },
            },
          },
        },
        400: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Invalid or missing JWT token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        500: {
          description: 'Internal server error - EVC service failure',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },

  '/payments/callbacks/mpesa': {
    post: {
      tags: ['Payment System'],
      summary: 'M-Pesa payment callback',
      description: 'Webhook endpoint for M-Pesa payment status updates. Called by M-Pesa API when payment is processed.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/MpesaCallback',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Callback processed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ResultCode: {
                    type: 'number',
                    example: 0,
                  },
                  ResultDesc: {
                    type: 'string',
                    example: 'Accepted',
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error processing callback',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },

  '/payments/status/{checkoutRequestId}': {
    get: {
      tags: ['Payment System'],
      summary: 'Get payment status',
      description: 'Get the current status of a payment by its checkout request ID.',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: 'checkoutRequestId',
          in: 'path',
          required: true,
          description: 'The checkout request ID from M-Pesa payment initiation',
          schema: {
            type: 'string',
            example: 'ws_CO_191220191020363925',
          },
        },
      ],
      responses: {
        200: {
          description: 'Payment status retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PaymentStatus',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Invalid or missing JWT token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Payment not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
};

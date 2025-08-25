/* eslint-disable @typescript-eslint/naming-convention */
export const PaymentSchemas = {
  PaymentRequest: {
    type: 'object',
    properties: {
      phoneNumber: {
        type: 'string',
        description: 'Phone number for payment (M-Pesa: +254... or EVC: +252...)',
        example: '+254712345678',
      },
      userId: {
        type: 'string',
        format: 'uuid',
        description: 'ID of the user making the payment',
      },
      propertyId: {
        type: 'string',
        format: 'uuid',
        description: 'ID of the property being paid for',
      },
      serviceType: {
        type: 'string',
        enum: ['PROPERTY_LISTING', 'HOTEL_LISTING', 'FEATURED_PROPERTY', 'URGENT_LISTING'],
        description: 'Type of service being paid for',
        default: 'PROPERTY_LISTING',
      },
    },
    required: ['phoneNumber', 'userId', 'propertyId'],
  },

  MpesaPaymentResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      message: {
        type: 'string',
        example: 'M-Pesa payment initiated successfully',
      },
      data: {
        type: 'object',
        properties: {
          MerchantRequestID: {
            type: 'string',
            example: '29115-34620561-1',
          },
          CheckoutRequestID: {
            type: 'string',
            example: 'ws_CO_191220191020363925',
          },
          ResponseCode: {
            type: 'string',
            example: '0',
          },
          ResponseDescription: {
            type: 'string',
            example: 'Success. Request accepted for processing',
          },
          CustomerMessage: {
            type: 'string',
            example: 'Success. Request accepted for processing',
          },
        },
      },
      receiptNumber: {
        type: 'string',
        example: 'KIR123456ABCDE',
        description: 'Generated receipt number for tracking',
      },
      amount: {
        type: 'number',
        example: 20.00,
        description: 'Payment amount from database pricing (can be 0 for free promotions)',
      },
      serviceType: {
        type: 'string',
        example: 'Property Listing Fee',
        description: 'Service name from database',
      },
    },
  },

  EvcPaymentResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      message: {
        type: 'string',
        example: 'EVC payment initiated successfully',
      },
      amount: {
        type: 'number',
        example: 20.00,
        description: 'Payment amount from database pricing (can be 0 for free promotions)',
      },
      serviceType: {
        type: 'string',
        example: 'Property Listing Fee',
        description: 'Service name from database',
      },
    },
  },

  MpesaCallback: {
    type: 'object',
    properties: {
      Body: {
        type: 'object',
        properties: {
          stkCallback: {
            type: 'object',
            properties: {
              MerchantRequestID: {
                type: 'string',
                example: '29115-34620561-1',
              },
              CheckoutRequestID: {
                type: 'string',
                example: 'ws_CO_191220191020363925',
              },
              ResultCode: {
                type: 'number',
                example: 0,
                description: '0 for success, non-zero for failure',
              },
              ResultDesc: {
                type: 'string',
                example: 'The service request is processed successfully.',
              },
              CallbackMetadata: {
                type: 'object',
                properties: {
                  Item: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        Name: {
                          type: 'string',
                          example: 'Amount',
                        },
                        Value: {
                          oneOf: [
                            { type: 'number' },
                            { type: 'string' },
                          ],
                          example: 20.00,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  PaymentStatus: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'object',
        properties: {
          payment: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              checkoutRequestId: {
                type: 'string',
                example: 'ws_CO_191220191020363925',
              },
              amount: {
                type: 'string',
                example: '20.00',
                description: 'Payment amount (can be 0.00 for free promotions)',
              },
              phoneNumber: {
                type: 'string',
                example: '+254712345678',
              },
              status: {
                type: 'string',
                enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
                example: 'COMPLETED',
              },
              mpesaReceiptNumber: {
                type: 'string',
                example: 'NLJ7RT61SV',
                nullable: true,
              },
              userId: {
                type: 'string',
                format: 'uuid',
              },
              propertyId: {
                type: 'string',
                format: 'uuid',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },
      },
    },
  },
};

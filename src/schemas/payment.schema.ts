/* eslint-disable @typescript-eslint/naming-convention */
import { paymentMethodValues, serviceTypeValues } from '@db/schemas/enums';
import { validateKenyanNumber, validateSomaliNumber } from '@lib/utils';
import { z } from 'zod';

// Payment initiation schemas
export const stkPushSchema = z.object({
  phoneNumber: z.string().refine(validateKenyanNumber, {
    message: 'Invalid Kenyan phone number',
  }),
  userId: z.uuid('Invalid user ID'),
  propertyId: z.uuid('Invalid property ID'),
  serviceType: z.enum(serviceTypeValues).default('PROPERTY_LISTING'),
});

export const evcPurchaseSchema = z.object({
  phoneNumber: z.string().refine(validateSomaliNumber, {
    message: 'Invalid Somali phone number',
  }),
  userId: z.uuid('Invalid user ID'),
  propertyId: z.uuid('Invalid property ID'),
  serviceType: z.enum(serviceTypeValues).default('PROPERTY_LISTING'),
});

// Callback schemas
const callbackMetadataItemSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number()]),
});

const callbackMetadataSchema = z.object({
  item: z.array(callbackMetadataItemSchema),
});

export const stkPushCallbackSchema = z.object({
  Body: z.object({
    stkCallback: z.object({
      MerchantRequestID: z.string(),
      CheckoutRequestID: z.string(),
      ResultCode: z.number(),
      ResultDesc: z.string(),
      CallbackMetadata: z.optional(callbackMetadataSchema),
    }),
  }),
});

export const evcCallbackSchema = z.object({
  transactionId: z.string(),
  status: z.string(),
  amount: z.number(),
  phoneNumber: z.string(),
  responseCode: z.string(),
  responseMsg: z.string().optional(),
  receiptNumber: z.string().optional(),
});

// Generic payment callback for unified handling
export const paymentCallbackSchema = z.object({
  transactionId: z.string(),
  status: z.enum(['COMPLETED', 'FAILED', 'PENDING', 'CANCELLED']),
  amount: z.number(),
  phoneNumber: z.string(),
  paymentMethod: z.enum(paymentMethodValues),
  receiptNumber: z.string().optional(),
  failureReason: z.string().optional(),
});

// Query schemas
export const getPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.string().optional(),
  paymentMethod: z.enum(paymentMethodValues).optional(),
  userId: z.uuid().optional(),
  propertyId: z.uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const paymentStatusCheckSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
});

// Type exports
export type StkPush = z.infer<typeof stkPushSchema>;
export type EvcPurchase = z.infer<typeof evcPurchaseSchema>;
export type StkPushCallback = z.infer<typeof stkPushCallbackSchema>;
export type EvcCallback = z.infer<typeof evcCallbackSchema>;
export type PaymentCallback = z.infer<typeof paymentCallbackSchema>;
export type GetPaymentsQuery = z.infer<typeof getPaymentsQuerySchema>;
export type PaymentStatusCheck = z.infer<typeof paymentStatusCheckSchema>;

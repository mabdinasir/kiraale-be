import {
  getServicePrice,
  handleValidationError,
  initiateEvcPaymentFlow,
  sendErrorResponse,
  sendSuccessResponse,
  verifyPropertyAndUser,
} from '@lib';
import { evcPurchaseSchema } from '@schemas';
import type { RequestHandler } from 'express';

export const evcPayment: RequestHandler = async (req, res) => {
  try {
    // Validate request body with Zod
    const validationResult = evcPurchaseSchema.safeParse(req.body);
    if (!validationResult.success) {
      handleValidationError(validationResult.error, res);
      return;
    }

    const { phoneNumber, userId, propertyId, serviceType } = validationResult.data;

    await verifyPropertyAndUser(propertyId, userId);

    // Get pricing from database
    const pricing = await getServicePrice(serviceType);
    if (!pricing) {
      sendErrorResponse(res, 400, `No active pricing found for service: ${serviceType}`);
      return;
    }
    const amount = parseFloat(pricing.amount);

    const result = await initiateEvcPaymentFlow(
      phoneNumber,
      amount,
      userId,
      pricing.serviceName,
      propertyId,
    );

    sendSuccessResponse(res, 200, 'EVC payment initiated successfully', {
      ...(result.data as Record<string, unknown>),
      receiptNumber: result.receiptNumber,
      amount,
      serviceType: pricing.serviceName,
    });
  } catch (error) {
    sendErrorResponse(res, 500, `Failed to initiate EVC payment: ${(error as Error).message}`);
  }
};

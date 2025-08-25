import { handleValidationError, sendErrorResponse, sendSuccessResponse } from '@lib/utils';
import { formatKenyanNumber } from '@lib/utils/formatters/phoneNumbers/formatKenyanNumber';
import { generateReceiptNumber } from '@lib/utils/generators/generateReceiptNumber';
import {
  createMpesaPayload,
  storeMpesaPayment,
  validateMpesaConfig,
  verifyPropertyAndUser,
} from '@lib/utils/payments';
import { getServicePrice } from '@lib/utils/pricing';
import { stkPushSchema } from '@schemas/payment.schema';
import { initiateStkPush } from '@services/mpesa.service';
import type { Request, RequestHandler } from 'express';

export type RequestExtended = Request & { mpesaToken?: string };

export const stkPush: RequestHandler = async (req: RequestExtended, res) => {
  try {
    // Validate request body with Zod
    const validationResult = stkPushSchema.safeParse(req.body);
    if (!validationResult.success) {
      handleValidationError(validationResult.error, res);
      return;
    }

    const { phoneNumber, userId, propertyId, serviceType } = validationResult.data;

    if (!req.mpesaToken) {
      sendErrorResponse(res, 500, 'M-Pesa access token not available');
      return;
    }

    await verifyPropertyAndUser(propertyId, userId);

    // Get pricing from database
    const pricing = await getServicePrice(serviceType);
    if (!pricing) {
      sendErrorResponse(res, 400, `No active pricing found for service: ${serviceType}`);
      return;
    }
    const amount = parseFloat(pricing.amount);

    const { businessShortCode, passkey } = validateMpesaConfig();
    const receiptNumber = generateReceiptNumber();

    const payload = createMpesaPayload(
      phoneNumber,
      amount,
      businessShortCode,
      passkey,
      `${process.env.BASE_URL}/api/payments/callbacks/mpesa`,
      'Kiraale Property',
      'Payment for Property Listing',
    );

    const response = await initiateStkPush(payload, req.mpesaToken);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { CheckoutRequestID } = response as { CheckoutRequestID: string };

    await storeMpesaPayment(
      CheckoutRequestID,
      amount,
      formatKenyanNumber(phoneNumber),
      receiptNumber,
      userId,
      propertyId,
    );

    sendSuccessResponse(res, 200, 'M-Pesa payment initiated successfully', {
      ...(response as Record<string, unknown>),
      receiptNumber,
      amount,
      serviceType: pricing.serviceName,
    });
  } catch (error) {
    sendErrorResponse(res, 500, `Failed to initiate M-Pesa payment: ${(error as Error).message}`);
  }
};

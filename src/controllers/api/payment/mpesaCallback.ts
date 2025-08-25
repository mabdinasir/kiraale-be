import { sendErrorResponse, sendSuccessResponse } from '@lib/utils';
import { updateMpesaPaymentStatus } from '@lib/utils/payments';
import type { StkPushCallback } from '@schemas/payment.schema';
import type { RequestHandler } from 'express';

export const mpesaCallback: RequestHandler = async (req, res) => {
  try {
    const callback = req.body as StkPushCallback;
    const { Body: body } = callback;
    const { stkCallback } = body;
    const transactionId = stkCallback.CheckoutRequestID;
    const isSuccess = stkCallback.ResultCode === 0;
    const status = isSuccess ? 'COMPLETED' : 'FAILED';

    await updateMpesaPaymentStatus(transactionId, status);

    sendSuccessResponse(res, 200, 'Callback processed successfully', {
      status,
    });
  } catch (error) {
    sendErrorResponse(res, 500, `Failed to process callback: ${(error as Error).message}`);
  }
};

import { sendErrorResponse, sendSuccessResponse, updateEvcPaymentStatus } from '@lib';
import type { EvcCallback } from '@schemas';
import type { RequestHandler } from 'express';

export const evcCallback: RequestHandler = async (req, res) => {
  try {
    const callback = req.body as EvcCallback;
    const { transactionId, status: callbackStatus } = callback;
    const isSuccess = callbackStatus.toLowerCase() === 'success';
    const status = isSuccess ? 'COMPLETED' : 'FAILED';

    await updateEvcPaymentStatus(transactionId, status);

    sendSuccessResponse(res, 200, 'EVC callback processed successfully', {
      status,
    });
  } catch (error) {
    sendErrorResponse(res, 500, `Failed to process EVC callback: ${(error as Error).message}`);
  }
};

import { sendErrorResponse, sendSuccessResponse } from '@lib/utils';
import { getAllActivePricing } from '@lib/utils/pricing';
import type { RequestHandler } from 'express';

export const getPricing: RequestHandler = async (req, res) => {
  try {
    const pricing = await getAllActivePricing();

    sendSuccessResponse(res, 200, 'Pricing retrieved successfully', {
      pricing,
    });
  } catch (error) {
    sendErrorResponse(res, 500, `Failed to get pricing: ${(error as Error).message}`);
  }
};

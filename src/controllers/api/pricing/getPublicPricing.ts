import { sendErrorResponse, sendSuccessResponse } from '@lib/utils';
import { getAllActivePricing } from '@lib/utils/pricing';
import type { RequestHandler } from 'express';

export const getPublicPricing: RequestHandler = async (req, res) => {
  try {
    const pricing = await getAllActivePricing();

    // Return only public information (no internal IDs or sensitive data)
    const publicPricing = pricing.map((item) => ({
      serviceType: item.serviceType,
      serviceName: item.serviceName,
      amount: parseFloat(item.amount),
      currency: item.currency,
      description: item.description,
    }));

    sendSuccessResponse(res, 200, 'Pricing retrieved successfully', publicPricing);
  } catch (error) {
    sendErrorResponse(res, 500, `Failed to get pricing: ${(error as Error).message}`);
  }
};

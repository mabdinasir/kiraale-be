import { handleValidationError, sendErrorResponse, sendSuccessResponse } from '@lib/utils';
import { createServicePricing } from '@lib/utils/pricing';
import { createPricingSchema } from '@schemas/pricing.schema';
import type { RequestHandler } from 'express';

export const createPricing: RequestHandler = async (req, res) => {
  try {
    // Validate request body with Zod
    const validationResult = createPricingSchema.safeParse(req.body);
    if (!validationResult.success) {
      handleValidationError(validationResult.error, res);
      return;
    }

    const { serviceType, serviceName, amount, currency, description } = validationResult.data;

    const newPricing = await createServicePricing({
      serviceType,
      serviceName,
      amount,
      currency,
      description,
    });

    sendSuccessResponse(res, 201, 'Service pricing created successfully', newPricing);
  } catch (error) {
    sendErrorResponse(res, 500, `Failed to create pricing: ${(error as Error).message}`);
  }
};

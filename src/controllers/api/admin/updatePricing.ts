import { handleValidationError, sendErrorResponse, sendSuccessResponse } from '@lib/utils';
import { updateServicePricing } from '@lib/utils/pricing';
import { pricingParamsSchema, updatePricingSchema } from '@schemas/pricing.schema';
import type { RequestHandler } from 'express';

export const updatePricing: RequestHandler = async (req, res) => {
  try {
    // Validate request params
    const paramsValidation = pricingParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      handleValidationError(paramsValidation.error, res);
      return;
    }

    // Validate request body
    const bodyValidation = updatePricingSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      handleValidationError(bodyValidation.error, res);
      return;
    }

    const { id: pricingId } = paramsValidation.data;
    const updateData = bodyValidation.data;

    const updatedPricing = await updateServicePricing(pricingId, updateData);

    if (!updatedPricing) {
      sendErrorResponse(res, 404, 'Pricing not found');
      return;
    }

    sendSuccessResponse(res, 200, 'Pricing updated successfully', updatedPricing);
  } catch (error) {
    sendErrorResponse(res, 500, `Failed to update pricing: ${(error as Error).message}`);
  }
};

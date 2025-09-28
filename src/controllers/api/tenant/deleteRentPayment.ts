import db, { property, rentPayment, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { rentPaymentIdSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteRentPayment: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: rentPaymentId } = rentPaymentIdSchema.parse(request.params);

    // Get rent payment with tenant and property info to verify ownership
    const [rentPaymentData] = await db
      .select({
        rentPayment,
        tenant,
        property,
      })
      .from(rentPayment)
      .innerJoin(tenant, eq(rentPayment.tenantId, tenant.id))
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(and(eq(rentPayment.id, rentPaymentId), eq(rentPayment.isDeleted, false)));

    if (!rentPaymentData) {
      sendErrorResponse(response, 404, 'Rent payment not found');
      return;
    }

    if (rentPaymentData.property.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only delete rent payments for your own properties');
      return;
    }

    // Soft delete the rent payment
    const [deletedPayment] = await db
      .update(rentPayment)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(rentPayment.id, rentPaymentId))
      .returning();

    sendSuccessResponse(response, 200, 'Rent payment deleted successfully', {
      payment: deletedPayment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'DELETE_RENT_PAYMENT');
    sendErrorResponse(response, 500, `Failed to delete rent payment: ${(error as Error).message}`);
  }
};

export default deleteRentPayment;

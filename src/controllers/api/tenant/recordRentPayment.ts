import db, { property, rentPayment, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { recordRentPaymentSchema, tenantIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const recordRentPayment: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);
    const validatedData = recordRentPaymentSchema.parse(request.body);

    // Get tenant with property info to verify ownership
    const [tenantData] = await db
      .select({
        tenant,
        property,
      })
      .from(tenant)
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(eq(tenant.id, tenantId));

    if (!tenantData) {
      sendErrorResponse(response, 404, 'Tenant not found');
      return;
    }

    if (tenantData.property.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only record payments for your own properties');
      return;
    }

    // Create rent payment record
    const [newPayment] = await db
      .insert(rentPayment)
      .values({
        tenantId,
        amount: validatedData.amount.toString(),
        paidDate: validatedData.paidDate,
        receiptNumber: validatedData.receiptNumber,
        paymentMethod: validatedData.paymentMethod,
        receivedBy: requestingUserId,
        paymentPeriodStart: validatedData.paymentPeriodStart,
        paymentPeriodEnd: validatedData.paymentPeriodEnd,
        notes: validatedData.notes,
        isPaid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    sendSuccessResponse(response, 201, 'Rent payment recorded successfully', {
      payment: newPayment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'RECORD_RENT_PAYMENT');
    sendErrorResponse(response, 500, `Failed to record rent payment: ${(error as Error).message}`);
  }
};

export default recordRentPayment;

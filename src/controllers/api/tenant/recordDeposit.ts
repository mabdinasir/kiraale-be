import db, { property, securityDeposit, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { recordDepositSchema, tenantIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const recordDeposit: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);
    const validatedData = recordDepositSchema.parse(request.body);

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
      sendErrorResponse(response, 403, 'You can only record deposits for your own properties');
      return;
    }

    // Create deposit record
    const [newDeposit] = await db
      .insert(securityDeposit)
      .values({
        tenantId,
        amount: validatedData.amount.toString(),
        paidDate: validatedData.paidDate,
        receiptNumber: validatedData.receiptNumber,
        isRefunded: false,
        createdAt: new Date(),
      })
      .returning();

    sendSuccessResponse(response, 201, 'Security deposit recorded successfully', {
      deposit: newDeposit,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'RECORD_DEPOSIT');
    sendErrorResponse(response, 500, `Failed to record deposit: ${(error as Error).message}`);
  }
};

export default recordDeposit;

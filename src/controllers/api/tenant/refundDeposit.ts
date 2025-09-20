import db, { property, securityDeposit, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { depositIdSchema, refundDepositSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const refundDeposit: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: depositId } = depositIdSchema.parse(request.params);
    const validatedData = refundDepositSchema.parse(request.body);

    // Get deposit with tenant and property info to verify ownership
    const [depositData] = await db
      .select({
        deposit: securityDeposit,
        tenant,
        property,
      })
      .from(securityDeposit)
      .innerJoin(tenant, eq(securityDeposit.tenantId, tenant.id))
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(eq(securityDeposit.id, depositId));

    if (!depositData) {
      sendErrorResponse(response, 404, 'Deposit not found');
      return;
    }

    if (depositData.property.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only refund deposits for your own properties');
      return;
    }

    if (depositData.deposit.isRefunded) {
      sendErrorResponse(response, 400, 'Deposit is already refunded');
      return;
    }

    // Process refund
    const [updatedDeposit] = await db
      .update(securityDeposit)
      .set({
        refundAmount: validatedData.refundAmount.toString(),
        refundDate: validatedData.refundDate,
        refundReason: validatedData.refundReason,
        refundedBy: requestingUserId,
        isRefunded: true,
      })
      .where(eq(securityDeposit.id, depositId))
      .returning();

    sendSuccessResponse(response, 200, 'Deposit refunded successfully', updatedDeposit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'REFUND_DEPOSIT');
    sendErrorResponse(response, 500, `Failed to refund deposit: ${(error as Error).message}`);
  }
};

export default refundDeposit;

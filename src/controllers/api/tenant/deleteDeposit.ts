import db, { property, securityDeposit, tenant } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { depositIdSchema } from '@schemas';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const deleteDeposit: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: depositId } = depositIdSchema.parse(request.params);

    // Get deposit with tenant and property info to verify ownership
    const [depositData] = await db
      .select({
        securityDeposit,
        tenant,
        property,
      })
      .from(securityDeposit)
      .innerJoin(tenant, eq(securityDeposit.tenantId, tenant.id))
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(and(eq(securityDeposit.id, depositId), eq(securityDeposit.isDeleted, false)));

    if (!depositData) {
      sendErrorResponse(response, 404, 'Deposit not found');
      return;
    }

    if (depositData.property.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only delete deposits for your own properties');
      return;
    }

    // Check if deposit is already refunded
    if (depositData.securityDeposit.isRefunded) {
      sendErrorResponse(response, 400, 'Cannot delete a refunded deposit');
      return;
    }

    // Soft delete the deposit
    const [deletedDeposit] = await db
      .update(securityDeposit)
      .set({
        isDeleted: true,
      })
      .where(eq(securityDeposit.id, depositId))
      .returning();

    sendSuccessResponse(response, 200, 'Deposit deleted successfully', {
      deposit: deletedDeposit,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'DELETE_DEPOSIT');
    sendErrorResponse(response, 500, `Failed to delete deposit: ${(error as Error).message}`);
  }
};

export default deleteDeposit;

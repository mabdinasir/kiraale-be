import db, { property, rentPayment, tenant, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getPaymentHistorySchema, tenantIdSchema } from '@schemas';
import { and, eq, gte, lt } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getPaymentHistory: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);
    const queryParams = getPaymentHistorySchema.parse(request.query);

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
      sendErrorResponse(response, 403, 'You can only view payment history for your own properties');
      return;
    }

    // Build query conditions
    const conditions = [eq(rentPayment.tenantId, tenantId)];

    if (queryParams.year) {
      const startOfYear = new Date(queryParams.year, 0, 1);
      const startOfNextYear = new Date(queryParams.year + 1, 0, 1);
      conditions.push(gte(rentPayment.paidDate, startOfYear));
      conditions.push(lt(rentPayment.paidDate, startOfNextYear));
    }

    // Pagination
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const offset = (page - 1) * limit;

    // Get payment history with user info
    const payments = await db
      .select({
        payment: rentPayment,
        receivedBy: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      })
      .from(rentPayment)
      .innerJoin(user, eq(rentPayment.receivedBy, user.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(rentPayment.paidDate);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: rentPayment.id })
      .from(rentPayment)
      .where(and(...conditions));

    const totalCount = Number(count) || 0;
    const totalPages = Math.ceil(totalCount / limit);

    sendSuccessResponse(response, 200, 'Payment history retrieved successfully', {
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_PAYMENT_HISTORY');
    sendErrorResponse(
      response,
      500,
      `Failed to retrieve payment history: ${(error as Error).message}`,
    );
  }
};

export default getPaymentHistory;

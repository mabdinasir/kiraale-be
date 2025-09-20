import db, { property, rentPayment, tenant, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getPaymentHistorySchema } from '@schemas';
import { and, eq, gte, lt } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getMyTenantsPayments: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const queryParams = getPaymentHistorySchema.parse(request.query);

    // Build query conditions
    const conditions = [eq(property.userId, requestingUserId)];

    if (queryParams.year) {
      const startOfYear = new Date(queryParams.year, 0, 1);
      const startOfNextYear = new Date(queryParams.year + 1, 0, 1);
      conditions.push(gte(rentPayment.paidDate, startOfYear));
      conditions.push(lt(rentPayment.paidDate, startOfNextYear));
    }

    // Pagination
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 20;
    const offset = (page - 1) * limit;

    // Get payments across all user's properties
    const payments = await db
      .select({
        payment: rentPayment,
        tenant: {
          id: tenant.id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email,
        },
        property: {
          id: property.id,
          title: property.title,
          address: property.address,
          propertyType: property.propertyType,
        },
        receivedBy: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      })
      .from(rentPayment)
      .innerJoin(tenant, eq(rentPayment.tenantId, tenant.id))
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .innerJoin(user, eq(rentPayment.receivedBy, user.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(rentPayment.paidDate);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: rentPayment.id })
      .from(rentPayment)
      .innerJoin(tenant, eq(rentPayment.tenantId, tenant.id))
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(and(...conditions));

    const totalCount = Number(count) || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Calculate total amount for the period
    const [{ totalAmount }] = await db
      .select({
        totalAmount: rentPayment.amount,
      })
      .from(rentPayment)
      .innerJoin(tenant, eq(rentPayment.tenantId, tenant.id))
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(and(...conditions));

    sendSuccessResponse(response, 200, 'Payment history retrieved successfully', {
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
      summary: {
        totalAmount: totalAmount || 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_MY_TENANTS_PAYMENTS');
    sendErrorResponse(
      response,
      500,
      `Failed to retrieve payment history: ${(error as Error).message}`,
    );
  }
};

export default getMyTenantsPayments;

import db, { property, rentPayment, tenant, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { searchRentPaymentsSchema } from '@schemas';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const searchRentPayments: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const queryValidation = searchRentPaymentsSchema.safeParse(request.query);
    if (!queryValidation.success) {
      handleValidationError(queryValidation.error, response);
      return;
    }

    const { page = 1, limit = 20, search } = queryValidation.data;

    // Build query conditions - only show payments for user's properties and exclude deleted
    const conditions = [eq(property.userId, requestingUserId), eq(rentPayment.isDeleted, false)];

    // Expanded search across multiple fields
    if (search) {
      const searchCondition = or(
        // Tenant information
        ilike(tenant.firstName, `%${search}%`),
        ilike(tenant.lastName, `%${search}%`),
        ilike(tenant.email, `%${search}%`),
        ilike(tenant.mobile, `%${search}%`),
        // Property information
        ilike(property.title, `%${search}%`),
        ilike(property.address, `%${search}%`),
        // Payment details
        ilike(rentPayment.receiptNumber, `%${search}%`),
        ilike(rentPayment.paymentMethod, `%${search}%`),
        ilike(rentPayment.notes, `%${search}%`),
        // Amount search (convert to string for ILIKE)
        ilike(sql`${rentPayment.amount}::text`, `%${search}%`),
        // Date searches (convert to string for ILIKE)
        ilike(sql`${rentPayment.paidDate}::text`, `%${search}%`),
        ilike(sql`${rentPayment.paymentPeriodStart}::text`, `%${search}%`),
        ilike(sql`${rentPayment.paymentPeriodEnd}::text`, `%${search}%`),
        // User who received payment
        ilike(user.firstName, `%${search}%`),
        ilike(user.lastName, `%${search}%`),
        ilike(user.email, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Get rent payments with tenant and property info
    const rentPayments = await db
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
      .offset((page - 1) * limit)
      .orderBy(rentPayment.paidDate);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rentPayment)
      .innerJoin(tenant, eq(rentPayment.tenantId, tenant.id))
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .innerJoin(user, eq(rentPayment.receivedBy, user.id))
      .where(and(...conditions));

    const totalPayments = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalPayments / limit);

    sendSuccessResponse(response, 200, 'Rent payments retrieved successfully', {
      rentPayments,
      pagination: {
        page,
        limit,
        total: totalPayments,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        search,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'SEARCH_RENT_PAYMENTS');
    sendErrorResponse(response, 500, 'Failed to search rent payments.');
  }
};

export default searchRentPayments;

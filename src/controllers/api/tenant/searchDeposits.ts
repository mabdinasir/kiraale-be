import db, { property, securityDeposit, tenant, user } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { searchDepositsSchema } from '@schemas';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const searchDeposits: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const queryValidation = searchDepositsSchema.safeParse(request.query);
    if (!queryValidation.success) {
      handleValidationError(queryValidation.error, response);
      return;
    }

    const { page = 1, limit = 20, search } = queryValidation.data;

    // Build query conditions - only show deposits for user's properties and exclude deleted
    const conditions = [
      eq(property.userId, requestingUserId),
      eq(securityDeposit.isDeleted, false),
    ];

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
        // Deposit details
        ilike(securityDeposit.receiptNumber, `%${search}%`),
        ilike(securityDeposit.refundReason, `%${search}%`),
        // Amount searches (convert to string for ILIKE)
        ilike(sql`${securityDeposit.amount}::text`, `%${search}%`),
        ilike(sql`${securityDeposit.refundAmount}::text`, `%${search}%`),
        // Date searches (convert to string for ILIKE)
        ilike(sql`${securityDeposit.paidDate}::text`, `%${search}%`),
        ilike(sql`${securityDeposit.refundDate}::text`, `%${search}%`),
        // Refund status search
        ilike(sql`${securityDeposit.isRefunded}::text`, `%${search}%`),
        // User who refunded (if applicable)
        ilike(user.firstName, `%${search}%`),
        ilike(user.lastName, `%${search}%`),
        ilike(user.email, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Get deposits with tenant and property info
    const deposits = await db
      .select({
        deposit: securityDeposit,
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
        refundedBy: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      })
      .from(securityDeposit)
      .innerJoin(tenant, eq(securityDeposit.tenantId, tenant.id))
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .leftJoin(user, eq(securityDeposit.refundedBy, user.id))
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(securityDeposit.paidDate);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(securityDeposit)
      .innerJoin(tenant, eq(securityDeposit.tenantId, tenant.id))
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .leftJoin(user, eq(securityDeposit.refundedBy, user.id))
      .where(and(...conditions));

    const totalDeposits = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalDeposits / limit);

    sendSuccessResponse(response, 200, 'Security deposits retrieved successfully', {
      deposits,
      pagination: {
        page,
        limit,
        total: totalDeposits,
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

    logError(error, 'SEARCH_DEPOSITS');
    sendErrorResponse(response, 500, 'Failed to search deposits.');
  }
};

export default searchDeposits;

import db from '@db/index';
import { payment, property, user } from '@db/schemas';
import { handleValidationError, sendErrorResponse, sendSuccessResponse } from '@lib/utils';
import { getPaymentsSchema } from '@schemas/admin.schema';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import type { RequestHandler } from 'express';

export const getPayments: RequestHandler = async (req, res) => {
  try {
    // Validate query parameters using Zod
    const validation = getPaymentsSchema.safeParse(req.query);

    if (!validation.success) {
      handleValidationError(validation.error, res);
      return;
    }

    const { page, limit, status, method, search, propertyId } = validation.data;
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(payment.paymentStatus, status));
    }

    if (method) {
      conditions.push(eq(payment.paymentMethod, method));
    }

    if (propertyId) {
      conditions.push(eq(payment.propertyId, propertyId));
    }

    // Add search functionality
    if (search) {
      conditions.push(
        or(
          ilike(payment.receiptNumber, `%${search}%`),
          ilike(payment.transactionId, `%${search}%`),
          ilike(payment.phoneNumber, `%${search}%`),
        ),
      );
    }

    // Build base query
    const baseQuery = db
      .select({
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        receiptNumber: payment.receiptNumber,
        phoneNumber: payment.phoneNumber,
        paymentStatus: payment.paymentStatus,
        paymentMethod: payment.paymentMethod,
        transactionDate: payment.transactionDate,
        createdAt: payment.createdAt,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        property: {
          id: property.id,
          title: property.title,
          price: property.price,
          propertyType: property.propertyType,
          status: property.status,
        },
      })
      .from(payment)
      .leftJoin(user, eq(payment.userId, user.id))
      .leftJoin(property, eq(payment.propertyId, property.id));

    // Apply conditions and ordering
    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    const finalQuery = query.orderBy(desc(payment.createdAt)).limit(limit).offset(offset);

    const payments = await finalQuery;

    // Get total count for pagination
    const baseCountQuery = db
      .select({ count: payment.id })
      .from(payment)
      .leftJoin(user, eq(payment.userId, user.id))
      .leftJoin(property, eq(payment.propertyId, property.id));

    const countQuery =
      conditions.length > 0 ? baseCountQuery.where(and(...conditions)) : baseCountQuery;

    const totalResult = await countQuery;
    const total = totalResult.length;

    sendSuccessResponse(res, 200, 'Payments retrieved successfully', {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    sendErrorResponse(res, 500, `Failed to get payments: ${(error as Error).message}`);
  }
};

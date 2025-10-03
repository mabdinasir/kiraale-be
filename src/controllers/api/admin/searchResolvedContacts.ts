import db, { contact } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { adminSearchContactsSchema } from '@schemas';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const searchResolvedContacts: RequestHandler = async (request, response) => {
  try {
    const queryValidation = adminSearchContactsSchema.safeParse(request.query);
    if (!queryValidation.success) {
      handleValidationError(queryValidation.error, response);
      return;
    }

    const { page = 1, limit = 50, search } = queryValidation.data;

    // Build query conditions - only resolved contacts
    const conditions = [eq(contact.isResolved, true)];

    if (search) {
      const searchCondition = or(
        ilike(contact.fullName, `%${search}%`),
        ilike(contact.email, `%${search}%`),
        ilike(contact.mobile, `%${search}%`),
        ilike(contact.subject, `%${search}%`),
        ilike(contact.message, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Get contacts with pagination - only listing fields
    const contacts = await db
      .select({
        id: contact.id,
        fullName: contact.fullName,
        email: contact.email,
        mobile: contact.mobile,
        subject: contact.subject,
        message: contact.message,
        resolvedAt: contact.resolvedAt,
        createdAt: contact.createdAt,
      })
      .from(contact)
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(contact.resolvedAt);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contact)
      .where(and(...conditions));

    const totalContacts = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalContacts / limit);

    sendSuccessResponse(response, 200, 'Resolved contacts retrieved successfully', {
      contacts,
      pagination: {
        page,
        limit,
        total: totalContacts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        search,
        isResolved: true,
      },
    });
  } catch (error) {
    logError(error, 'ADMIN_SEARCH_RESOLVED_CONTACTS');
    sendErrorResponse(response, 500, 'Failed to search resolved contacts.');
  }
};

export default searchResolvedContacts;

import db, { contact } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { adminSearchContactsSchema } from '@schemas';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import type { RequestHandler } from 'express';

const searchUnresolvedContacts: RequestHandler = async (request, response) => {
  try {
    const queryValidation = adminSearchContactsSchema.safeParse(request.query);
    if (!queryValidation.success) {
      handleValidationError(queryValidation.error, response);
      return;
    }

    const { page = 1, limit = 50, search } = queryValidation.data;

    // Build query conditions - only unresolved contacts
    const conditions = [eq(contact.isResolved, false)];

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

    // Get contacts with pagination
    const contacts = await db
      .select({
        id: contact.id,
        fullName: contact.fullName,
        mobile: contact.mobile,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        isResolved: contact.isResolved,
        createdAt: contact.createdAt,
      })
      .from(contact)
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(contact.createdAt);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contact)
      .where(and(...conditions));

    const totalContacts = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalContacts / limit);

    sendSuccessResponse(response, 200, 'Unresolved contacts retrieved successfully', {
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
        isResolved: false,
      },
    });
  } catch (error) {
    logError(error, 'ADMIN_SEARCH_UNRESOLVED_CONTACTS');
    sendErrorResponse(response, 500, 'Failed to search unresolved contacts.');
  }
};

export default searchUnresolvedContacts;

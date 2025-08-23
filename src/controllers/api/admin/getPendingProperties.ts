import db from '@db/index';
import { property, user } from '@db/schemas';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { getPendingPropertiesSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getPendingProperties: RequestHandler = async (request, response) => {
  try {
    const { page, limit } = getPendingPropertiesSchema.parse(request.query);

    const offset = (page - 1) * limit;

    // Get pending properties with owner details
    const pendingProperties = await db
      .select({
        id: property.id,
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        listingType: property.listingType,
        address: property.address,
        country: property.country,
        price: property.price,
        priceType: property.priceType,
        status: property.status,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        owner: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      })
      .from(property)
      .innerJoin(user, eq(property.userId, user.id))
      .where(eq(property.status, 'PENDING'))
      .orderBy(property.createdAt) // Oldest first for FIFO processing
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: property.id })
      .from(property)
      .where(eq(property.status, 'PENDING'));

    const totalProperties = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalProperties / limit);

    response.status(200).json({
      success: true,
      data: {
        properties: pendingProperties,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalProperties,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'GET_PENDING_PROPERTIES');
    sendErrorResponse(response, 500, 'Failed to retrieve pending properties.');
  }
};

export default getPendingProperties;

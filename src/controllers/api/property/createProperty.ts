import db from '@db/index';
import { agencyAgent, media, property } from '@db/schemas';
import {
  handleValidationError,
  logError,
  sendErrorResponse,
  sendSuccessResponse,
} from '@lib/utils/error/errorHandler';
import { createPropertySchema } from '@schemas/property.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const createProperty: RequestHandler = async (request, response) => {
  try {
    const userId = request.user?.id;
    const propertyData = createPropertySchema.parse({
      ...request.body,
      userId, // Set userId from authenticated user
    });

    // Check if user is an agent to auto-assign property to their agency
    let agencyId = null;
    if (userId) {
      const [activeAgency] = await db
        .select({ agencyId: agencyAgent.agencyId })
        .from(agencyAgent)
        .where(eq(agencyAgent.userId, userId))
        .limit(1); // Get first active agency if user has multiple

      agencyId = activeAgency?.agencyId || null;
    }

    const [createdProperty] = await db
      .insert(property)
      .values({
        ...propertyData,
        agencyId, // Auto-assign to user's agency if they're an agent
        price: propertyData.price.toString(),
        landSize: propertyData.landSize,
        floorArea: propertyData.floorArea,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Get media for the newly created property (initially empty but structure ready)
    const propertyMedia = await db
      .select()
      .from(media)
      .where(eq(media.propertyId, createdProperty.id))
      .orderBy(media.displayOrder, media.uploadedAt);

    sendSuccessResponse(response, 201, 'Property created successfully', {
      property: {
        ...createdProperty,
        media: propertyMedia,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'CREATE_PROPERTY');
    sendErrorResponse(response, 500, `Internal error occurred: ${(error as Error).message}`);
  }
};

export default createProperty;

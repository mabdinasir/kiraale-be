import db, { media, property } from '@db';
import { handleValidationError, logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { createPropertySchema } from '@schemas';
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

    // Properties now belong directly to users for accountability

    const [createdProperty] = await db
      .insert(property)
      .values({
        ...propertyData,
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

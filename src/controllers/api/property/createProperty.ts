import db from '@db/index';
import { property } from '@db/schemas';
import { handleValidationError, logError } from '@lib/utils/error/errorHandler';
import { createPropertySchema } from '@schemas/property.schema';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const createProperty: RequestHandler = async (request, response) => {
  try {
    const propertyData = createPropertySchema.parse({
      ...request.body,
      userId: request.user?.id, // Set userId from authenticated user
    });

    const [createdProperty] = await db
      .insert(property)
      .values({
        ...propertyData,
        price: propertyData.price.toString(),
        landSize: propertyData.landSize ? propertyData.landSize.toString() : undefined,
        floorArea: propertyData.floorArea ? propertyData.floorArea.toString() : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    response.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: {
        property: createdProperty,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'CREATE_PROPERTY');
    response.status(500).json({
      success: false,
      message: `Internal error occurred: ${(error as Error).message}`,
    });
  }
};

export default createProperty;

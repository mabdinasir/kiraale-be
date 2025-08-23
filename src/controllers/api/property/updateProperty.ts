import db from '@db/index';
import { property } from '@db/schemas';
import { adminPermissions } from '@lib/permissions';
import { handleValidationError, logError, sendErrorResponse } from '@lib/utils/error/errorHandler';
import { getPropertyByIdSchema, updatePropertySchema } from '@schemas/property.schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const updateProperty: RequestHandler = async (request, response) => {
  try {
    const { id } = getPropertyByIdSchema.parse(request.params);
    const updateData = updatePropertySchema.parse(request.body);

    const requestingUserId = request.user?.id;
    const requestingUserRole = request.user?.role;

    if (!requestingUserId || !requestingUserRole) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    // Check if property exists
    const [existingProperty] = await db.select().from(property).where(eq(property.id, id));

    if (!existingProperty) {
      response.status(404).json({
        success: false,
        message: 'Property not found',
      });
      return;
    }

    // Check if user can modify this property (owner or admin)
    const canModify =
      existingProperty.userId === requestingUserId ||
      adminPermissions.canAccess(requestingUserRole);

    if (!canModify) {
      sendErrorResponse(response, 403, 'Access denied. You can only update your own properties.');
      return;
    }

    // Update property
    const [updatedProperty] = await db
      .update(property)
      .set({
        ...updateData,
        price: updateData.price ? updateData.price.toString() : undefined,
        landSize: updateData.landSize ? updateData.landSize.toString() : undefined,
        floorArea: updateData.floorArea ? updateData.floorArea.toString() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(property.id, id))
      .returning();

    response.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: {
        property: updatedProperty,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(error, response);
      return;
    }

    logError(error, 'UPDATE_PROPERTY');
    sendErrorResponse(response, 500, 'Failed to update property.');
  }
};

export default updateProperty;

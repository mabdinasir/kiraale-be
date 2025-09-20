import db, { property, tenant } from '@db';
import { logError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { tenantIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { z } from 'zod';

const getTenant: RequestHandler = async (request, response) => {
  try {
    const requestingUserId = request.user?.id;

    if (!requestingUserId) {
      sendErrorResponse(response, 401, 'Authentication required');
      return;
    }

    const { id: tenantId } = tenantIdSchema.parse(request.params);

    // Get tenant with property info to verify ownership
    const [tenantData] = await db
      .select({
        tenant,
        property,
      })
      .from(tenant)
      .innerJoin(property, eq(tenant.propertyId, property.id))
      .where(eq(tenant.id, tenantId));

    if (!tenantData) {
      sendErrorResponse(response, 404, 'Tenant not found');
      return;
    }

    if (tenantData.property.userId !== requestingUserId) {
      sendErrorResponse(response, 403, 'You can only view tenants for your own properties');
      return;
    }

    sendSuccessResponse(response, 200, 'Tenant retrieved successfully', tenantData.tenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendErrorResponse(response, 400, 'Invalid tenant ID format');
      return;
    }

    logError(error, 'GET_TENANT');
    sendErrorResponse(response, 500, `Failed to retrieve tenant: ${(error as Error).message}`);
  }
};

export default getTenant;

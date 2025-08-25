import db from '@db/index';
import { servicePricing, type Currency, type ServiceType } from '@db/schemas';
import { and, eq } from 'drizzle-orm';
import { logError } from '../error/errorHandler';

// Get active pricing for a service
export const getServicePrice = async (serviceType: ServiceType) => {
  const [pricing] = await db
    .select()
    .from(servicePricing)
    .where(and(eq(servicePricing.serviceType, serviceType), eq(servicePricing.active, true)))
    .limit(1);

  if (!pricing) {
    logError(`No active pricing found for service: ${serviceType}`);
  }

  return pricing;
};

// Get all active pricing
export const getAllActivePricing = () =>
  db
    .select()
    .from(servicePricing)
    .where(eq(servicePricing.active, true))
    .orderBy(servicePricing.serviceName);

// Create new pricing
export const createServicePricing = async (data: {
  serviceType: ServiceType;
  serviceName: string;
  amount: number;
  currency?: Currency;
  description?: string;
}) => {
  const [newPricing] = await db
    .insert(servicePricing)
    .values({
      ...data,
      amount: data.amount.toString(),
    })
    .returning();

  return newPricing;
};

// Update pricing
export const updateServicePricing = async (
  id: string,
  data: {
    serviceName?: string;
    amount?: number;
    currency?: Currency;
    description?: string;
    active?: boolean;
  },
) => {
  const updateData: Record<string, string | number | boolean | Date> = {
    updatedAt: new Date(),
  };

  if (data.serviceName !== undefined) {
    updateData.serviceName = data.serviceName;
  }
  if (data.amount !== undefined) {
    updateData.amount = data.amount.toString();
  }
  if (data.currency !== undefined) {
    updateData.currency = data.currency;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.active !== undefined) {
    updateData.active = data.active;
  }

  const [updatedPricing] = await db
    .update(servicePricing)
    .set(updateData)
    .where(eq(servicePricing.id, id))
    .returning();

  return updatedPricing;
};

// Deactivate pricing (soft delete)
export const deactivateServicePricing = async (id: string) => {
  const [deactivatedPricing] = await db
    .update(servicePricing)
    .set({
      active: false,
      updatedAt: new Date(),
    })
    .where(eq(servicePricing.id, id))
    .returning();

  return deactivatedPricing;
};

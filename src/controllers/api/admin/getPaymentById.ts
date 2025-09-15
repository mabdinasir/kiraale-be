import db, { payment, property, user } from '@db';
import { handleValidationError, sendErrorResponse, sendSuccessResponse } from '@lib';
import { getPaymentByIdSchema } from '@schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';

export const getPaymentById: RequestHandler = async (req, res) => {
  try {
    // Validate request params with Zod
    const validationResult = getPaymentByIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      handleValidationError(validationResult.error, res);
      return;
    }

    const { paymentId } = validationResult.data;

    const [paymentData] = await db
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
        updatedAt: payment.updatedAt,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.mobile,
          role: user.role,
        },
        property: {
          id: property.id,
          title: property.title,
          description: property.description,
          price: property.price,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          landSize: property.landSize,
          address: property.address,
          status: property.status,
          createdAt: property.createdAt,
        },
      })
      .from(payment)
      .leftJoin(user, eq(payment.userId, user.id))
      .leftJoin(property, eq(payment.propertyId, property.id))
      .where(eq(payment.id, paymentId))
      .limit(1);

    if (!paymentData) {
      sendErrorResponse(res, 404, 'Payment not found');
      return;
    }

    sendSuccessResponse(res, 200, 'Payment retrieved successfully', paymentData);
  } catch (error) {
    sendErrorResponse(res, 500, `Failed to get payment: ${(error as Error).message}`);
  }
};

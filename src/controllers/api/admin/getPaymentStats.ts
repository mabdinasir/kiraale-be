import db from '@db/index';
import { payment } from '@db/schemas';
import { sendErrorResponse, sendSuccessResponse } from '@lib/utils';
import { and, count, eq, gte, sum } from 'drizzle-orm';
import type { RequestHandler } from 'express';

export const getPaymentStats: RequestHandler = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period as string, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total stats
    const [totalStats] = await db
      .select({
        totalPayments: count(payment.id),
        totalAmount: sum(payment.amount),
      })
      .from(payment)
      .where(eq(payment.paymentStatus, 'COMPLETED'));

    // Period stats
    const [periodStats] = await db
      .select({
        totalPayments: count(payment.id),
        totalAmount: sum(payment.amount),
      })
      .from(payment)
      .where(and(eq(payment.paymentStatus, 'COMPLETED'), gte(payment.transactionDate, startDate)));

    // Status breakdown
    const statusBreakdown = await db
      .select({
        status: payment.paymentStatus,
        count: count(payment.id),
        totalAmount: sum(payment.amount),
      })
      .from(payment)
      .groupBy(payment.paymentStatus);

    // Method breakdown
    const methodBreakdown = await db
      .select({
        method: payment.paymentMethod,
        count: count(payment.id),
        totalAmount: sum(payment.amount),
      })
      .from(payment)
      .where(eq(payment.paymentStatus, 'COMPLETED'))
      .groupBy(payment.paymentMethod);

    // Recent payments (last 5)
    const recentPayments = await db
      .select({
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        transactionDate: payment.transactionDate,
      })
      .from(payment)
      .orderBy(payment.transactionDate)
      .limit(50);

    sendSuccessResponse(res, 200, 'Payment stats retrieved successfully', {
      data: {
        overview: {
          total: {
            payments: totalStats?.totalPayments ?? 0,
            amount: parseFloat(totalStats?.totalAmount ?? '0'),
          },
          period: {
            days,
            payments: periodStats?.totalPayments ?? 0,
            amount: parseFloat(periodStats?.totalAmount ?? '0'),
          },
        },
        breakdown: {
          byStatus: statusBreakdown.map((item) => ({
            status: item.status,
            count: item.count,
            amount: parseFloat(item.totalAmount ?? '0'),
          })),
          byMethod: methodBreakdown.map((item) => ({
            method: item.method,
            count: item.count,
            amount: parseFloat(item.totalAmount ?? '0'),
          })),
        },
        recentPayments,
      },
    });
  } catch (error) {
    sendErrorResponse(res, 500, `Failed to get payment stats: ${(error as Error).message}`);
  }
};

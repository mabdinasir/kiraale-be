import db, { payment } from '@db';
import { formatSomaliNumber, generateReceiptNumber, logError } from '@lib';
import { initiateEvcPayment } from '@services';
import { eq } from 'drizzle-orm';

export const validateEvcConfig = () => {
  const merchantUid = process.env.WAAFI_MERCHANT_UID;
  const apiUserId = process.env.WAAFI_API_USER_ID;
  const apiKey = process.env.WAAFI_API_KEY;

  if (!merchantUid || !apiUserId || !apiKey) {
    logError(
      'Missing required EVC configuration: WAAFI_MERCHANT_UID, WAAFI_API_USER_ID, or WAAFI_API_KEY',
    );
    throw new Error(
      'Missing required EVC configuration: WAAFI_MERCHANT_UID, WAAFI_API_USER_ID, or WAAFI_API_KEY',
    );
  }

  return { merchantUid, apiUserId, apiKey };
};

export const createEvcPayload = (
  phoneNumber: string,
  amount: number,
  receiptNumber: string,
  description: string,
  merchantUid: string,
  apiUserId: string,
  apiKey: string,
) => ({
  schemaVersion: '1.0',
  requestId: receiptNumber,
  timestamp: new Date().toISOString(),
  channelName: 'WEB',
  serviceName: 'API_PURCHASE',
  serviceParams: {
    merchantUid,
    apiUserId,
    apiKey,
    paymentMethod: 'EVCPLUS',
    payerInfo: {
      accountNo: formatSomaliNumber(phoneNumber),
    },
    transactionInfo: {
      referenceId: receiptNumber,
      invoiceId: receiptNumber,
      amount: amount.toString(),
      currency: 'USD',
      description,
    },
  },
});

export const storeEvcPayment = (
  transactionId: string,
  amount: number,
  phoneNumber: string,
  receiptNumber: string,
  userId: string,
  propertyId?: string,
) =>
  db.insert(payment).values({
    transactionId,
    amount: amount.toString(),
    phoneNumber: formatSomaliNumber(phoneNumber),
    paymentStatus: 'PENDING',
    transactionDate: new Date(),
    receiptNumber,
    paymentMethod: 'EVC',
    userId,
    propertyId: propertyId ?? null,
  });

export const updateEvcPaymentStatus = (transactionId: string, status: 'COMPLETED' | 'FAILED') =>
  db
    .update(payment)
    .set({
      paymentStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(payment.transactionId, transactionId));

export const initiateEvcPaymentFlow = async (
  phoneNumber: string,
  amount: number,
  userId: string,
  description: string,
  propertyId?: string,
) => {
  const { merchantUid, apiUserId, apiKey } = validateEvcConfig();
  const receiptNumber = generateReceiptNumber();

  const payload = createEvcPayload(
    phoneNumber,
    amount,
    receiptNumber,
    description,
    merchantUid,
    apiUserId,
    apiKey,
  );

  const response = await initiateEvcPayment(payload);
  const responseData = response as {
    responseCode: string;
    responseMsg?: string;
    params: { transactionId: string };
  };

  if (responseData.responseCode !== '2001') {
    logError(responseData.responseMsg ?? 'Failed to initiate EVC payment');
    throw new Error(responseData.responseMsg ?? 'Failed to initiate EVC payment');
  }

  await storeEvcPayment(
    responseData.params.transactionId,
    amount,
    phoneNumber,
    receiptNumber,
    userId,
    propertyId,
  );

  return {
    success: true,
    data: response,
    receiptNumber,
  };
};

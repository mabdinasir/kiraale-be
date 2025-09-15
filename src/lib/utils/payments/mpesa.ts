/* eslint-disable @typescript-eslint/naming-convention */
import db, { payment } from '@db';
import { formatKenyanNumber, generateReceiptNumber, getMpesaTimestamp, logError } from '@lib';
import { getMpesaAccessToken, initiateStkPush } from '@services';
import { eq } from 'drizzle-orm';

export const validateMpesaConfig = () => {
  const businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!businessShortCode || !passkey) {
    logError('Missing M-Pesa configuration');
    throw new Error('Missing M-Pesa configuration');
  }

  return { businessShortCode, passkey };
};

export const createMpesaPayload = (
  phoneNumber: string,
  amount: number,
  businessShortCode: string,
  passkey: string,
  callbackUrl: string,
  accountReference: string,
  description: string,
) => {
  const formattedPhone = formatKenyanNumber(phoneNumber);
  const timestamp = getMpesaTimestamp();
  const password = Buffer.from(businessShortCode + passkey + timestamp).toString('base64');

  return {
    BusinessShortCode: businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: businessShortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: description,
  };
};

export const storeMpesaPayment = (
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
    phoneNumber: formatKenyanNumber(phoneNumber),
    paymentStatus: 'PENDING',
    transactionDate: new Date(),
    receiptNumber,
    paymentMethod: 'MPESA',
    userId,
    propertyId: propertyId ?? null,
  });

export const updateMpesaPaymentStatus = (transactionId: string, status: 'COMPLETED' | 'FAILED') =>
  db
    .update(payment)
    .set({
      paymentStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(payment.transactionId, transactionId));

export const initiateMpesaPayment = async (
  phoneNumber: string,
  amount: number,
  userId: string,
  callbackUrl: string,
  accountReference: string,
  description: string,
  propertyId?: string,
) => {
  const { businessShortCode, passkey } = validateMpesaConfig();
  const receiptNumber = generateReceiptNumber();

  const payload = createMpesaPayload(
    phoneNumber,
    amount,
    businessShortCode,
    passkey,
    callbackUrl,
    accountReference,
    description,
  );

  const accessToken = await getMpesaAccessToken();
  const response = await initiateStkPush(payload, accessToken);

  const { CheckoutRequestID } = response as { CheckoutRequestID: string };

  await storeMpesaPayment(
    CheckoutRequestID,
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

/* eslint-disable @typescript-eslint/naming-convention */
import { logError } from '@lib';
import type { MpesaTokenResponse, StkPushPayload } from '@models';
import axios from 'axios';

export const getMpesaAccessToken = async (): Promise<string> => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    logError('M-Pesa credentials not configured');
    throw new Error('M-Pesa credentials not configured');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await axios.get<MpesaTokenResponse>(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    },
  );

  return response.data.access_token;
};

export const initiateStkPush = async (
  payload: StkPushPayload,
  accessToken: string,
): Promise<unknown> => {
  const response = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};

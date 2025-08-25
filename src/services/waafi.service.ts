/* eslint-disable @typescript-eslint/naming-convention */
import { logError } from '@lib/utils';
import type { WaafiPayload } from '@models/index';
import axios from 'axios';

export const initiateEvcPayment = async (payload: WaafiPayload): Promise<unknown> => {
  if (!process.env.WAAFI_API_ENDPOINT) {
    logError('WAAFI API endpoint not configured');
    throw new Error('WAAFI API endpoint not configured');
  }
  const response = await axios.post(process.env.WAAFI_API_ENDPOINT ?? '', payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

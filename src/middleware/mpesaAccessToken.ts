import { sendErrorResponse } from '@lib';
import { getMpesaAccessToken } from '@services';
import type { NextFunction, Request, Response } from 'express';

export type RequestExtended = Request & { mpesaToken?: string };

export const mpesaAccessToken = async (req: RequestExtended, res: Response, next: NextFunction) => {
  try {
    const token = await getMpesaAccessToken();
    req.mpesaToken = token;
    next();
  } catch (error) {
    sendErrorResponse(
      res,
      500,
      `Failed to generate M-Pesa access token: ${(error as Error).message}`,
    );
  }
};

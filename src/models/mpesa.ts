/* eslint-disable @typescript-eslint/naming-convention */
export interface MpesaTokenResponse {
  access_token: string;
  expires_in: string;
}

export interface StkPushPayload {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

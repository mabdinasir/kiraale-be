export interface WaafiPayload {
  schemaVersion: string;
  requestId: string;
  timestamp: string;
  channelName: string;
  serviceName: string;
  serviceParams: {
    merchantUid: string;
    apiUserId: string;
    apiKey: string;
    paymentMethod: string;
    payerInfo: {
      accountNo: string;
    };
    transactionInfo: {
      referenceId: string;
      invoiceId: string;
      amount: string;
      currency: string;
      description: string;
    };
  };
}

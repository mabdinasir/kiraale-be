export const generateReceiptNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `KIR${timestamp.slice(-6)}${random}`;
};
// KIR123456ABCDE

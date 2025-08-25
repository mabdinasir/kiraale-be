/**
 * Date utility functions
 */

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}; // 2025-08-25

export const getMpesaTimestamp = (): string =>
  new Date()
    .toISOString()
    .replace(/[-T:.Z]/gu, '')
    .slice(0, 14);
// 20250825161237

export const formatBillingPeriod = (start: Date, end: Date): string => {
  const [startStr, endStr] = [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
  return `${startStr}/${endStr}`;
}; // 2025-08-25/2025-09-25

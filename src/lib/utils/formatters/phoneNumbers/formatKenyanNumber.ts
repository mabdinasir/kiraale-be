export const formatKenyanNumber = (phone: string): string => {
  const sanitizedPhone = phone.replace(/\s+/gu, '');

  if (/^07\d{8}$/u.test(sanitizedPhone)) {
    return `254${sanitizedPhone.slice(1)}`;
  }
  if (/^\+2547\d{8}$/u.test(sanitizedPhone)) {
    return sanitizedPhone.replace('+', '');
  }
  if (/^2547\d{8}$/u.test(sanitizedPhone)) {
    return sanitizedPhone;
  }
  return sanitizedPhone;
};

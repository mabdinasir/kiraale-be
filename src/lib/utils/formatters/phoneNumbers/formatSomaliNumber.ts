export const formatSomaliNumber = (phone: string): string => {
  const sanitizedPhone = phone.replace(/\s+/gu, '');

  if (/^06\d{8}$/u.test(sanitizedPhone)) {
    return `252${sanitizedPhone.slice(1)}`;
  }
  if (/^\+2526\d{8}$/u.test(sanitizedPhone)) {
    return sanitizedPhone.replace('+', '');
  }
  if (/^2526\d{8}$/u.test(sanitizedPhone)) {
    return sanitizedPhone;
  }
  return sanitizedPhone;
};

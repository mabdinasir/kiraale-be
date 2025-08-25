export const validateSomaliNumber = (phone: string): boolean => {
  const somaliRegex = /^(?:\+?252|0)(?:6[0-9]|7[0-9])\d{7}$/u;
  const sanitizedPhone = phone.replace(/\s+/gu, '');
  return somaliRegex.test(sanitizedPhone);
};

export const validateKenyanNumber = (phone: string): boolean => {
  const kenyanRegex = /^(?:\+?254|0)(?:7[0-9])\d{7}$/u;
  const sanitizedPhone = phone.replace(/\s+/gu, '');
  return kenyanRegex.test(sanitizedPhone);
};

export const validatePhoneNumber = (phone: string): boolean =>
  validateSomaliNumber(phone) || validateKenyanNumber(phone);

// import DOMPurify from 'isomorphic-dompurify';

// /**
//  * Sanitize HTML input to prevent XSS attacks
//  * @param input The input string to sanitize
//  * @returns Sanitized string
//  */
// export const sanitizeHtml = (input: string): string =>
//   DOMPurify.sanitize(input, {
//     ALLOWED_TAGS: [], // No HTML tags allowed
//     ALLOWED_ATTR: [], // No attributes allowed
//     ALLOW_DATA_ATTR: false,
//     ALLOW_UNKNOWN_PROTOCOLS: false,
//   });
// npm i isomorphic-dompurify
// /**
//  * Sanitize and trim text input
//  * @param input The input string to sanitize
//  * @returns Sanitized and trimmed string
//  */
// export const sanitizeText = (input: string): string => sanitizeHtml(input.trim());

// /**
//  * Sanitize numeric input to prevent injection
//  * @param input The input to sanitize
//  * @returns Sanitized number or null if invalid
//  */
// export const sanitizeNumber = (input: unknown): number | null => {
//   if (typeof input === 'number') {
//     return Number.isFinite(input) ? input : null;
//   }

//   if (typeof input === 'string') {
//     const num = Number.parseFloat(input);
//     return Number.isFinite(num) ? num : null;
//   }

//   return null;
// };

// /**
//  * Validate and sanitize phone numbers
//  * @param input The phone number to sanitize
//  * @returns Sanitized phone number
//  */
// export const sanitizePhoneNumber = (input: string): string =>
//   // Remove all non-numeric characters except + at the beginning
//   input.replace(/(?!^\+)[^\d]/gu, '').trim();

// /**
//  * Sanitize file paths to prevent directory traversal
//  * @param input The file path to sanitize
//  * @returns Sanitized file path
//  */
// export const sanitizeFilePath = (input: string): string =>
//   // Remove directory traversal attempts and normalize
//   input
//     .replace(/\.\./gu, '') // Remove ..
//     .replace(/[<>:"|?*]/gu, '') // Remove invalid file characters
//     .replace(/^\/+/u, '') // Remove leading slashes
//     .trim();

/* eslint-disable no-console */
import type { ErrorResponse, SuccessResponse } from '@models/apiResponse';
import type { Response } from 'express';

export const sanitizeError = (error: unknown): string => {
  // In production, return generic messages for most errors
  if (process.env.NODE_ENV === 'production') {
    return 'An internal error occurred. Please try again later.';
  }

  // In development, allow more detailed error messages for debugging
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
};

export const sendErrorResponse = (
  response: Response,
  statusCode: number,
  message: string,
  errors?: { field: string; message: string }[],
): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    message,
  };

  if (errors) {
    errorResponse.errors = errors;
  }

  response.status(statusCode).json(errorResponse);
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const sendSuccessResponse = <T>(
  response: Response,
  statusCode: number,
  message: string,
  data: T,
): void => {
  const successResponse: SuccessResponse<T> = {
    success: true,
    message,
    data,
  };

  response.status(statusCode).json(successResponse);
};

export const logError = (error: unknown, context?: string): void => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}] ` : '';

  if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr}ERROR: ${error.message} ${error.stack}`);
  } else {
    console.error(`${timestamp} ${contextStr}ERROR: ${String(error)}`);
  }
};

export const handleDatabaseError = (error: unknown, response: Response): void => {
  logError(error, 'DATABASE');
  sendErrorResponse(response, 500, 'A database error occurred. Please try again later.');
};

export const handleValidationError = (error: unknown, response: Response): void => {
  console.error('Full Validation Error:', JSON.stringify(error, null, 2));

  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as {
      issues: { path: (string | number)[]; message: string; code: string; keys?: string[] }[];
    };
    const errors = zodError.issues.map((err) => {
      const field = err.path.length > 0 ? err.path.join('.') : 'request body';
      let friendlyMessage = err.message;

      // Make error messages more user-friendly
      if (err.code === 'unrecognized_keys') {
        // Extract field names from keys array or message
        const unrecognizedKeys = err.keys ?? [];
        const keysList =
          unrecognizedKeys.length > 0
            ? unrecognizedKeys.join(', ')
            : (/"(?<fieldName>[^"]+)"/u.exec(err.message)?.groups?.fieldName ?? 'unknown field');
        friendlyMessage = `Field(s) not allowed: ${keysList}`;
      } else if (err.code === 'invalid_type') {
        friendlyMessage = `Expected different data type for '${field}': ${err.message}`;
      } else if (err.code === 'too_small') {
        friendlyMessage = `Field '${field}' is too short: ${err.message}`;
      } else if (err.code === 'too_big') {
        friendlyMessage = `Field '${field}' is too long: ${err.message}`;
      } else if (err.code === 'invalid_string') {
        friendlyMessage = `Invalid format for '${field}': ${err.message}`;
      }

      return {
        field,
        message: friendlyMessage,
      };
    });

    const fieldNames = errors
      .map((err) => (err.field === 'request body' ? err.message.split(':')[0] : err.field))
      .join(', ');
    const mainMessage = `Validation error in: ${fieldNames}`;

    sendErrorResponse(response, 400, mainMessage, errors);
  } else {
    sendErrorResponse(response, 400, 'Invalid request data');
  }
};

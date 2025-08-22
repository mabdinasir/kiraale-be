import type { Response } from 'express';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

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

export const logError = (error: unknown, context?: string): void => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}] ` : '';

  if (error instanceof Error) {
    throw new Error(`${timestamp} ${contextStr}ERROR: ${error.message} ${error.stack}`);
  } else {
    throw new Error(`${timestamp} ${contextStr}ERROR: ${String(error)}`);
  }
};

export const handleDatabaseError = (error: unknown, response: Response): void => {
  logError(error, 'DATABASE');
  sendErrorResponse(response, 500, 'A database error occurred. Please try again later.');
};

export const handleValidationError = (error: unknown, response: Response): void => {
  logError(error, 'VALIDATION');

  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: { path: (string | number)[]; message: string }[] };
    const errors = zodError.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    sendErrorResponse(response, 400, 'Validation failed', errors);
  } else {
    sendErrorResponse(response, 400, 'Invalid request data');
  }
};

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

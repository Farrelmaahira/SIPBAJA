/**
 * Standard API Contract Types for SIPBAJA RESTful API
 */

export interface ApiMessageResponse {
  message: string;
}

export interface ApiSuccessResponse<T = unknown> {
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  exception?: string;
  file?: string;
  line?: number;
  trace?: unknown[];
}

/**
 * Type guard to check if an error response is a Laravel 422 Validation Error
 */
export function isValidationError(errorData: unknown): errorData is ValidationErrorResponse {
  return (
    typeof errorData === 'object' &&
    errorData !== null &&
    'errors' in errorData &&
    typeof (errorData as ValidationErrorResponse).errors === 'object'
  );
}


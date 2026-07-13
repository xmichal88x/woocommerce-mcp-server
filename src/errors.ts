import { ZodError } from 'zod';

export interface SafeError {
  code: string;
  message: string;
  actionable: boolean;
}

const HTTP_ERROR_MAP: Record<number, string> = {
  400: 'Invalid request. Check the parameters and try again.',
  401: 'Authentication failed. Check WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET.',
  403: 'Access denied. Your API credentials lack permission for this action.',
  404: 'Resource not found. The requested item does not exist.',
  429: 'Too many requests. Please wait and try again.',
  500: 'WooCommerce server error. The store might be experiencing issues.',
  503: 'Service unavailable. The store might be in maintenance mode.',
};

export function safeError(error: unknown): SafeError {
  if (error instanceof ZodError) {
    return {
      code: 'VALIDATION_ERROR',
      message: `Validation failed: ${error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      actionable: true,
    };
  }

  if (error instanceof Error) {
    const response =
      'response' in error && typeof (error as Record<string, unknown>).response === 'object'
        ? ((error as Record<string, unknown>).response as { status?: number })
        : undefined;
    const status = response?.status;

    if (status && HTTP_ERROR_MAP[status]) {
      return {
        code: `HTTP_${status}`,
        message: HTTP_ERROR_MAP[status],
        actionable: status >= 400 && status < 500,
      };
    }

    // Catch-all dla nieznanych statusów HTTP
    if (status && status >= 400) {
      return {
        code: `HTTP_${status}`,
        message: `HTTP error ${status}`,
        actionable: status < 500,
      };
    }

    // Network errors (no response)
    const errno = (error as { code?: string }).code;
    if (!response) {
      if (errno === 'ENOTFOUND' || errno === 'ECONNREFUSED') {
        return {
          code: 'NETWORK_ERROR',
          message:
            'Cannot connect to the WooCommerce store. Check the URL and network connectivity.',
          actionable: true,
        };
      }
      if (errno === 'ECONNABORTED') {
        return {
          code: 'TIMEOUT',
          message: 'Request timed out. The store might be slow or unreachable.',
          actionable: true,
        };
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred.',
      actionable: false,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    actionable: false,
  };
}

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
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number }; message?: string };
    const status = axiosError.response?.status;

    if (status && HTTP_ERROR_MAP[status]) {
      return {
        code: `HTTP_${status}`,
        message: HTTP_ERROR_MAP[status],
        actionable: status >= 400 && status < 500,
      };
    }

    // Network errors (no response)
    if (!axiosError.response) {
      const msg = axiosError.message || '';
      if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Cannot connect to the WooCommerce store. Check the URL and network connectivity.',
          actionable: true,
        };
      }
      if (msg.includes('ECONNABORTED')) {
        return {
          code: 'TIMEOUT',
          message: 'Request timed out. The store might be slow or unreachable.',
          actionable: true,
        };
      }
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    actionable: false,
  };
}

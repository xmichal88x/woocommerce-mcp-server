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

const WC_ERROR_MAP: Record<string, SafeError> = {
  'product-sku-already-exists': {
    code: 'SKU_CONFLICT',
    message: 'This SKU is already assigned to another product. Provide a unique SKU.',
    actionable: true,
  },
  woocommerce_rest_product_invalid_id: {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Product with the specified ID does not exist.',
    actionable: true,
  },
  woocommerce_rest_cannot_change_product_type: {
    code: 'TYPE_IMMUTABLE',
    message: 'Product type cannot be changed after creation.',
    actionable: false,
  },
  woocommerce_rest_invalid_field: {
    code: 'INVALID_FIELD',
    message: 'One or more product fields contain invalid values.',
    actionable: true,
  },
  woocommerce_rest_product_invalid_category_id: {
    code: 'INVALID_CATEGORY',
    message: 'One or more category IDs do not exist.',
    actionable: true,
  },
  woocommerce_rest_product_invalid_tag_id: {
    code: 'INVALID_TAG',
    message: 'One or more tag IDs do not exist.',
    actionable: true,
  },
};

export class SmtpNotConfiguredError extends Error {
  constructor() {
    super('Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS.');
    this.name = 'SmtpNotConfiguredError';
  }
}

export class ReadOnlyError extends Error {
  constructor() {
    super('Server is in read-only mode. This operation is not allowed.');
    this.name = 'ReadOnlyError';
  }
}

export function safeError(error: unknown): SafeError {
  if (error instanceof ZodError) {
    return {
      code: 'VALIDATION_ERROR',
      message: `Validation failed: ${error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      actionable: true,
    };
  }

  if (error instanceof ReadOnlyError) {
    return { code: 'READ_ONLY', message: error.message, actionable: false };
  }

  if (error instanceof SmtpNotConfiguredError) {
    return { code: 'SMTP_NOT_CONFIGURED', message: error.message, actionable: true };
  }

  if (error instanceof Error) {
    const response =
      'response' in error &&
      (error as Record<string, unknown>).response !== null &&
      typeof (error as Record<string, unknown>).response === 'object'
        ? ((error as Record<string, unknown>).response as { status?: number })
        : undefined;
    const status = response?.status;

    // Próba ekstrakcji WooCommerce error code z response.data
    if (response !== undefined) {
      const errorData = (error as unknown as Record<string, unknown>).response as
        { data?: { code?: unknown } } | undefined;
      if (
        errorData?.data !== null &&
        errorData?.data !== undefined &&
        typeof errorData.data === 'object' &&
        typeof errorData.data.code === 'string'
      ) {
        const wcCode = errorData.data.code;
        if (WC_ERROR_MAP[wcCode]) {
          return { ...WC_ERROR_MAP[wcCode] };
        }
        return {
          code: `WC_${wcCode}`,
          message: `WooCommerce error: ${wcCode}`,
          actionable: status !== undefined && status < 500,
        };
      }
    }

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
    if (!response) {
      const errno = (error as { code?: string }).code;
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

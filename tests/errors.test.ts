import { describe, it, expect } from 'vitest';
import { safeError } from '../src/errors.js';

function makeError(message: string, status?: number, code?: string): Error {
  const error = new Error(message);
  if (status !== undefined) {
    (error as Record<string, unknown>).response = { status };
  }
  if (code !== undefined) {
    (error as NodeJS.ErrnoException).code = code;
  }
  return error;
}

describe('safeError', () => {
  it('returns mapped message for HTTP 401', () => {
    const result = safeError(makeError('Unauthorized', 401));
    expect(result.code).toBe('HTTP_401');
    expect(result.message).toContain('Authentication failed');
    expect(result.actionable).toBe(true);
  });

  it('returns mapped message for HTTP 403', () => {
    const result = safeError(makeError('Forbidden', 403));
    expect(result.code).toBe('HTTP_403');
    expect(result.message).toContain('Access denied');
    expect(result.actionable).toBe(true);
  });

  it('returns mapped message for HTTP 404', () => {
    const result = safeError(makeError('Not Found', 404));
    expect(result.code).toBe('HTTP_404');
    expect(result.message).toContain('Resource not found');
    expect(result.actionable).toBe(true);
  });

  it('returns mapped message for HTTP 429', () => {
    const result = safeError(makeError('Too Many Requests', 429));
    expect(result.code).toBe('HTTP_429');
    expect(result.message).toContain('Too many requests');
    expect(result.actionable).toBe(true);
  });

  it('returns mapped message for HTTP 500', () => {
    const result = safeError(makeError('Server Error', 500));
    expect(result.code).toBe('HTTP_500');
    expect(result.message).toContain('WooCommerce server error');
    expect(result.actionable).toBe(false);
  });

  it('returns mapped message for HTTP 503', () => {
    const result = safeError(makeError('Service Unavailable', 503));
    expect(result.code).toBe('HTTP_503');
    expect(result.message).toContain('Service unavailable');
    expect(result.actionable).toBe(false);
  });

  it('returns NETWORK_ERROR for ENOTFOUND', () => {
    const result = safeError(makeError('getaddrinfo ENOTFOUND store.com', undefined, 'ENOTFOUND'));
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).toContain('Cannot connect');
    expect(result.actionable).toBe(true);
  });

  it('returns NETWORK_ERROR for ECONNREFUSED', () => {
    const result = safeError(
      makeError('connect ECONNREFUSED store.com', undefined, 'ECONNREFUSED'),
    );
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.actionable).toBe(true);
  });

  it('returns TIMEOUT for ECONNABORTED in message', () => {
    const result = safeError(makeError('timeout ECONNABORTED', undefined, 'ECONNABORTED'));
    expect(result.code).toBe('TIMEOUT');
    expect(result.message).toContain('timed out');
    expect(result.actionable).toBe(true);
  });

  it('returns UNKNOWN_ERROR for generic Error', () => {
    const result = safeError(new Error('Something unexpected happened'));
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('Something unexpected happened');
    expect(result.actionable).toBe(false);
  });

  it('returns UNKNOWN_ERROR for non-Error input', () => {
    const result = safeError('string error');
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('An unexpected error occurred. Please try again.');
    expect(result.actionable).toBe(false);
  });

  it('NEVER leaks response.data in the message', () => {
    const error = makeError('Request failed', 500);
    (error as Record<string, unknown>).response = {
      status: 500,
      data: { message: 'secret internal error details' },
    };
    const result = safeError(error);
    expect(result.message).not.toContain('secret internal error');
    expect(result.message).toBe(
      'WooCommerce server error. The store might be experiencing issues.',
    );
  });
});

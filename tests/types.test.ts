import { describe, it, expect } from 'vitest';
import { extractPagination } from '../src/types.js';

describe('extractPagination', () => {
  it('parses X-WP-Total and X-WP-TotalPages from headers', () => {
    const result = extractPagination({
      'x-wp-total': '42',
      'x-wp-totalpages': '5',
    });
    expect(result.total).toBe(42);
    expect(result.totalPages).toBe(5);
  });

  it('returns 0 when headers are missing', () => {
    const result = extractPagination({});
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it('handles string array headers by taking the first value', () => {
    const result = extractPagination({
      'x-wp-total': ['10', '20'],
      'x-wp-totalpages': ['2'],
    });
    expect(result.total).toBe(10);
    expect(result.totalPages).toBe(2);
  });
});

import { z } from 'zod';
import { safeError, ReadOnlyError } from './errors.js';
import { getClient, isReadOnly } from './client.js';
import { extractPagination } from './types.js';

export function validateArgs<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  args: unknown,
): z.infer<z.ZodObject<T>> {
  const result = schema.safeParse(args);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

export function assertWriteAccess(): void {
  if (isReadOnly()) throw new ReadOnlyError();
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
): Promise<T | { content: { type: 'text'; text: string }[]; isError: true }> {
  try {
    return await fn();
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
      isError: true,
    };
  }
}

export function makeListHandler<T extends z.ZodRawShape>(
  endpoint: string,
  schema: z.ZodObject<T>,
  dataKey: string,
): (args: Record<string, unknown>) => Promise<{
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}> {
  return async (args: Record<string, unknown>) =>
    withErrorHandling(async () => {
      const v = validateArgs(schema, args);
      const client = getClient();
      const params = Object.fromEntries(Object.entries(v).filter(([_, val]) => val !== undefined));
      const { data, headers } = await client.get(endpoint, params);
      const { total, totalPages } = extractPagination(headers);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ [dataKey]: data, total, totalPages }, null, 2),
          },
        ],
      };
    });
}

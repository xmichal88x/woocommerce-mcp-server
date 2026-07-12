import { getConfig } from './config.js';

export function withRetry<T extends object>(instance: T): T {
  const config = getConfig();
  if (config.retryCount <= 0) return instance;

  return new Proxy(instance, {
    get(target, prop) {
      const original = target[prop as keyof T];
      if (typeof original !== 'function') return original;

      return async (...args: unknown[]) => {
        let lastError: unknown;
        for (let attempt = 0; attempt <= config.retryCount; attempt++) {
          try {
            return await Reflect.apply(original, target, args);
          } catch (error) {
            const status =
              (error as { response?: { status?: number } })?.response?.status ??
              (error as { status?: number })?.status;
            if (status !== undefined && status >= 400 && status < 500) {
              throw error;
            }
            lastError = error;
            if (attempt < config.retryCount) {
              await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500));
            }
          }
        }
        throw lastError;
      };
    },
  });
}

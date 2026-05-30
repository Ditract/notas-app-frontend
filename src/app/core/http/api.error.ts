export interface ApiError {
  message: string;
  validationErrors?: Record<string, string | string[]>;
}

export function parseApiError(error: unknown): ApiError {
  if (!error || typeof error !== 'object') {
    return { message: 'Error desconocido' };
  }

  const err = error as Record<string, unknown>;

  if ('message' in err && typeof err['message'] === 'string') {
    return {
      message: err['message'] as string,
      validationErrors: err['validationErrors'] as
        | Record<string, string | string[]>
        | undefined,
    };
  }

  if ('error' in err && err['error'] && typeof err['error'] === 'object') {
    const inner = err['error'] as Record<string, unknown>;
    return {
      message: (inner['message'] as string) || 'Error desconocido',
      validationErrors: inner['validationErrors'] as
        | Record<string, string | string[]>
        | undefined,
    };
  }

  return { message: 'Error desconocido' };
}
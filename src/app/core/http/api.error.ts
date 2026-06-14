export interface ApiError {
  message: string;
  status?: number;
  validationErrors?: Record<string, string | string[]>;
}

export const NETWORK_ERROR_MESSAGE =
  'No se pudo conectar con el servidor. Intenta de nuevo.';

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

export function toApiErrorFromHttp(status: number, body: unknown): ApiError {
  if (status === 0) {
    return { message: NETWORK_ERROR_MESSAGE, status: 0 };
  }

  return { ...parseApiError(body), status };
}

export async function parseFetchApiError(response: Response): Promise<ApiError> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return toApiErrorFromHttp(response.status, body);
}

import { describe, it, expect } from 'vitest';
import {
  NETWORK_ERROR_MESSAGE,
  parseApiError,
  toApiErrorFromHttp,
} from './api.error';

describe('parseApiError', () => {
  it('should parse error object with message', () => {
    const result = parseApiError({ message: 'Error de prueba' });
    expect(result.message).toBe('Error de prueba');
  });

  it('should parse error with validationErrors', () => {
    const result = parseApiError({
      message: 'Validation failed',
      validationErrors: { email: 'Email inválido' },
    });
    expect(result.message).toBe('Validation failed');
    expect(result.validationErrors).toEqual({ email: 'Email inválido' });
  });

  it('should return default message for null', () => {
    expect(parseApiError(null).message).toBe('Error desconocido');
  });

  it('should return default message for undefined', () => {
    expect(parseApiError(undefined).message).toBe('Error desconocido');
  });

  it('should return default message for non-object', () => {
    expect(parseApiError('string error').message).toBe('Error desconocido');
  });
});

describe('toApiErrorFromHttp', () => {
  it('should map backend login error with status 401', () => {
    const result = toApiErrorFromHttp(401, {
      status: 401,
      error: 'Unauthorized',
      message: 'Credenciales inválidos',
      path: '/api/auth/signin',
    });

    expect(result.status).toBe(401);
    expect(result.message).toBe('Credenciales inválidos');
  });

  it('should map unverified account error with status 401', () => {
    const result = toApiErrorFromHttp(401, {
      message: 'Cuenta no verificada. Por favor, verifica tu correo electrónico.',
    });

    expect(result.status).toBe(401);
    expect(result.message.toLowerCase()).toContain('verificad');
  });

  it('should preserve validationErrors with status 400', () => {
    const result = toApiErrorFromHttp(400, {
      message: 'Validation failed',
      validationErrors: { password: 'La contraseña debe tener entre 8 y 64 caracteres' },
    });

    expect(result.status).toBe(400);
    expect(result.validationErrors).toEqual({
      password: 'La contraseña debe tener entre 8 y 64 caracteres',
    });
  });

  it('should return network message for status 0', () => {
    const result = toApiErrorFromHttp(0, null);

    expect(result.status).toBe(0);
    expect(result.message).toBe(NETWORK_ERROR_MESSAGE);
  });
});

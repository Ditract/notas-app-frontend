import { describe, it, expect } from 'vitest';
import { parseApiError } from './api.error';

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
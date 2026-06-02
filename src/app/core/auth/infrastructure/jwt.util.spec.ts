import { describe, it, expect } from 'vitest';
import { decodeJwt } from './jwt.util';

describe('decodeJwt', () => {
  it('should decode a valid JWT token', () => {
    const payload = { sub: 'test@example.com', roles: ['USER'] };
    const encoded = btoa(JSON.stringify(payload));
    const token = `header.${encoded}.signature`;
    const result = decodeJwt(token);
    expect(result).not.toBeNull();
    expect(result!.sub).toBe('test@example.com');
    expect(result!.roles).toEqual(['USER']);
  });

  it('should return null for invalid token', () => {
    expect(decodeJwt('invalid')).toBeNull();
    expect(decodeJwt('')).toBeNull();
  });
});
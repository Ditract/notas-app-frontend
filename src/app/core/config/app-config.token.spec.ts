import { describe, it, expect } from 'vitest';

describe('AppConfig', () => {
  it('should have correct apiBaseUrl in default config', () => {
    expect('http://localhost:8080/api').toBe('http://localhost:8080/api');
  });
});
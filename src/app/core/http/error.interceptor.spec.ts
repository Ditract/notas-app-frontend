import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom, throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { TokenStorage } from '../auth/infrastructure/token.storage';
import { NETWORK_ERROR_MESSAGE } from './api.error';

describe('errorInterceptor', () => {
  let tokenStorage: { clearToken: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let injector: Injector;

  beforeEach(() => {
    tokenStorage = { clearToken: vi.fn() };
    router = { navigate: vi.fn() };
    injector = Injector.create({
      providers: [
        { provide: TokenStorage, useValue: tokenStorage },
        { provide: Router, useValue: router },
      ],
    });
  });

  function runInterceptor(url: string, handler: HttpHandlerFn) {
    const req = new HttpRequest('POST', url, {});
    return runInInjectionContext(injector, () => errorInterceptor(req, handler));
  }

  it('should propagate backend message and status on auth login failure', async () => {
    const handler: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'Credenciales inválidos' } }));

    await expect(lastValueFrom(runInterceptor('/api/auth/signin', handler))).rejects.toMatchObject({
      message: 'Credenciales inválidos',
      status: 401,
    });

    expect(tokenStorage.clearToken).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login on 401 for protected routes', async () => {
    const handler: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'Unauthorized' } }));

    await expect(lastValueFrom(runInterceptor('/api/notas', handler))).rejects.toMatchObject({
      message: 'Unauthorized',
      status: 401,
    });

    expect(tokenStorage.clearToken).toHaveBeenCalledOnce();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should map status 0 to network error message', async () => {
    const handler: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse({ status: 0, error: null }));

    await expect(lastValueFrom(runInterceptor('/api/notas', handler))).rejects.toMatchObject({
      message: NETWORK_ERROR_MESSAGE,
      status: 0,
    });
  });
});

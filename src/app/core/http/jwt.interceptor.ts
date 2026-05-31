import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorage } from '../auth/infrastructure/token.storage';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorage);
  const token = tokenStorage.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
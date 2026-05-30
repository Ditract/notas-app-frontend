import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorage } from '../auth/infrastructure/token.storage';
import { parseApiError } from './api.error';
import { throwError, catchError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorage);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        tokenStorage.clearToken();
        router.navigate(['/login']);
      }

      return throwError(() => parseApiError(error.error));
    }),
  );
};
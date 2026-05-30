import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthFacade } from '../application/auth.facade';

export const guestGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  if (!authFacade.isAuthenticated()) {
    return true;
  }

  router.navigate(['/app/notes']);
  return false;
};
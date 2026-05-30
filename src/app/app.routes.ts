import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/guest-shell/guest-shell.component').then(
        (m) => m.GuestShellComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/landing/landing-page.component').then(
            (m) => m.LandingPageComponent,
          ),
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/presentation/login/login-page.component').then(
            (m) => m.LoginPageComponent,
          ),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/presentation/register/register-page.component').then(
            (m) => m.RegisterPageComponent,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/presentation/forgot-password/forgot-password-page.component').then(
            (m) => m.ForgotPasswordPageComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/presentation/reset-password/reset-password-page.component').then(
            (m) => m.ResetPasswordPageComponent,
          ),
      },
      {
        path: 'verify',
        loadComponent: () =>
          import('./features/auth/presentation/verify/verify-page.component').then(
            (m) => m.VerifyPageComponent,
          ),
      },
    ],
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./layout/app-shell/app-shell.component').then(
        (m) => m.AppShellComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'notes',
        loadComponent: () =>
          import(
            './features/notes/presentation/notes-page/notes-page.component'
          ).then((m) => m.NotesPageComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import(
            './features/profile/presentation/profile-page/profile-page.component'
          ).then((m) => m.ProfilePageComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
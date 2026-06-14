import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRepository } from '../domain/auth.repository';
import { AuthFacade } from '../../../core/auth/application/auth.facade';
import { ToastService } from '../../../shared/ui/toast.service';
import { SignInCredentials, SignUpCredentials, ResetPasswordData } from '../domain/auth.model';
import { HttpErrorResponse } from '@angular/common/http';

export type AuthPageState = 'idle' | 'loading' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class AuthFlowFacade {
  private readonly authRepo = inject(AuthRepository);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loginState = signal<AuthPageState>('idle');
  readonly registerState = signal<AuthPageState>('idle');
  readonly forgotPasswordState = signal<AuthPageState>('idle');
  readonly resetPasswordState = signal<AuthPageState>('idle');
  readonly verifyState = signal<AuthPageState>('idle');
  readonly resendState = signal<AuthPageState>('idle');

  readonly loginError = signal<string | null>(null);
  readonly registerError = signal<string | null>(null);
  readonly registerValidationErrors = signal<Record<string, string | string[]> | null>(null);
  readonly forgotPasswordError = signal<string | null>(null);
  readonly resetPasswordError = signal<string | null>(null);
  readonly resetPasswordValidationErrors = signal<Record<string, string | string[]> | null>(null);
  readonly verifyError = signal<string | null>(null);
  readonly resendError = signal<string | null>(null);

  readonly isTokenInvalid = signal(false);
  readonly isAlreadyVerified = signal(false);
  readonly isNotVerified = signal(false);
  readonly forgotPasswordEmail = signal('');

  signIn(credentials: SignInCredentials): void {
    this.loginState.set('loading');
    this.loginError.set(null);
    this.isNotVerified.set(false);

    this.authRepo.signIn(credentials).subscribe({
      next: (response) => {
        if (response.token) {
          this.authFacade.setSession(response.token);
          this.loginState.set('success');
          this.router.navigate(['/app/notes']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loginState.set('error');

        if (err.status === 401 && err.error?.message?.toLowerCase().includes('verificad')) {
          this.isNotVerified.set(true);
          this.loginError.set('Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico.');
        } else if (err.error?.validationErrors) {
          this.registerValidationErrors.set(err.error.validationErrors);
          this.loginError.set(err.error.message || 'Error al iniciar sesión');
        } else {
          this.loginError.set(err.error?.message || 'Error al iniciar sesión');
        }
      },
    });
  }

  signUp(credentials: SignUpCredentials): void {
    this.registerState.set('loading');
    this.registerError.set(null);
    this.registerValidationErrors.set(null);

    this.authRepo.signUp(credentials).subscribe({
      next: (response) => {
        this.registerState.set('success');
        this.toast.success('Registro exitoso', response.mensaje || 'Por favor, verifica tu correo electrónico.');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.registerState.set('error');
        if (err.error?.validationErrors) {
          this.registerValidationErrors.set(err.error.validationErrors);
        }
        this.registerError.set(err.error?.message || 'Error al registrarse');
      },
    });
  }

  forgotPassword(email: string): void {
    this.forgotPasswordState.set('loading');
    this.forgotPasswordError.set(null);
    this.forgotPasswordEmail.set(email);

    this.authRepo.forgotPassword(email).subscribe({
      next: () => {
        this.forgotPasswordState.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.forgotPasswordState.set('error');
        this.forgotPasswordError.set(err.error?.message || 'Error al enviar el email');
      },
    });
  }

  resetPassword(data: ResetPasswordData): void {
    this.resetPasswordState.set('loading');
    this.resetPasswordError.set(null);
    this.resetPasswordValidationErrors.set(null);

    this.authRepo.resetPassword(data).subscribe({
      next: () => {
        this.resetPasswordState.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.resetPasswordState.set('error');
        if (err.status === 404) {
          this.isTokenInvalid.set(true);
          return;
        }
        if (err.error?.validationErrors) {
          this.resetPasswordValidationErrors.set(err.error.validationErrors);
        }
        this.resetPasswordError.set(err.error?.message || 'Error al restablecer la contraseña');
      },
    });
  }

  verifyAccount(token: string): void {
    this.verifyState.set('loading');
    this.verifyError.set(null);

    this.authRepo.verifyAccount(token).subscribe({
      next: () => {
        this.verifyState.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.verifyState.set('error');
        if (err.status === 404) {
          this.isTokenInvalid.set(true);
          this.verifyError.set('El token de verificación es inválido o ha expirado.');
        } else if (err.status === 400) {
          this.isAlreadyVerified.set(true);
          this.verifyError.set(err.error?.message || 'La cuenta ya ha sido verificada.');
        } else {
          this.verifyError.set(err.error?.message || 'Error al verificar la cuenta.');
        }
      },
    });
  }

  resendVerification(email: string): void {
    this.resendState.set('loading');
    this.resendError.set(null);

    this.authRepo.resendVerification(email).subscribe({
      next: (response) => {
        this.resendState.set('success');
        this.toast.success('Email enviado', response.mensaje || 'Email de verificación enviado. Revisa tu correo.');
      },
      error: (err: HttpErrorResponse) => {
        this.resendState.set('error');
        if (err.status === 404) {
          this.resendError.set('No se encontró una cuenta con ese email.');
        } else {
          this.resendError.set(err.error?.message || 'Error al reenviar el email.');
        }
      },
    });
  }

  resetLoginState(): void {
    this.loginState.set('idle');
    this.loginError.set(null);
    this.isNotVerified.set(false);
  }

  resetRegisterState(): void {
    this.registerState.set('idle');
    this.registerError.set(null);
    this.registerValidationErrors.set(null);
  }

  resetForgotPasswordState(): void {
    this.forgotPasswordState.set('idle');
    this.forgotPasswordError.set(null);
  }
}
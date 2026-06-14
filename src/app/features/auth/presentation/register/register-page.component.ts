import { Component, inject, computed, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { AuthLayoutComponent } from '../../../../shared/ui/auth-layout.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      @if (facade.registerState() !== 'success') {
        <div class="auth-animate-in">
          <div class="auth-header">
            <div class="auth-header__icon" aria-hidden="true">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <h1 class="auth-heading">Crear cuenta</h1>
            <p class="auth-subtitle">Regístrate para empezar a tomar notas</p>
          </div>

          @if (facade.registerError()) {
            <div class="auth-alert auth-alert--error">
              <p class="auth-alert__title">Error en el registro</p>
              <p class="auth-alert__message">{{ facade.registerError() }}</p>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="auth-field">
              <label class="auth-label" for="register-email">Email</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="register-email"
                  type="email"
                  formControlName="email"
                  placeholder="tu@email.com"
                  autocomplete="email"
                  class="input-field w-full auth-input--with-icon"
                  [class.error]="emailFieldError()"
                />
              </div>
              @if (emailFieldError()) {
                <p class="auth-field-error">
                  <span class="auth-field-error__icon" aria-hidden="true">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </span>
                  <span>{{ emailFieldError() }}</span>
                </p>
              }
            </div>

            <div class="auth-field">
              <label class="auth-label" for="register-password">Contraseña</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="register-password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Mínimo 8 caracteres"
                  autocomplete="new-password"
                  class="input-field w-full auth-input--with-icon auth-input--with-toggle"
                  [class.error]="passwordFieldError()"
                />
                <button
                  type="button"
                  class="auth-input-toggle"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  @if (showPassword()) {
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  } @else {
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  }
                </button>
              </div>
              @if (passwordFieldError()) {
                <p class="auth-field-error">
                  <span class="auth-field-error__icon" aria-hidden="true">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </span>
                  <span>{{ passwordFieldError() }}</span>
                </p>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg auth-form__submit w-full"
              [disabled]="isSubmitting()"
            >
              {{ isSubmitting() ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </form>

          <div class="auth-divider">
            <p class="auth-footer-link">
              ¿Ya tienes cuenta?
              <a routerLink="/login">Inicia sesión</a>
            </p>
          </div>
        </div>
      } @else {
        <div class="auth-success">
          <div class="auth-header__icon" aria-hidden="true">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 class="auth-success__title">¡Registro exitoso!</h2>
          <p class="auth-success__text">
            Tu cuenta ha sido creada correctamente. Revisa tu bandeja de entrada para verificar tu email.
          </p>
          <p class="auth-success__hint">
            Serás redirigido al inicio de sesión en unos momentos...
          </p>
          <a routerLink="/login" class="btn btn-primary btn-lg w-full no-underline">Ir a iniciar sesión</a>
        </div>
      }
    </app-auth-layout>
  `,
})
export class RegisterPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(AuthFlowFacade);
  protected readonly isSubmitting = computed(() => this.facade.registerState() === 'loading');
  protected readonly showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.facade.resetRegisterState();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  emailFieldError(): string | null {
    return this.getFieldError('email') ?? this.emailError();
  }

  passwordFieldError(): string | null {
    return this.getFieldError('password') ?? this.passwordError();
  }

  emailError(): string | null {
    const ctrl = this.form.get('email');
    if (!ctrl?.touched || !ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'El email es obligatorio';
    return null;
  }

  passwordError(): string | null {
    const ctrl = this.form.get('password');
    if (!ctrl?.touched || !ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'La contraseña es obligatoria';
    return null;
  }

  getFieldError(field: string): string | null {
    const validationErrors = this.facade.registerValidationErrors();
    if (validationErrors && validationErrors[field]) {
      const errors = validationErrors[field];
      return Array.isArray(errors) ? errors[0] : errors;
    }
    return null;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.facade.signUp({
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
    });
  }
}

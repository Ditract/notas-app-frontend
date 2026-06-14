import { Component, inject, computed, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { createEmailValidator } from '../../../../shared/validators/validators';
import { AuthLayoutComponent } from '../../../../shared/ui/auth-layout.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      <div class="auth-animate-in">
        <div class="auth-header">
          <div class="auth-header__icon" aria-hidden="true">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <h1 class="auth-heading">Iniciar sesión</h1>
          <p class="auth-subtitle">Accede a tu cuenta de NotasAPP</p>
        </div>

        @if (facade.isNotVerified()) {
          <div class="auth-alert auth-alert--warning">
            <p class="auth-alert__title">Verifica tu email</p>
            <p class="auth-alert__message">{{ facade.loginError() }}</p>
          </div>
        }

        @if (facade.loginError() && !facade.isNotVerified()) {
          <div class="auth-alert auth-alert--error">
            <p class="auth-alert__title">Error de autenticación</p>
            <p class="auth-alert__message">{{ facade.loginError() }}</p>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="auth-field">
            <label class="auth-label" for="login-email">Email</label>
            <div class="auth-input-wrap">
              <span class="auth-input-icon" aria-hidden="true">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                id="login-email"
                type="email"
                formControlName="email"
                placeholder="tu@email.com"
                autocomplete="email"
                class="input-field w-full auth-input--with-icon"
                [class.error]="emailError()"
              />
            </div>
            @if (emailError()) {
              <p class="auth-field-error">
                <span class="auth-field-error__icon" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </span>
                <span>{{ emailError() }}</span>
              </p>
            }
          </div>

          <div class="auth-field">
            <div class="auth-label-row">
              <label class="auth-label" for="login-password">Contraseña</label>
              <a routerLink="/forgot-password" class="auth-label-link">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="auth-input-wrap">
              <span class="auth-input-icon" aria-hidden="true">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="login-password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="Tu contraseña"
                autocomplete="current-password"
                class="input-field w-full auth-input--with-icon auth-input--with-toggle"
                [class.error]="passwordError()"
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
            @if (passwordError()) {
              <p class="auth-field-error">
                <span class="auth-field-error__icon" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </span>
                <span>{{ passwordError() }}</span>
              </p>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg auth-form__submit w-full"
            [disabled]="isSubmitting()"
          >
            {{ isSubmitting() ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>

        <div class="auth-divider">
          <p class="auth-footer-link">
            ¿No tienes cuenta?
            <a routerLink="/register">Regístrate gratis</a>
          </p>
        </div>
      </div>
    </app-auth-layout>
  `,
})
export class LoginPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly emailValidatorFn = createEmailValidator();
  protected readonly facade = inject(AuthFlowFacade);
  protected readonly isSubmitting = computed(() => this.facade.loginState() === 'loading');
  protected readonly showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, this.emailValidatorFn]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.facade.resetLoginState();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  emailError(): string | null {
    const ctrl = this.form.get('email');
    if (!ctrl?.touched || !ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'El email es obligatorio';
    if (ctrl.hasError('email')) return 'Ingresa un email válido';
    return null;
  }

  passwordError(): string | null {
    const ctrl = this.form.get('password');
    if (!ctrl?.touched || !ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'La contraseña es obligatoria';
    return null;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.facade.signIn({
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
    });
  }
}

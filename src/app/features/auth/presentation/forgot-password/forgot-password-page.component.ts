import { Component, inject, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { createEmailValidator } from '../../../../shared/validators/validators';
import { AuthLayoutComponent } from '../../../../shared/ui/auth-layout.component';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      @if (facade.forgotPasswordState() !== 'success') {
        <div class="auth-animate-in">
          <div class="auth-header">
            <div class="auth-header__icon" aria-hidden="true">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="7.5" cy="15.5" r="5.5"/>
                <path d="m21 2-9.6 9.6"/>
                <path d="m15.5 7.5 3 3L22 7l-3-3"/>
              </svg>
            </div>
            <h1 class="auth-heading">Recuperar contraseña</h1>
            <p class="auth-subtitle">
              Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
            </p>
          </div>

          @if (facade.forgotPasswordError()) {
            <div class="auth-alert auth-alert--error">
              <p class="auth-alert__title">Error al enviar email</p>
              <p class="auth-alert__message">{{ facade.forgotPasswordError() }}</p>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="auth-field">
              <label class="auth-label" for="forgot-email">Email</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="forgot-email"
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

            <button
              type="submit"
              class="btn btn-primary btn-lg auth-form__submit w-full"
              [disabled]="isSubmitting()"
            >
              {{ isSubmitting() ? 'Enviando email...' : 'Enviar instrucciones' }}
            </button>
          </form>

          <div class="auth-divider">
            <p class="auth-footer-link">
              ¿Recordaste tu contraseña?
              <a routerLink="/login">Volver al inicio de sesión</a>
            </p>
          </div>
        </div>
      } @else {
        <div class="auth-success">
          <div class="auth-header__icon" aria-hidden="true">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 class="auth-success__title">Email enviado</h2>
          <p class="auth-success__text">
            Si existe una cuenta asociada a <strong>{{ facade.forgotPasswordEmail() }}</strong>, recibirás instrucciones para restablecer tu contraseña.
          </p>
          <div class="auth-success__actions">
            <button
              type="button"
              class="btn btn-primary btn-lg w-full"
              [disabled]="isSubmitting()"
              (click)="onResendEmail()"
            >
              {{ isSubmitting() ? 'Reenviando...' : 'Reenviar email' }}
            </button>
            <a routerLink="/login" class="btn btn-secondary btn-lg w-full no-underline">Volver al inicio de sesión</a>
          </div>
        </div>
      }
    </app-auth-layout>
  `,
})
export class ForgotPasswordPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly emailValidatorFn = createEmailValidator();
  protected readonly facade = inject(AuthFlowFacade);
  protected readonly isSubmitting = computed(() => this.facade.forgotPasswordState() === 'loading');

  form = this.fb.group({
    email: ['', [Validators.required, this.emailValidatorFn]],
  });

  ngOnInit(): void {
    this.facade.resetForgotPasswordState();
  }

  emailError(): string | null {
    const ctrl = this.form.get('email');
    if (!ctrl?.touched || !ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'El email es obligatorio';
    if (ctrl.hasError('email')) return 'Ingresa un email válido';
    return null;
  }

  onResendEmail(): void {
    const val = this.form.get('email')?.value;
    if (val) {
      this.facade.forgotPassword(val);
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.facade.forgotPassword(this.form.value.email ?? '');
  }
}

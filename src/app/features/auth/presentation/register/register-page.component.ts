import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { APP_CONFIG, AppConfig } from '../../../../core/config/app-config.token';

@Component({
  selector: 'app-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)]">
          @if (facade.registerState() !== 'success') {
            <h1 class="mb-2 text-2xl font-bold text-[var(--color-on-surface)]">Crear cuenta</h1>
            <p class="mb-6 text-sm text-[var(--color-on-surface-muted)]">Regístrate para empezar a tomar notas</p>

            @if (facade.registerError()) {
              <div class="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger-light)] border border-[var(--color-danger)] p-3 text-sm text-[var(--color-danger)]">
                {{ facade.registerError() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label for="email" class="mb-1.5 block text-sm font-medium text-[var(--color-on-surface)]">
                  Email <span class="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="tu@email.com"
                  class="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                  [class.border-[var(--color-danger)]]="isFieldInvalid('email')"
                  autocomplete="email"
                />
                @if (isFieldInvalid('email')) {
                  <p class="mt-1 text-sm text-[var(--color-danger)]">Ingresa un email válido</p>
                }
                @if (getFieldError('email')) {
                  <p class="mt-1 text-sm text-[var(--color-danger)]">{{ getFieldError('email') }}</p>
                }
              </div>

              <div>
                <label for="password" class="mb-1.5 block text-sm font-medium text-[var(--color-on-surface)]">
                  Contraseña <span class="text-[var(--color-danger)]">*</span>
                </label>
                <div class="relative">
                  <input
                    id="password"
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Mínimo 8 caracteres"
                    class="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 pr-10 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                    [class.border-[var(--color-danger)]]="isFieldInvalid('password')"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    (click)="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]"
                    [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  >
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>

                @if (form.get('password')?.value) {
                  <div class="mt-2 space-y-1">
                    <div class="flex items-center gap-1.5 text-xs"
                      [class.text-[var(--color-success)]]="hasMinLength"
                      [class.text-[var(--color-danger)]]="!hasMinLength">
                      {{ hasMinLength ? '✓' : '✗' }} Mínimo 8 caracteres
                    </div>
                    <div class="flex items-center gap-1.5 text-xs"
                      [class.text-[var(--color-success)]]="hasUppercase"
                      [class.text-[var(--color-danger)]]="!hasUppercase">
                      {{ hasUppercase ? '✓' : '✗' }} Una mayúscula
                    </div>
                    <div class="flex items-center gap-1.5 text-xs"
                      [class.text-[var(--color-success)]]="hasLowercase"
                      [class.text-[var(--color-danger)]]="!hasLowercase">
                      {{ hasLowercase ? '✓' : '✗' }} Una minúscula
                    </div>
                    <div class="flex items-center gap-1.5 text-xs"
                      [class.text-[var(--color-success)]]="hasNumber"
                      [class.text-[var(--color-danger)]]="!hasNumber">
                      {{ hasNumber ? '✓' : '✗' }} Un número
                    </div>
                    <div class="flex items-center gap-1.5 text-xs"
                      [class.text-[var(--color-success)]]="hasSpecial"
                      [class.text-[var(--color-danger)]]="!hasSpecial">
                      {{ hasSpecial ? '✓' : '✗' }} Un carácter especial
                    </div>
                  </div>
                }

                @if (getFieldError('password')) {
                  <p class="mt-1 text-sm text-[var(--color-danger)]">{{ getFieldError('password') }}</p>
                }
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  [disabled]="facade.registerState() === 'loading'"
                  class="w-full rounded-[var(--radius-md)] bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  @if (facade.registerState() === 'loading') {
                    <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
                    Registrando...
                  } @else {
                    Crear cuenta
                  }
                </button>
              </div>
            </form>

            <div class="mt-6 text-center text-sm text-[var(--color-on-surface-muted)]">
              ¿Ya tienes cuenta? <a routerLink="/login" class="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium transition-colors">Inicia sesión</a>
            </div>
          } @else {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">✅</div>
              <h2 class="mb-2 text-xl font-bold text-[var(--color-on-surface)]">¡Registro exitoso!</h2>
              <p class="text-sm text-[var(--color-on-surface-muted)]">
                Por favor, verifica tu correo electrónico para activar tu cuenta.
              </p>
              <p class="mt-3 text-sm text-[var(--color-on-surface-muted)]">
                Serás redirigido al inicio de sesión...
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(AuthFlowFacade);
  protected readonly config = inject(APP_CONFIG);
  protected showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  get passwordValue(): string {
    return this.form.get('password')?.value ?? '';
  }

  get hasMinLength(): boolean {
    return this.passwordValue.length >= this.config.validation.passwordMinLength;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.passwordValue);
  }

  get hasSpecial(): boolean {
    return /[@#$%^&+=!?.*_-]/.test(this.passwordValue);
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.facade.signUp({
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
    });
  }
}
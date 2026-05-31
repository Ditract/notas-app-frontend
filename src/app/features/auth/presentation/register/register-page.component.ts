import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
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
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <div class="card p-8">
          @if (facade.registerState() !== 'success') {
            <div class="mb-8 text-center">
              <div class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl" style="background: var(--accent-light); color: var(--accent)">
                <span class="text-xl font-bold">N</span>
              </div>
              <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Crear cuenta</h1>
              <p class="mt-1 text-sm" style="color: var(--text-muted)">Regístrate para empezar a tomar notas</p>
            </div>

            @if (facade.registerError()) {
              <div class="mb-4 rounded-lg p-3 text-sm" style="background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger)">
                {{ facade.registerError() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
              <div>
                <label for="reg-email" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
                  Email <span style="color: var(--danger)">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  formControlName="email"
                  placeholder="tu@email.com"
                  class="input-field"
                  [class.error]="isFieldInvalid('email')"
                  autocomplete="email"
                />
                @if (isFieldInvalid('email')) {
                  <p class="mt-1 text-sm" style="color: var(--danger)">Ingresa un email válido</p>
                }
                @if (getFieldError('email')) {
                  <p class="mt-1 text-sm" style="color: var(--danger)">{{ getFieldError('email') }}</p>
                }
              </div>

              <div>
                <label for="reg-password" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
                  Contraseña <span style="color: var(--danger)">*</span>
                </label>
                <div class="relative">
                  <input
                    id="reg-password"
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Mínimo 8 caracteres"
                    class="input-field pr-10"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    (click)="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2"
                    style="color: var(--text-muted); background: none; border: none; cursor: pointer; padding: 4px"
                    [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  >
                    @if (showPassword) {
                      <svg style="width:18px;height:18px" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    } @else {
                      <svg style="width:18px;height:18px" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>

                @if (form.get('password')?.value) {
                  <div class="mt-2 space-y-1">
                    <div class="flex items-center gap-1.5 text-xs" [style.color]="hasMinLength ? 'var(--success)' : 'var(--danger)'">
                      {{ hasMinLength ? '✓' : '✗' }} Mínimo 8 caracteres
                    </div>
                    <div class="flex items-center gap-1.5 text-xs" [style.color]="hasUppercase ? 'var(--success)' : 'var(--danger)'">
                      {{ hasUppercase ? '✓' : '✗' }} Una mayúscula
                    </div>
                    <div class="flex items-center gap-1.5 text-xs" [style.color]="hasLowercase ? 'var(--success)' : 'var(--danger)'">
                      {{ hasLowercase ? '✓' : '✗' }} Una minúscula
                    </div>
                    <div class="flex items-center gap-1.5 text-xs" [style.color]="hasNumber ? 'var(--success)' : 'var(--danger)'">
                      {{ hasNumber ? '✓' : '✗' }} Un número
                    </div>
                    <div class="flex items-center gap-1.5 text-xs" [style.color]="hasSpecial ? 'var(--success)' : 'var(--danger)'">
                      {{ hasSpecial ? '✓' : '✗' }} Un carácter especial
                    </div>
                  </div>
                }
                @if (getFieldError('password')) {
                  <p class="mt-1 text-sm" style="color: var(--danger)">{{ getFieldError('password') }}</p>
                }
              </div>

              <button
                type="submit"
                [disabled]="facade.registerState() === 'loading'"
                class="btn btn-primary btn-lg w-full"
              >
                @if (facade.registerState() === 'loading') {
                  <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  Registrando...
                } @else {
                  Crear cuenta
                }
              </button>
            </form>

            <p class="mt-6 text-center text-sm" style="color: var(--text-muted)">
              ¿Ya tienes cuenta?
              <a routerLink="/login" class="font-medium no-underline" style="color: var(--accent)">Inicia sesión</a>
            </p>
          } @else {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">✅</div>
              <h2 class="mb-2 text-xl font-bold" style="color: var(--text-primary)">¡Registro exitoso!</h2>
              <p class="text-sm" style="color: var(--text-muted)">
                Por favor, verifica tu correo electrónico para activar tu cuenta.
              </p>
              <p class="mt-3 text-sm" style="color: var(--text-muted)">
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
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { passwordValidator } from '../../../../shared/validators/validators';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)]">
          @if (facade.isTokenInvalid()) {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">⚠️</div>
              <h2 class="mb-2 text-xl font-bold text-[var(--color-on-surface)]">Enlace inválido</h2>
              <p class="text-sm text-[var(--color-on-surface-muted)]">
                El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.
              </p>
              <div class="mt-6">
                <a routerLink="/forgot-password" class="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium text-sm transition-colors">
                  Solicitar nuevo enlace
                </a>
              </div>
            </div>
          } @else if (facade.resetPasswordState() === 'success') {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">✅</div>
              <h2 class="mb-2 text-xl font-bold text-[var(--color-on-surface)]">Contraseña restablecida</h2>
              <p class="text-sm text-[var(--color-on-surface-muted)]">
                Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión.
              </p>
              <div class="mt-6">
                <a routerLink="/login" class="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium text-sm transition-colors">
                  Ir a iniciar sesión
                </a>
              </div>
            </div>
          } @else {
            <h1 class="mb-2 text-2xl font-bold text-[var(--color-on-surface)]">Nueva contraseña</h1>
            <p class="mb-6 text-sm text-[var(--color-on-surface-muted)]">Establece tu nueva contraseña.</p>

            @if (facade.resetPasswordError()) {
              <div class="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger-light)] border border-[var(--color-danger)] p-3 text-sm text-[var(--color-danger)]">
                {{ facade.resetPasswordError() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label for="password" class="mb-1.5 block text-sm font-medium text-[var(--color-on-surface)]">
                  Nueva contraseña <span class="text-[var(--color-danger)]">*</span>
                </label>
                <div class="relative">
                  <input
                    id="password"
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Mínimo 8 caracteres"
                    class="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 pr-10 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                    [class.border-[var(--color-danger)]]="isPasswordInvalid"
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
                @if (isPasswordInvalid) {
                  <p class="mt-1 text-sm text-[var(--color-danger)]">La contraseña no cumple los requisitos</p>
                }
              </div>

              <div>
                <label for="confirmPassword" class="mb-1.5 block text-sm font-medium text-[var(--color-on-surface)]">
                  Confirmar contraseña <span class="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Repite tu contraseña"
                  class="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                  [class.border-[var(--color-danger)]]="isConfirmInvalid"
                  autocomplete="new-password"
                />
                @if (isConfirmInvalid) {
                  <p class="mt-1 text-sm text-[var(--color-danger)]">Las contraseñas no coinciden</p>
                }
              </div>

              <button
                type="submit"
                [disabled]="facade.resetPasswordState() === 'loading'"
                class="w-full rounded-[var(--radius-md)] bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                @if (facade.resetPasswordState() === 'loading') {
                  <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
                  Restableciendo...
                } @else {
                  Restablecer contraseña
                }
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `,
})
export class ResetPasswordPageComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(AuthFlowFacade);
  protected showPassword = false;
  private token: string | null = null;

  form = this.fb.group({
    password: ['', [Validators.required, passwordValidator]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  constructor() {
    const route = inject(ActivatedRoute);
    route.queryParams.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.facade.isTokenInvalid.set(true);
      }
    });
  }

  private passwordMatchValidator(group: import('@angular/forms').AbstractControl): import('@angular/forms').ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  get isPasswordInvalid(): boolean {
    const ctrl = this.form.get('password');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get isConfirmInvalid(): boolean {
    const ctrl = this.form.get('confirmPassword');
    return !!(ctrl?.invalid && ctrl?.touched) || !!(this.form.errors?.['passwordMismatch'] && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    this.facade.resetPassword({
      token: this.token!,
      nuevaPassword: this.form.value.password ?? '',
    });
  }
}
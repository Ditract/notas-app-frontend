import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { emailValidator } from '../../../../shared/validators/validators';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)]">
          <h1 class="mb-2 text-2xl font-bold text-[var(--color-on-surface)]">Iniciar sesión</h1>
          <p class="mb-6 text-sm text-[var(--color-on-surface-muted)]">Accede a tu cuenta de NotasAPP</p>

          @if (facade.isNotVerified()) {
            <div class="mb-4 rounded-[var(--radius-md)] bg-[var(--color-warning-light)] border border-[var(--color-warning)] p-3 text-sm text-[var(--color-warning)]">
              {{ facade.loginError() }}
            </div>
          }

          @if (facade.loginError() && !facade.isNotVerified()) {
            <div class="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger-light)] border border-[var(--color-danger)] p-3 text-sm text-[var(--color-danger)]">
              {{ facade.loginError() }}
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
                [class.border-[var(--color-danger)]]="emailInvalid"
                autocomplete="email"
              />
              @if (emailInvalid) {
                <p class="mt-1 text-sm text-[var(--color-danger)]">Ingresa un email válido</p>
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
                  placeholder="Tu contraseña"
                  class="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 pr-10 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                  autocomplete="current-password"
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
              @if (passwordInvalid) {
                <p class="mt-1 text-sm text-[var(--color-danger)]">La contraseña es obligatoria</p>
              }
            </div>

            <div class="pt-2">
              <button
                type="submit"
                [disabled]="facade.loginState() === 'loading'"
                class="w-full rounded-[var(--radius-md)] bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                @if (facade.loginState() === 'loading') {
                  <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
                  Iniciando sesión...
                } @else {
                  Iniciar sesión
                }
              </button>
            </div>
          </form>

          <div class="mt-6 space-y-2 text-center text-sm">
            <a routerLink="/forgot-password" class="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
            <p class="text-[var(--color-on-surface-muted)]">
              ¿No tienes cuenta? <a routerLink="/register" class="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium transition-colors">Regístrate</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(AuthFlowFacade);
  protected showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, emailValidator]],
    password: ['', [Validators.required]],
  });

  get emailInvalid(): boolean {
    const ctrl = this.form.get('email');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get passwordInvalid(): boolean {
    const ctrl = this.form.get('password');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.facade.signIn({
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
    });
  }
}
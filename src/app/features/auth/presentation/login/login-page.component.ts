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
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <div class="card p-8">
          <div class="mb-8 text-center">
            <div class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl" style="background: var(--accent-light); color: var(--accent)">
              <span class="text-xl font-bold">N</span>
            </div>
            <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Iniciar sesión</h1>
            <p class="mt-1 text-sm" style="color: var(--text-muted)">Accede a tu cuenta de NotasAPP</p>
          </div>

          @if (facade.isNotVerified()) {
            <div class="mb-4 rounded-lg p-3 text-sm" style="background: var(--warning-light); color: var(--warning); border: 1px solid var(--warning)">
              {{ facade.loginError() }}
            </div>
          }

          @if (facade.loginError() && !facade.isNotVerified()) {
            <div class="mb-4 rounded-lg p-3 text-sm" style="background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger)">
              {{ facade.loginError() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="login-email" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
                Email <span style="color: var(--danger)">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                formControlName="email"
                placeholder="tu@email.com"
                class="input-field"
                [class.error]="emailInvalid"
                autocomplete="email"
              />
              @if (emailInvalid) {
                <p class="mt-1 text-sm" style="color: var(--danger)">Ingresa un email válido</p>
              }
            </div>

            <div>
              <label for="login-password" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
                Contraseña <span style="color: var(--danger)">*</span>
              </label>
              <div class="relative">
                <input
                  id="login-password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Tu contraseña"
                  class="input-field pr-10"
                  [class.error]="passwordInvalid"
                  autocomplete="current-password"
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
              @if (passwordInvalid) {
                <p class="mt-1 text-sm" style="color: var(--danger)">La contraseña es obligatoria</p>
              }
            </div>

            <div class="text-right">
              <a routerLink="/forgot-password" class="text-sm font-medium" style="color: var(--accent)">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              [disabled]="facade.loginState() === 'loading'"
              class="btn btn-primary btn-lg w-full"
            >
              @if (facade.loginState() === 'loading') {
                <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                Iniciando sesión...
              } @else {
                Iniciar sesión
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm" style="color: var(--text-muted)">
            ¿No tienes cuenta?
            <a routerLink="/register" class="font-medium" style="color: var(--accent)">Regístrate</a>
          </p>
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

  protected isLoading = () => this.facade.loginState() === 'loading';

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
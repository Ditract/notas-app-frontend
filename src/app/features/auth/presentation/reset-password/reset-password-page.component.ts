import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { createPasswordValidator } from '../../../../shared/validators/validators';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <div class="card p-8">
          @if (facade.isTokenInvalid()) {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">⚠️</div>
              <h2 class="mb-2 text-xl font-bold" style="color: var(--text-primary)">Enlace inválido</h2>
              <p class="text-sm" style="color: var(--text-muted)">
                El enlace de recuperación es inválido o ha expirado.
              </p>
              <div class="mt-6">
                <a routerLink="/forgot-password" class="btn btn-primary btn-md no-underline">Solicitar nuevo enlace</a>
              </div>
            </div>
          } @else if (facade.resetPasswordState() === 'success') {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">✅</div>
              <h2 class="mb-2 text-xl font-bold" style="color: var(--text-primary)">Contraseña restablecida</h2>
              <p class="text-sm" style="color: var(--text-muted)">
                Tu contraseña ha sido cambiada exitosamente.
              </p>
              <div class="mt-6">
                <a routerLink="/login" class="btn btn-primary btn-md no-underline">Ir a iniciar sesión</a>
              </div>
            </div>
          } @else {
            <div class="mb-8 text-center">
              <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Nueva contraseña</h1>
              <p class="mt-1 text-sm" style="color: var(--text-muted)">Establece tu nueva contraseña.</p>
            </div>

            @if (facade.resetPasswordError()) {
              <div class="mb-4 rounded-lg p-3 text-sm" style="background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger)">
                {{ facade.resetPasswordError() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
              <div>
                <label for="rp-pw" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
                  Nueva contraseña <span style="color: var(--danger)">*</span>
                </label>
                <div class="relative">
                  <input
                    id="rp-pw"
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Mínimo 8 caracteres"
                    class="input-field pr-10"
                    [class.error]="isPasswordInvalid"
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
                @if (isPasswordInvalid) {
                  <p class="mt-1 text-sm" style="color: var(--danger)">La contraseña no cumple los requisitos</p>
                }
              </div>

              <div>
                <label for="rp-confirm" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
                  Confirmar contraseña <span style="color: var(--danger)">*</span>
                </label>
                <input
                  id="rp-confirm"
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Repite tu contraseña"
                  class="input-field"
                  [class.error]="isConfirmInvalid"
                  autocomplete="new-password"
                />
                @if (isConfirmInvalid) {
                  <p class="mt-1 text-sm" style="color: var(--danger)">Las contraseñas no coinciden</p>
                }
              </div>

              <button
                type="submit"
                [disabled]="facade.resetPasswordState() === 'loading'"
                class="btn btn-primary btn-lg w-full"
              >
                @if (facade.resetPasswordState() === 'loading') {
                  <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
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
  private readonly passwordValidatorFn = createPasswordValidator();
  protected readonly facade = inject(AuthFlowFacade);
  protected showPassword = false;
  private token: string | null = null;

  form = this.fb.group({
    password: ['', [Validators.required, this.passwordValidatorFn]],
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
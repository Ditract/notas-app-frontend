import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { emailValidator } from '../../../../shared/validators/validators';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)]">
          @if (facade.forgotPasswordState() !== 'success') {
            <h1 class="mb-2 text-2xl font-bold text-[var(--color-on-surface)]">Recuperar contraseña</h1>
            <p class="mb-6 text-sm text-[var(--color-on-surface-muted)]">Te enviaremos un email con instrucciones para restablecer tu contraseña.</p>

            @if (facade.forgotPasswordError()) {
              <div class="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger-light)] border border-[var(--color-danger)] p-3 text-sm text-[var(--color-danger)]">
                {{ facade.forgotPasswordError() }}
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
                  [class.border-[var(--color-danger)]]="isEmailInvalid"
                  autocomplete="email"
                />
                @if (isEmailInvalid) {
                  <p class="mt-1 text-sm text-[var(--color-danger)]">Ingresa un email válido</p>
                }
              </div>

              <button
                type="submit"
                [disabled]="facade.forgotPasswordState() === 'loading'"
                class="w-full rounded-[var(--radius-md)] bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                @if (facade.forgotPasswordState() === 'loading') {
                  <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
                  Enviando...
                } @else {
                  Enviar email de recuperación
                }
              </button>
            </form>

            <div class="mt-6 text-center text-sm">
              <a routerLink="/login" class="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium transition-colors">
                Volver al inicio de sesión
              </a>
            </div>
          } @else {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">📧</div>
              <h2 class="mb-2 text-xl font-bold text-[var(--color-on-surface)]">Email enviado</h2>
              <p class="text-sm text-[var(--color-on-surface-muted)]">
                Si existe una cuenta asociada a <strong>{{ facade.forgotPasswordEmail() }}</strong>, recibirás un email con instrucciones para restablecer tu contraseña.
              </p>
              <div class="mt-6">
                <a routerLink="/login" class="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium text-sm transition-colors">
                  Volver al inicio de sesión
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordPageComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(AuthFlowFacade);

  form = this.fb.group({
    email: ['', [Validators.required, emailValidator]],
  });

  get isEmailInvalid(): boolean {
    const ctrl = this.form.get('email');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.facade.forgotPassword(this.form.value.email ?? '');
  }
}
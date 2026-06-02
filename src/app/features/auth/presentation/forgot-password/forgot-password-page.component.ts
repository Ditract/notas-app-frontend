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
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <div class="card p-8">
          @if (facade.forgotPasswordState() !== 'success') {
            <div class="mb-8 text-center">
              <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Recuperar contraseña</h1>
              <p class="mt-1 text-sm" style="color: var(--text-muted)">Te enviaremos un email con instrucciones.</p>
            </div>

            @if (facade.forgotPasswordError()) {
              <div class="mb-4 rounded-lg p-3 text-sm" style="background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger)">
                {{ facade.forgotPasswordError() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
              <div>
                <label for="fp-email" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
                  Email <span style="color: var(--danger)">*</span>
                </label>
                <input
                  id="fp-email"
                  type="email"
                  formControlName="email"
                  placeholder="tu@email.com"
                  class="input-field"
                  [class.error]="isEmailInvalid"
                  autocomplete="email"
                />
                @if (isEmailInvalid) {
                  <p class="mt-1 text-sm" style="color: var(--danger)">Ingresa un email válido</p>
                }
              </div>

              <button
                type="submit"
                [disabled]="facade.forgotPasswordState() === 'loading'"
                class="btn btn-primary btn-lg w-full"
              >
                @if (facade.forgotPasswordState() === 'loading') {
                  <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  Enviando...
                } @else {
                  Enviar email de recuperación
                }
              </button>
            </form>

            <p class="mt-6 text-center text-sm" style="color: var(--text-muted)">
              <a routerLink="/login" class="font-medium" style="color: var(--accent)">Volver al inicio de sesión</a>
            </p>
          } @else {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">📧</div>
              <h2 class="mb-2 text-xl font-bold" style="color: var(--text-primary)">Email enviado</h2>
              <p class="text-sm" style="color: var(--text-muted)">
                Si existe una cuenta asociada a <strong>{{ facade.forgotPasswordEmail() }}</strong>, recibirás instrucciones para restablecer tu contraseña.
              </p>
              <div class="mt-6">
                <a routerLink="/login" class="btn btn-primary btn-md no-underline">Ir a iniciar sesión</a>
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

  protected isLoading = () => this.facade.forgotPasswordState() === 'loading';

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
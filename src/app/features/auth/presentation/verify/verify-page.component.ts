import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { emailValidator } from '../../../../shared/validators/validators';

@Component({
  selector: 'app-verify-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)]">

          @if (facade.verifyState() === 'loading') {
            <div class="py-12 text-center">
              <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)]"></div>
              <p class="text-sm text-[var(--color-on-surface-muted)]">Verificando tu cuenta...</p>
            </div>
          }

          @else if (facade.verifyState() === 'success') {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">✅</div>
              <h2 class="mb-2 text-xl font-bold text-[var(--color-on-surface)]">¡Cuenta verificada!</h2>
              <p class="text-sm text-[var(--color-on-surface-muted)]">
                Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.
              </p>
              <div class="mt-6">
                <a routerLink="/login"
                  class="inline-block rounded-[var(--radius-md)] bg-[var(--color-primary-600)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] transition-colors">
                  Ir a iniciar sesión
                </a>
              </div>
            </div>
          }

          @else if (facade.verifyState() === 'error') {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">❌</div>
              <h2 class="mb-2 text-xl font-bold text-[var(--color-on-surface)]">Error de verificación</h2>
              <p class="text-sm text-[var(--color-danger)]">{{ facade.verifyError() }}</p>

              @if (!showResendForm) {
                <div class="mt-6 space-y-3">
                  <button
                    (click)="showResendForm = true"
                    class="block w-full rounded-[var(--radius-md)] bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] transition-colors"
                  >
                    Reenviar email de verificación
                  </button>
                  <a routerLink="/login" class="block text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium transition-colors">
                    Ir a iniciar sesión
                  </a>
                </div>
              }

              @if (showResendForm) {
                <div class="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4 text-left">
                  <h3 class="mb-3 text-sm font-semibold text-[var(--color-on-surface)]">Reenviar verificación</h3>

                  @if (facade.resendState() === 'success') {
                    <p class="text-sm text-[var(--color-success)]">Email de verificación enviado. Revisa tu correo.</p>
                  } @else {
                    <form [formGroup]="resendForm" (ngSubmit)="onResend()" class="space-y-3">
                      @if (facade.resendError()) {
                        <p class="text-sm text-[var(--color-danger)]">{{ facade.resendError() }}</p>
                      }
                      <div>
                        <input
                          type="email"
                          formControlName="email"
                          placeholder="tu@email.com"
                          class="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                        />
                      </div>
                      <div class="flex gap-2">
                        <button
                          type="submit"
                          [disabled]="facade.resendState() === 'loading'"
                          class="flex-1 rounded-[var(--radius-md)] bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] disabled:opacity-50 transition-colors"
                        >
                          @if (facade.resendState() === 'loading') {
                            Enviando...
                          } @else {
                            Enviar
                          }
                        </button>
                        <button
                          type="button"
                          (click)="showResendForm = false"
                          class="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-alt)] transition-colors"
                        >
                          Volver
                        </button>
                      </div>
                    </form>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class VerifyPageComponent implements OnInit {
  protected readonly facade = inject(AuthFlowFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  protected showResendForm = false;

  resendForm = this.fb.group({
    email: ['', [Validators.required, emailValidator]],
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.facade.verifyAccount(token);
      } else {
        this.facade.verifyState.set('error');
        this.facade.verifyError.set('No se encontró el token de verificación.');
      }
    });
  }

  onResend(): void {
    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      return;
    }
    this.facade.resendVerification(this.resendForm.value.email ?? '');
  }
}
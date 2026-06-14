import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { createEmailValidator } from '../../../../shared/validators/validators';

@Component({
  selector: 'app-verify-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <div class="card p-8">
          @if (facade.verifyState() === 'loading') {
            <div class="py-12 text-center">
              <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style="border-color: var(--border-color); border-top-color: var(--accent)"></div>
              <p class="text-sm" style="color: var(--text-muted)">Verificando tu cuenta...</p>
            </div>
          }

          @else if (facade.verifyState() === 'success') {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">✅</div>
              <h2 class="mb-2 text-xl font-bold" style="color: var(--text-primary)">¡Cuenta verificada!</h2>
              <p class="text-sm" style="color: var(--text-muted)">
                Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.
              </p>
              <div class="mt-6">
                <a routerLink="/login" class="btn btn-primary btn-md no-underline">Ir a iniciar sesión</a>
              </div>
            </div>
          }

          @else if (facade.verifyState() === 'error') {
            <div class="py-8 text-center">
              <div class="mb-4 text-5xl">❌</div>
              <h2 class="mb-2 text-xl font-bold" style="color: var(--text-primary)">Error de verificación</h2>
              <p class="text-sm" style="color: var(--danger)">{{ facade.verifyError() }}</p>

              @if (!showResendForm) {
                <div class="mt-6 space-y-3">
                  <button (click)="showResendForm = true" class="btn btn-primary btn-md w-full">Reenviar email de verificación</button>
                  <a routerLink="/login" class="btn btn-secondary btn-md w-full no-underline inline-flex justify-center">Ir a iniciar sesión</a>
                </div>
              }

              @if (showResendForm) {
                <div class="mt-6 card p-4 text-left" style="background: var(--bg-secondary)">
                  <h3 class="mb-3 text-sm font-semibold" style="color: var(--text-primary)">Reenviar verificación</h3>

                  @if (facade.resendState() === 'success') {
                    <p class="text-sm" style="color: var(--success)">Email de verificación enviado. Revisa tu correo.</p>
                  } @else {
                    <form [formGroup]="resendForm" (ngSubmit)="onResend()" class="space-y-3">
                      @if (facade.resendError()) {
                        <p class="text-sm" style="color: var(--danger)">{{ facade.resendError() }}</p>
                      }
                      <div>
                        <input
                          type="email"
                          formControlName="email"
                          placeholder="tu@email.com"
                          class="input-field"
                        />
                      </div>
                      <div class="flex gap-2">
                        <button type="submit" [disabled]="facade.resendState() === 'loading'" class="btn btn-primary btn-sm flex-1">
                          @if (facade.resendState() === 'loading') {
                            Enviando...
                          } @else {
                            Enviar
                          }
                        </button>
                        <button type="button" (click)="showResendForm = false" class="btn btn-secondary btn-sm">Volver</button>
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
  private readonly emailValidatorFn = createEmailValidator();
  protected showResendForm = false;

  resendForm = this.fb.group({
    email: ['', [Validators.required, this.emailValidatorFn]],
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
import { Component, inject, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { createEmailValidator } from '../../../../shared/validators/validators';
import { AuthLayoutComponent } from '../../../../shared/ui/auth-layout.component';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      @if (facade.forgotPasswordState() !== 'success') {
        <div class="animate-fade-in-up">
          <div class="mb-8">
            <h1 class="text-2xl font-bold">Recuperar contraseña</h1>
            <p class="mt-2 text-sm" style="color: var(--text-muted)">
              Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
            </p>
          </div>

          @if (facade.forgotPasswordError()) {
            <div class="mb-5 rounded-lg border p-4 text-sm animate-fade-in" style="background: #fee2e2; border-color: #c47a7a; color: #991b1b">
              <p class="font-medium">Error al enviar email</p>
              <p class="mt-1 text-xs opacity-90">{{ facade.forgotPasswordError() }}</p>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                formControlName="email"
                placeholder="tu@email.com"
                autocomplete="email"
                class="input-field w-full"
                [class.error]="emailError()"
              />
              @if (emailError()) {
                <p class="mt-1 text-xs" style="color: var(--danger)">{{ emailError() }}</p>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full"
              [disabled]="isSubmitting()"
            >
              {{ isSubmitting() ? 'Enviando email...' : 'Enviar instrucciones' }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm" style="color: var(--text-muted)">
            ¿Recordaste tu contraseña?
            <a routerLink="/login">Volver al inicio de sesión</a>
          </p>
        </div>
      } @else {
        <div class="animate-success-scale py-8 text-center">
          <h2 class="mb-3 text-2xl font-bold">Email enviado</h2>
          <p class="mb-6 text-sm" style="color: var(--text-muted)">
            Si existe una cuenta asociada a <strong>{{ facade.forgotPasswordEmail() }}</strong>, recibirás instrucciones para restablecer tu contraseña.
          </p>
          <div class="flex flex-col gap-3">
            <button
              type="button"
              class="btn btn-primary w-full"
              [disabled]="isSubmitting()"
              (click)="onResendEmail()"
            >
              {{ isSubmitting() ? 'Reenviando...' : 'Reenviar email' }}
            </button>
            <a routerLink="/login" class="btn btn-secondary w-full">Volver al inicio de sesión</a>
          </div>
        </div>
      }
    </app-auth-layout>
  `,
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes success-scale {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
    .animate-success-scale { animation: success-scale 0.5s ease-out; }
  `],
})
export class ForgotPasswordPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly emailValidatorFn = createEmailValidator();
  protected readonly facade = inject(AuthFlowFacade);
  protected readonly isSubmitting = computed(() => this.facade.forgotPasswordState() === 'loading');

  form = this.fb.group({
    email: ['', [Validators.required, this.emailValidatorFn]],
  });

  ngOnInit(): void {
    this.facade.resetForgotPasswordState();
  }

  emailError(): string | null {
    const ctrl = this.form.get('email');
    if (!ctrl?.touched || !ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'El email es obligatorio';
    if (ctrl.hasError('email')) return 'Ingresa un email válido';
    return null;
  }

  onResendEmail(): void {
    const val = this.form.get('email')?.value;
    if (val) {
      this.facade.forgotPassword(val);
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.facade.forgotPassword(this.form.value.email ?? '');
  }
}

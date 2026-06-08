import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { AuthLayoutComponent } from '../../../../shared/ui/auth-layout.component';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout
      gradient="linear-gradient(135deg, #f0d9d9 0%, #f5ebe0 100%)"
      title="¿Olvidaste tu contraseña?"
      subtitle="No te preocupes, te ayudaremos a recuperarla"
      [features]="['Recuperación segura', 'Email instantáneo', 'Soporte 24/7']"
    >
      @if (facade.forgotPasswordState() !== 'success') {
        <div class="animate-fade-in-up">
          <div class="mb-8">
            <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl" style="background: linear-gradient(135deg, #f0d9d9 0%, #f5ebe0 100%)">
              <svg class="h-8 w-8" style="color: #c49a8a" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold" style="color: #2d3748">Recuperar contraseña</h1>
            <p class="mt-2 text-sm" style="color: #718096">
              Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
            </p>
          </div>

          @if (facade.forgotPasswordError()) {
            <div class="mb-5 rounded-lg border p-4 text-sm animate-fade-in" style="background: #fee2e2; border-color: #c47a7a; color: #991b1b">
              <div class="flex items-start gap-3">
                <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                </svg>
                <div>
                  <p class="font-medium">Error al enviar email</p>
                  <p class="mt-1 text-xs opacity-90">{{ facade.forgotPasswordError() }}</p>
                </div>
              </div>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium" style="color: #2d3748">
                Email <span style="color: #c47a7a">*</span>
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--text-muted)">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                  </svg>
                </div>
                <input
                  type="email"
                  [value]="email()"
                  (input)="onEmailInput($event)"
                  (blur)="emailTouched.set(true)"
                  placeholder="tu@email.com"
                  autocomplete="email"
                  class="w-full rounded-lg border px-4 py-3 pl-11 text-sm transition-all duration-200 outline-none"
                  [class.border-red-300]="emailError()"
                  [class.bg-red-50]="emailError()"
                  [style.border-color]="!emailError() ? 'var(--border-color)' : ''"
                  [style.background]="!emailError() ? 'var(--bg-secondary)' : ''"
                  [style.color]="'var(--text-primary)'"
                />
              </div>
              @if (emailError()) {
                <p class="mt-1.5 text-xs" style="color: #c47a7a">{{ emailError() }}</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="facade.forgotPasswordState() === 'loading'"
              class="mt-2 w-full rounded-lg px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              style="background: linear-gradient(135deg, #c49a8a 0%, #a67c6c 100%)"
            >
              @if (facade.forgotPasswordState() === 'loading') {
                <span class="flex items-center justify-center gap-2">
                  <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando email...
                </span>
              } @else {
                Enviar instrucciones
              }
            </button>
          </form>

          <div class="mt-8">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t" style="border-color: #e2e8f0"></div>
              </div>
              <div class="relative flex justify-center text-xs">
                <span class="px-3" style="background: var(--bg-primary); color: #718096">o</span>
              </div>
            </div>

            <p class="mt-6 text-center text-sm" style="color: #718096">
              ¿Recordaste tu contraseña?
              <a routerLink="/login" class="ml-1 font-semibold transition-colors hover:underline" style="color: #c49a8a">
                Volver al inicio de sesión
              </a>
            </p>
          </div>
        </div>
      } @else {
        <div class="animate-success-scale py-8 text-center">
          <div class="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full animate-email-bounce" style="background: linear-gradient(135deg, #f0d9d9 0%, #f5ebe0 100%)">
            <svg class="h-10 w-10" style="color: #c49a8a" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
          </div>

          <h2 class="mb-3 text-2xl font-bold" style="color: #2d3748">Email enviado</h2>
          
          <p class="mb-6 text-sm" style="color: #718096">
            Si existe una cuenta asociada a <strong style="color: #2d3748">{{ facade.forgotPasswordEmail() }}</strong>, recibirás instrucciones para restablecer tu contraseña.
          </p>

          <div class="mb-6 rounded-lg p-4" style="background: #f7fafc; border: 1px solid #e2e8f0">
            <div class="flex items-start gap-3">
              <svg class="mt-0.5 h-5 w-5 shrink-0" style="color: #7a9cc4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
              </svg>
              <div class="text-left">
                <p class="text-sm font-medium" style="color: #2d3748">Revisa tu bandeja de entrada</p>
                <p class="mt-1 text-xs" style="color: #718096">
                  Si no recibes el email en unos minutos, revisa tu carpeta de spam o intenta nuevamente.
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <button
              type="button"
              (click)="onResendEmail()"
              [disabled]="facade.forgotPasswordState() === 'loading'"
              class="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              style="background: linear-gradient(135deg, #c49a8a 0%, #a67c6c 100%)"
            >
              @if (facade.forgotPasswordState() === 'loading') {
                <span class="flex items-center justify-center gap-2">
                  <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Reenviando...
                </span>
              } @else {
                Reenviar email
              }
            </button>

            <a
              routerLink="/login"
              class="inline-block w-full rounded-lg border-2 px-6 py-3 text-center text-sm font-semibold transition-all duration-200 hover:shadow-md"
              style="border-color: #c49a8a; color: #c49a8a"
            >
              Volver al inicio de sesión
            </a>
          </div>
        </div>
      }
    </app-auth-layout>
  `,
  styles: [`
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes success-scale {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes email-bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.5s ease-out;
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
    .animate-success-scale {
      animation: success-scale 0.5s ease-out;
    }
    .animate-email-bounce {
      animation: email-bounce 0.6s ease-out 0.3s;
    }
  `],
})
export class ForgotPasswordPageComponent {
  protected readonly facade = inject(AuthFlowFacade);

  protected email = signal('');
  protected emailTouched = signal(false);

  emailError(): string | null {
    if (!this.emailTouched()) return null;
    const val = this.email();
    if (!val) return 'El email es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Ingresa un email válido';
    return null;
  }

  onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
  }

  onResendEmail(): void {
    const val = this.email();
    if (val) {
      this.facade.forgotPassword(val);
    }
  }

  onSubmit(): void {
    this.emailTouched.set(true);

    if (this.emailError()) return;

    this.facade.forgotPassword(this.email());
  }
}

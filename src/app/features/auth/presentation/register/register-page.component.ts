import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { AuthLayoutComponent } from '../../../../shared/ui/auth-layout.component';
import { FormInputComponent } from '../../../../shared/ui/form-input.component';
import { PasswordInputComponent } from '../../../../shared/ui/password-input.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent, FormInputComponent, PasswordInputComponent],
  template: `
    <app-auth-layout
      gradient="linear-gradient(135deg, #d4e7d0 0%, #e8f0e4 100%)"
      title="Comienza tu viaje"
      subtitle="Organiza tus ideas de forma inteligente"
      [features]="['Registro gratuito', 'Sincronización en la nube', 'Interfaz intuitiva']"
    >
      @if (facade.registerState() !== 'success') {
        <div class="animate-fade-in-up">
          <div class="mb-8">
            <h1 class="text-2xl font-bold" style="color: #2d3748">Crear cuenta</h1>
            <p class="mt-1 text-sm" style="color: #718096">Regístrate para empezar a tomar notas</p>
          </div>

          @if (facade.registerError()) {
            <div class="mb-5 rounded-lg border p-4 text-sm animate-fade-in" style="background: #fee2e2; border-color: #c47a7a; color: #991b1b">
              <div class="flex items-start gap-3">
                <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                </svg>
                <div>
                  <p class="font-medium">Error en el registro</p>
                  <p class="mt-1 text-xs opacity-90">{{ facade.registerError() }}</p>
                </div>
              </div>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium" style="color: #2d3748">
                Email <span style="color: #c47a7a">*</span>
              </label>
              <app-form-input
                type="email"
                placeholder="tu@email.com"
                icon="mail"
                autocomplete="email"
                [value]="form.get('email')?.value ?? ''"
                [error]="emailError()"
                (valueChange)="onEmailChange($event)"
                (touched)="onEmailTouched()"
              />
              @if (getFieldError('email')) {
                <p class="mt-1.5 text-xs" style="color: #c47a7a">{{ getFieldError('email') }}</p>
              }
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium" style="color: #2d3748">
                Contraseña <span style="color: #c47a7a">*</span>
              </label>
              <app-password-input
                placeholder="Mínimo 8 caracteres"
                autocomplete="new-password"
                [value]="form.get('password')?.value ?? ''"
                [error]="passwordError()"
                [showStrengthBar]="true"
                [showRequirements]="true"
                (valueChange)="onPasswordChange($event)"
                (touched)="onPasswordTouched()"
              />
              @if (getFieldError('password')) {
                <p class="mt-1.5 text-xs" style="color: #c47a7a">{{ getFieldError('password') }}</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="facade.registerState() === 'loading'"
              class="mt-2 w-full rounded-lg px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              style="background: linear-gradient(135deg, #8faf8a 0%, #6b8f66 100%)"
            >
              @if (facade.registerState() === 'loading') {
                <span class="flex items-center justify-center gap-2">
                  <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              } @else {
                Crear cuenta
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
              ¿Ya tienes cuenta?
              <a routerLink="/login" class="ml-1 font-semibold transition-colors hover:underline" style="color: #7daa7d">
                Inicia sesión
              </a>
            </p>
          </div>
        </div>
      } @else {
        <div class="animate-success-scale py-8 text-center">
          <div class="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full animate-checkmark-bounce" style="background: #d4e7d0">
            <svg class="h-10 w-10" style="color: #7daa7d" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>

          <h2 class="mb-3 text-2xl font-bold" style="color: #2d3748">¡Registro exitoso!</h2>
          
          <p class="mb-2 text-sm" style="color: #718096">
            Tu cuenta ha sido creada correctamente.
          </p>
          
          <div class="mb-6 rounded-lg p-4" style="background: #f7fafc; border: 1px solid #e2e8f0">
            <div class="flex items-start gap-3">
              <svg class="mt-0.5 h-5 w-5 shrink-0" style="color: #7a9cc4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <div class="text-left">
                <p class="text-sm font-medium" style="color: #2d3748">Revisa tu bandeja de entrada</p>
                <p class="mt-1 text-xs" style="color: #718096">
                  Te enviamos un email de verificación. Por favor, verifica tu cuenta para comenzar a usar NotasAPP.
                </p>
              </div>
            </div>
          </div>

          <p class="mb-6 text-xs" style="color: #718096">
            Serás redirigido al inicio de sesión en unos momentos...
          </p>

          <a routerLink="/login" class="inline-block rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl" style="background: linear-gradient(135deg, #8faf8a 0%, #6b8f66 100%)">
            Ir a iniciar sesión
          </a>
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
    @keyframes checkmark-bounce {
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
    .animate-checkmark-bounce {
      animation: checkmark-bounce 0.6s ease-out 0.3s;
    }
  `],
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(AuthFlowFacade);

  private emailTouched = false;
  private passwordTouched = false;

  form = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  emailError(): string | null {
    const ctrl = this.form.get('email');
    if (!this.emailTouched || !ctrl?.invalid) return null;
    if (ctrl.hasError('required')) return 'El email es obligatorio';
    return null;
  }

  passwordError(): string | null {
    const ctrl = this.form.get('password');
    if (!this.passwordTouched || !ctrl?.invalid) return null;
    if (ctrl.hasError('required')) return 'La contraseña es obligatoria';
    return null;
  }

  onEmailChange(value: string): void {
    this.form.get('email')?.setValue(value, { emitEvent: false });
  }

  onEmailTouched(): void {
    this.emailTouched = true;
    this.form.get('email')?.markAsTouched();
  }

  onPasswordChange(value: string): void {
    this.form.get('password')?.setValue(value, { emitEvent: false });
  }

  onPasswordTouched(): void {
    this.passwordTouched = true;
    this.form.get('password')?.markAsTouched();
  }

  getFieldError(field: string): string | null {
    const validationErrors = this.facade.registerValidationErrors();
    if (validationErrors && validationErrors[field]) {
      const errors = validationErrors[field];
      return Array.isArray(errors) ? errors[0] : errors;
    }
    return null;
  }

  onSubmit(): void {
    this.emailTouched = true;
    this.passwordTouched = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.facade.signUp({
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
    });
  }
}

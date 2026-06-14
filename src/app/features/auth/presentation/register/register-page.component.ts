import { Component, inject, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { AuthLayoutComponent } from '../../../../shared/ui/auth-layout.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      @if (facade.registerState() !== 'success') {
        <div class="animate-fade-in-up">
          <div class="mb-8">
            <h1 class="text-2xl font-bold">Crear cuenta</h1>
            <p class="mt-1 text-sm" style="color: var(--text-muted)">Regístrate para empezar a tomar notas</p>
          </div>

          @if (facade.registerError()) {
            <div class="mb-5 rounded-lg border p-4 text-sm animate-fade-in" style="background: #fee2e2; border-color: #c47a7a; color: #991b1b">
              <p class="font-medium">Error en el registro</p>
              <p class="mt-1 text-xs opacity-90">{{ facade.registerError() }}</p>
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
                [class.error]="emailFieldError()"
              />
              @if (emailFieldError()) {
                <p class="mt-1 text-xs" style="color: var(--danger)">{{ emailFieldError() }}</p>
              }
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium">Contraseña</label>
              <input
                type="password"
                formControlName="password"
                placeholder="Mínimo 8 caracteres"
                autocomplete="new-password"
                class="input-field w-full"
                [class.error]="passwordFieldError()"
              />
              @if (passwordFieldError()) {
                <p class="mt-1 text-xs" style="color: var(--danger)">{{ passwordFieldError() }}</p>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full"
              [disabled]="isSubmitting()"
            >
              {{ isSubmitting() ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm" style="color: var(--text-muted)">
            ¿Ya tienes cuenta?
            <a routerLink="/login">Inicia sesión</a>
          </p>
        </div>
      } @else {
        <div class="animate-success-scale py-8 text-center">
          <h2 class="mb-3 text-2xl font-bold">¡Registro exitoso!</h2>
          <p class="mb-4 text-sm" style="color: var(--text-muted)">
            Tu cuenta ha sido creada correctamente. Revisa tu bandeja de entrada para verificar tu email.
          </p>
          <p class="mb-6 text-xs" style="color: var(--text-muted)">
            Serás redirigido al inicio de sesión en unos momentos...
          </p>
          <a routerLink="/login" class="btn btn-primary">Ir a iniciar sesión</a>
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
export class RegisterPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(AuthFlowFacade);
  protected readonly isSubmitting = computed(() => this.facade.registerState() === 'loading');

  form = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.facade.resetRegisterState();
  }

  emailFieldError(): string | null {
    return this.getFieldError('email') ?? this.emailError();
  }

  passwordFieldError(): string | null {
    return this.getFieldError('password') ?? this.passwordError();
  }

  emailError(): string | null {
    const ctrl = this.form.get('email');
    if (!ctrl?.touched || !ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'El email es obligatorio';
    return null;
  }

  passwordError(): string | null {
    const ctrl = this.form.get('password');
    if (!ctrl?.touched || !ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'La contraseña es obligatoria';
    return null;
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
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.facade.signUp({
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
    });
  }
}

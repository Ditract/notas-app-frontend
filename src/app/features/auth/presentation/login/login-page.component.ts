import { Component, inject, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { createEmailValidator } from '../../../../shared/validators/validators';
import { AuthLayoutComponent } from '../../../../shared/ui/auth-layout.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      <div class="animate-fade-in-up">
        <div class="mb-8">
          <h1 class="text-2xl font-bold">Iniciar sesión</h1>
          <p class="mt-1 text-sm" style="color: var(--text-muted)">Accede a tu cuenta de NotasAPP</p>
        </div>

        @if (facade.isNotVerified()) {
          <div class="mb-5 rounded-lg border p-4 text-sm animate-fade-in" style="background: #fef3c7; border-color: #f59e0b; color: #92400e">
            <p class="font-medium">Verifica tu email</p>
            <p class="mt-1 text-xs opacity-90">{{ facade.loginError() }}</p>
          </div>
        }

        @if (facade.loginError() && !facade.isNotVerified()) {
          <div class="mb-5 rounded-lg border p-4 text-sm animate-fade-in" style="background: #fee2e2; border-color: #c47a7a; color: #991b1b">
            <p class="font-medium">Error de autenticación</p>
            <p class="mt-1 text-xs opacity-90">{{ facade.loginError() }}</p>
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

          <div>
            <div class="mb-1 flex items-center justify-between">
              <label class="text-sm font-medium">Contraseña</label>
              <a routerLink="/forgot-password" class="text-xs">¿Olvidaste tu contraseña?</a>
            </div>
            <input
              type="password"
              formControlName="password"
              placeholder="Tu contraseña"
              autocomplete="current-password"
              class="input-field w-full"
              [class.error]="passwordError()"
            />
            @if (passwordError()) {
              <p class="mt-1 text-xs" style="color: var(--danger)">{{ passwordError() }}</p>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            [disabled]="isSubmitting()"
          >
            {{ isSubmitting() ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm" style="color: var(--text-muted)">
          ¿No tienes cuenta?
          <a routerLink="/register">Regístrate gratis</a>
        </p>
      </div>
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
    .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
  `],
})
export class LoginPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly emailValidatorFn = createEmailValidator();
  protected readonly facade = inject(AuthFlowFacade);
  protected readonly isSubmitting = computed(() => this.facade.loginState() === 'loading');

  form = this.fb.group({
    email: ['', [Validators.required, this.emailValidatorFn]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.facade.resetLoginState();
  }

  emailError(): string | null {
    const ctrl = this.form.get('email');
    if (!ctrl?.touched || !ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'El email es obligatorio';
    if (ctrl.hasError('email')) return 'Ingresa un email válido';
    return null;
  }

  passwordError(): string | null {
    const ctrl = this.form.get('password');
    if (!ctrl?.touched || !ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'La contraseña es obligatoria';
    return null;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.facade.signIn({
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
    });
  }
}

import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthFlowFacade } from '../../application/auth-flow.facade';
import { AuthLayoutComponent } from '../../../../shared/ui/auth-layout.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout
      gradient="linear-gradient(135deg, #c9d6ff 0%, #e2e2e2 100%)"
      title="Bienvenido de vuelta"
      subtitle="Organiza tus ideas, potencia tu productividad"
      [features]="['Notas inteligentes', 'Búsqueda avanzada', 'Acceso desde cualquier lugar']"
    >
      <div class="animate-fade-in-up">
        <div class="mb-8">
          <h1 class="text-2xl font-bold" style="color: #2d3748">Iniciar sesión</h1>
          <p class="mt-1 text-sm" style="color: #718096">Accede a tu cuenta de NotasAPP</p>
        </div>

        @if (facade.isNotVerified()) {
          <div class="mb-5 rounded-lg border p-4 text-sm animate-fade-in" style="background: #fef3c7; border-color: #f59e0b; color: #92400e">
            <div class="flex items-start gap-3">
              <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              <div>
                <p class="font-medium">Verifica tu email</p>
                <p class="mt-1 text-xs opacity-90">{{ facade.loginError() }}</p>
              </div>
            </div>
          </div>
        }

        @if (facade.loginError() && !facade.isNotVerified()) {
          <div class="mb-5 rounded-lg border p-4 text-sm animate-fade-in" style="background: #fee2e2; border-color: #c47a7a; color: #991b1b">
            <div class="flex items-start gap-3">
              <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              <div>
                <p class="font-medium">Error de autenticación</p>
                <p class="mt-1 text-xs opacity-90">{{ facade.loginError() }}</p>
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

          <div>
            <div class="mb-1.5 flex items-center justify-between">
              <label class="block text-sm font-medium" style="color: #2d3748">
                Contraseña <span style="color: #c47a7a">*</span>
              </label>
              <a routerLink="/forgot-password" class="text-xs font-medium transition-colors hover:underline" style="color: #7a9cc4">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div class="relative">
              <div class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--text-muted)">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                </svg>
              </div>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                [value]="password()"
                (input)="onPasswordInput($event)"
                (blur)="passwordTouched.set(true)"
                placeholder="Tu contraseña"
                autocomplete="current-password"
                class="w-full rounded-lg border px-4 py-3 pl-11 pr-11 text-sm transition-all duration-200 outline-none"
                [class.border-red-300]="passwordError()"
                [class.bg-red-50]="passwordError()"
                [style.border-color]="!passwordError() ? 'var(--border-color)' : ''"
                [style.background]="!passwordError() ? 'var(--bg-secondary)' : ''"
                [style.color]="'var(--text-primary)'"
              />
              <button
                type="button"
                (click)="showPassword.update(v => !v)"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style="background: none; border: none; cursor: pointer; padding: 2px"
              >
                @if (showPassword()) {
                  <svg class="h-5 w-5" style="color: var(--text-muted)" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                } @else {
                  <svg class="h-5 w-5" style="color: var(--text-muted)" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                }
              </button>
            </div>
            @if (passwordError()) {
              <p class="mt-1.5 text-xs" style="color: #c47a7a">{{ passwordError() }}</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="facade.loginState() === 'loading'"
            class="mt-2 w-full rounded-lg px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            style="background: linear-gradient(135deg, #8faabe 0%, #6b8a9e 100%)"
          >
            @if (facade.loginState() === 'loading') {
              <span class="flex items-center justify-center gap-2">
                <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </span>
            } @else {
              Iniciar sesión
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
            ¿No tienes cuenta?
            <a routerLink="/register" class="ml-1 font-semibold transition-colors hover:underline" style="color: #7a9cc4">
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>
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
    .animate-fade-in-up {
      animation: fade-in-up 0.5s ease-out;
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
  `],
})
export class LoginPageComponent {
  protected readonly facade = inject(AuthFlowFacade);

  protected email = signal('');
  protected password = signal('');
  protected showPassword = signal(false);
  protected emailTouched = signal(false);
  protected passwordTouched = signal(false);

  emailError(): string | null {
    if (!this.emailTouched()) return null;
    const val = this.email();
    if (!val) return 'El email es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Ingresa un email válido';
    return null;
  }

  passwordError(): string | null {
    if (!this.passwordTouched()) return null;
    if (!this.password()) return 'La contraseña es obligatoria';
    return null;
  }

  onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
  }

  onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.password.set(target.value);
  }

  onSubmit(): void {
    this.emailTouched.set(true);
    this.passwordTouched.set(true);

    if (this.emailError() || this.passwordError()) return;

    this.facade.signIn({
      email: this.email(),
      password: this.password(),
    });
  }
}

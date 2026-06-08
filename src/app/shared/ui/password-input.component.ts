import { Component, input, output, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../../core/config/app-config.token';

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

@Component({
  selector: 'app-password-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-2">
      <div class="relative">
        @if (showIcon()) {
          <div class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--text-muted)">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
          </div>
        }

        <input
          [id]="inputId()"
          [type]="showPassword() ? 'text' : 'password'"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          class="w-full rounded-lg border px-4 py-3 pr-11 text-sm transition-all duration-200 outline-none"
          [class.pl-11]="showIcon()"
          [class.border-red-300]="!!error()"
          [class.bg-red-50]="!!error()"
          [style.border-color]="!error() ? 'var(--border-color)' : ''"
          [style.background]="!error() ? 'var(--bg-secondary)' : ''"
          [style.color]="'var(--text-primary)'"
          [attr.aria-invalid]="!!error()"
          [attr.aria-describedby]="error() ? inputId() + '-error' : null"
          [autocomplete]="autocomplete()"
        />

        <button
          type="button"
          (click)="togglePasswordVisibility()"
          class="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
          style="background: none; border: none; cursor: pointer; padding: 2px"
          [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
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

      @if (error()) {
        <p [id]="inputId() + '-error'" class="text-xs" style="color: #c47a7a">{{ error() }}</p>
      }

      @if (showStrengthBar() && value()) {
        <div class="space-y-2">
          <div class="flex gap-1">
            @for (i of [0, 1, 2, 3]; track i) {
              <div
                class="h-1.5 flex-1 rounded-full transition-all duration-300"
                [style.background]="i < strengthLevel() ? getStrengthColor() : '#e2e8f0'"
              ></div>
            }
          </div>
          <p class="text-xs font-medium transition-colors duration-200" [style.color]="getStrengthColor()">
            {{ strengthLabel() }}
          </p>
        </div>
      }

      @if (showRequirements() && value()) {
        <div class="space-y-1.5">
          @for (req of requirements(); track req.label) {
            <div class="flex items-center gap-2 text-xs transition-all duration-200">
              @if (req.met) {
                <svg class="h-3.5 w-3.5" style="color: #7daa7d" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              } @else {
                <svg class="h-3.5 w-3.5" style="color: #c47a7a" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              }
              <span [style.color]="req.met ? '#7daa7d' : '#718096'">{{ req.label }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class PasswordInputComponent {
  private readonly config = inject(APP_CONFIG);

  readonly inputId = input(`input-${Math.random().toString(36).substring(2, 9)}`);
  readonly placeholder = input('Mínimo 8 caracteres');
  readonly disabled = input(false);
  readonly error = input<string | null>(null);
  readonly value = input('');
  readonly showIcon = input(true);
  readonly showStrengthBar = input(true);
  readonly showRequirements = input(true);
  readonly autocomplete = input('new-password');

  readonly valueChange = output<string>();
  readonly touched = output<void>();

  readonly showPassword = signal(false);
  readonly focused = signal(false);

  readonly requirements = computed<PasswordRequirement[]>(() => {
    const val = this.value();
    return [
      { label: `Mínimo ${this.config.validation.passwordMinLength} caracteres`, met: val.length >= this.config.validation.passwordMinLength },
      { label: 'Una mayúscula', met: /[A-Z]/.test(val) },
      { label: 'Una minúscula', met: /[a-z]/.test(val) },
      { label: 'Un número', met: /[0-9]/.test(val) },
      { label: 'Un carácter especial', met: /[@#$%^&+=!?.*_-]/.test(val) },
    ];
  });

  readonly strengthLevel = computed(() => {
    return this.requirements().filter((r) => r.met).length;
  });

  readonly strengthLabel = computed(() => {
    const level = this.strengthLevel();
    if (level <= 1) return 'Débil';
    if (level <= 2) return 'Regular';
    if (level <= 3) return 'Buena';
    if (level <= 4) return 'Fuerte';
    return 'Muy fuerte';
  });

  getStrengthColor(): string {
    const level = this.strengthLevel();
    if (level <= 1) return '#c47a7a';
    if (level <= 2) return '#c4a86a';
    if (level <= 3) return '#7a9cc4';
    return '#7daa7d';
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  onBlur(): void {
    this.focused.set(false);
    this.touched.emit();
  }

  onFocus(): void {
    this.focused.set(true);
  }
}

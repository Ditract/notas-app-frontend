import { Component, input, signal, effect, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-1.5">
      @if (label()) {
        <label
          [for]="inputId()"
          class="block text-sm font-medium text-[var(--color-on-surface)]"
        >
          {{ label() }}
          @if (required()) {
            <span class="text-[var(--color-danger)]">*</span>
          }
        </label>
      }

      <div class="relative">
        <input
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [class]="inputClass()"
        />
        @if (type() === 'password') {
          <button
            type="button"
            (click)="togglePasswordVisibility()"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]"
            [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            {{ showPassword() ? '🙈' : '👁️' }}
          </button>
        }
      </div>

      @if (error()) {
        <p class="text-sm text-[var(--color-danger)]">{{ error() }}</p>
      }
      @if (hint() && !error()) {
        <p class="text-sm text-[var(--color-on-surface-muted)]">{{ hint() }}</p>
      }
    </div>
  `,
})
export class InputComponent {
  readonly label = input<string | null>(null);
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly required = input(false);
  readonly error = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly value = input('');

  readonly inputId = input(`input-${Math.random().toString(36).substring(2, 9)}`);

  readonly showPassword = signal(false);

  readonly valueChange = signal<string>('');
  readonly touched = signal(false);

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  currentType(): string {
    if (this.type() === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type();
  }

  inputClass(): string {
    const base =
      'block w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

    if (this.error()) {
      return `${base} border-[var(--color-danger)] focus:ring-[var(--color-danger)]`;
    }
    return `${base} border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface)] focus:ring-[var(--color-primary-500)]`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.set(target.value);
  }

  onBlur(): void {
    this.touched.set(true);
  }
}
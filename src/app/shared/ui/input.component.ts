import { Component, input, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-1.5">
      @if (label()) {
        <label
          [for]="inputId()"
          class="block text-sm font-medium"
          style="color: var(--text-primary)"
        >
          {{ label() }}
          @if (required()) {
            <span style="color: var(--danger)">*</span>
          }
        </label>
      }

      <div class="relative">
        <input
          [id]="inputId()"
          [type]="type() === 'password' && showPassword() ? 'text' : type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          class="input-field"
          [class.error]="!!error()"
          [class.pr-10]="type() === 'password'"
        />
        @if (type() === 'password') {
          <button
            type="button"
            (click)="togglePasswordVisibility()"
            class="absolute right-3 top-1/2 -translate-y-1/2"
            style="color: var(--text-muted); background: none; border: none; cursor: pointer; padding: 4px"
            [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            @if (showPassword()) {
              <svg style="width:18px;height:18px" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            } @else {
              <svg style="width:18px;height:18px" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        }
      </div>

      @if (error()) {
        <p class="text-sm" style="color: var(--danger)">{{ error() }}</p>
      }
      @if (hint() && !error()) {
        <p class="text-sm" style="color: var(--text-muted)">{{ hint() }}</p>
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

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.set(target.value);
  }

  onBlur(): void {
    this.touched.set(true);
  }
}
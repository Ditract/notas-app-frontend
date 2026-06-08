import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-form-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      @if (icon()) {
        <div class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--text-muted)">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            @switch (icon()) {
              @case ('mail') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
              }
              @case ('lock') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
              }
              @case ('user') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
              }
            }
          </svg>
        </div>
      }

      <input
        [id]="inputId()"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
        class="w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200 outline-none"
        [class.pl-11]="icon()"
        [class.border-red-300]="!!error()"
        [class.bg-red-50]="!!error()"
        [style.border-color]="!error() ? 'var(--border-color)' : ''"
        [style.background]="!error() ? 'var(--bg-secondary)' : ''"
        [style.color]="'var(--text-primary)'"
        [attr.aria-invalid]="!!error()"
        [attr.aria-describedby]="error() ? inputId() + '-error' : null"
        [autocomplete]="autocomplete()"
      />

      @if (error()) {
        <p [id]="inputId() + '-error'" class="mt-1.5 text-xs" style="color: #c47a7a">{{ error() }}</p>
      }
    </div>
  `,
})
export class FormInputComponent {
  readonly inputId = input(`input-${Math.random().toString(36).substring(2, 9)}`);
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly error = input<string | null>(null);
  readonly value = input('');
  readonly icon = input<'mail' | 'lock' | 'user' | null>(null);
  readonly autocomplete = input('');

  readonly valueChange = output<string>();
  readonly touched = output<void>();
  readonly focused = signal(false);

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

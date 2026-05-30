import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="computedClass()"
    >
      @if (loading()) {
        <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);

  computedClass() {
    const base =
      'inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variants: Record<string, string> = {
      primary:
        'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]',
      secondary:
        'bg-[var(--color-surface-alt)] text-[var(--color-on-surface)] hover:bg-[var(--color-border)] border border-[var(--color-border)]',
      danger:
        'bg-[var(--color-danger)] text-white hover:opacity-90',
      ghost:
        'text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-alt)]',
    };

    return [base, sizes[this.size()], variants[this.variant()]].join(' ');
  }
}
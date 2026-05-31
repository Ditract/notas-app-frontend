import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="computedClass()">
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly variant = input<'default' | 'primary' | 'success' | 'danger' | 'warning'>('default');

  computedClass() {
    const base =
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

    const variants: Record<string, string> = {
      default:
        'bg-[var(--color-surface-alt)] text-[var(--color-on-surface-muted)]',
      primary:
        'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]',
      success:
        'bg-[var(--color-success-light)] text-[var(--color-success)]',
      danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
      warning:
        'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
    };

    return [base, variants[this.variant()]].join(' ');
  }
}
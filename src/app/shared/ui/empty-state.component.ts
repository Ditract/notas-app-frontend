import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="mb-4 text-5xl text-[var(--color-on-surface-muted)]">{{ icon() }}</div>
      <h3 class="mb-2 text-lg font-semibold text-[var(--color-on-surface)]">{{ title() }}</h3>
      @if (message()) {
        <p class="max-w-md text-sm text-[var(--color-on-surface-muted)]">{{ message() }}</p>
      }
      <div class="mt-6">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('📭');
  readonly title = input('Sin datos');
  readonly message = input<string | null>(null);
}
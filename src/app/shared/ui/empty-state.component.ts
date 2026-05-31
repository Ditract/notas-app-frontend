import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="mb-4 text-5xl">{{ icon() }}</div>
      <h3 class="mb-2 text-lg font-semibold" style="color: var(--text-primary)">{{ title() }}</h3>
      @if (message()) {
        <p class="max-w-md text-sm" style="color: var(--text-muted)">{{ message() }}</p>
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
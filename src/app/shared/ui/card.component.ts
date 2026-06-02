import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="computedClass()">
      @if (title()) {
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-[var(--color-on-surface)]">{{ title() }}</h3>
          <div class="flex items-center gap-2">
            <ng-content select="[card-actions]" />
          </div>
        </div>
      }
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  readonly title = input<string | null>(null);
  readonly padding = input(true);
  readonly hoverable = input(false);

  computedClass() {
    const base =
      'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]';
    const pad = this.padding() ? 'p-5' : '';
    const hover = this.hoverable()
      ? 'transition-shadow hover:shadow-[var(--shadow-md)] cursor-pointer'
      : '';
    return [base, pad, hover].join(' ');
  }
}
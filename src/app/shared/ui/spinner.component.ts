import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center p-8" role="status" aria-label="Cargando">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)]"></div>
    </div>
  `,
})
export class SpinnerComponent {}
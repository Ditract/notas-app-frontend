import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center p-12" role="status" aria-label="Cargando">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style="border-color: var(--border-color); border-top-color: var(--accent)"></div>
    </div>
  `,
})
export class SpinnerComponent {}
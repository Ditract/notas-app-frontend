import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-8"
      style="background: var(--bg-secondary)"
    >
      <div class="w-full max-w-md rounded-lg p-8" style="background: var(--bg)">
        <ng-content />
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}

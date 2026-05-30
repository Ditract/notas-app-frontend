import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen items-center justify-center">
      <h1 class="text-3xl font-semibold text-primary-600">NotasAPP</h1>
    </div>
  `,
})
export class LandingPageComponent {}
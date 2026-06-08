import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen">
      <div class="hidden lg:flex lg:w-1/2 items-center justify-center p-12" [style.background]="gradient()">
        <div class="max-w-md text-center">
          <div class="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 shadow-lg backdrop-blur-sm">
            <span class="text-3xl font-bold" style="color: var(--accent)">N</span>
          </div>
          @if (title()) {
            <h2 class="mb-3 text-3xl font-bold" style="color: #2d3748">{{ title() }}</h2>
          }
          @if (subtitle()) {
            <p class="text-lg" style="color: #4a5568">{{ subtitle() }}</p>
          }
          @if (features(); as feats) {
            <ul class="mt-8 space-y-3 text-left">
              @for (feat of feats; track feat) {
                <li class="flex items-center gap-3">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/60">
                    <svg class="h-4 w-4" style="color: var(--accent)" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </span>
                  <span class="text-sm" style="color: #4a5568">{{ feat }}</span>
                </li>
              }
            </ul>
          }
        </div>
      </div>

      <div class="flex w-full items-center justify-center px-4 py-8 lg:w-1/2" style="background: var(--bg-primary)">
        <div class="w-full max-w-md">
          <div class="lg:hidden mb-8 text-center">
            <div class="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-xl" style="background: var(--accent-light); color: var(--accent)">
              <span class="text-xl font-bold">N</span>
            </div>
          </div>
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {
  readonly gradient = input('linear-gradient(135deg, #c9d6ff 0%, #e2e2e2 100%)');
  readonly title = input<string | null>(null);
  readonly subtitle = input<string | null>(null);
  readonly features = input<string[] | null>(null);
}

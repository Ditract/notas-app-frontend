import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-guest-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `
    <nav class="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-[var(--spacing-page-x)]">
        <a routerLink="/" class="text-xl font-bold text-[var(--color-primary-600)]">
          NotasAPP
        </a>

        <div class="flex items-center gap-3">
          <a
            routerLink="/login"
            class="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-alt)] transition-colors"
          >
            Iniciar sesión
          </a>
          <a
            routerLink="/register"
            class="rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] transition-colors"
          >
            Registrarse
          </a>
        </div>
      </div>
    </nav>

    <router-outlet />
  `,
})
export class GuestShellComponent {}
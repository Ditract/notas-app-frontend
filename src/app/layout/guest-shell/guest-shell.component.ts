import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-guest-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav style="background: var(--bg); border-bottom: 1px solid var(--border-color)" class="sticky top-0 z-40">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a routerLink="/" class="inline-flex items-center gap-2 no-underline" style="color: var(--accent)">
          <span class="text-xl">📝</span>
          <span class="text-lg font-bold" style="color: var(--text-primary)">NotasAPP</span>
        </a>

        <div class="flex items-center gap-3">
          <a
            routerLink="/login"
            class="btn btn-ghost btn-sm no-underline"
          >
            Iniciar sesión
          </a>
          <a
            routerLink="/register"
            class="btn btn-primary btn-sm no-underline"
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
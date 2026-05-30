import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthFacade } from '../../core/auth/application/auth.facade';
import { ThemeService } from '../../core/config/theme.service';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-[var(--spacing-page-x)]">
        <a routerLink="/app/notes" class="text-xl font-bold text-[var(--color-primary-600)]">
          NotasAPP
        </a>

        <div class="flex items-center gap-4">
          <button
            (click)="themeService.toggle()"
            class="rounded-[var(--radius-sm)] p-2 text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-alt)] transition-colors"
            [attr.aria-label]="themeService.currentTheme() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            [title]="themeService.currentTheme() === 'dark' ? 'Modo claro' : 'Modo oscuro'"
          >
            {{ themeService.currentTheme() === 'dark' ? '☀️' : '🌙' }}
          </button>
          @if (authFacade.currentUser(); as user) {
            <span class="text-sm text-[var(--color-on-surface-muted)]">{{ user.email }}</span>
          }
          <button
            (click)="handleLogout()"
            class="rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>

    <main class="mx-auto max-w-7xl px-[var(--spacing-page-x)] py-[var(--spacing-page-y)]">
      <router-outlet />
    </main>

    <footer class="border-t border-[var(--color-border)] py-6 text-center text-sm text-[var(--color-on-surface-muted)]">
      NotasAPP &copy; 2025
    </footer>
  `,
})
export class AppShellComponent {
  protected readonly authFacade = inject(AuthFacade);
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  handleLogout(): void {
    this.authFacade.logout();
    this.router.navigate(['/login']);
  }
}
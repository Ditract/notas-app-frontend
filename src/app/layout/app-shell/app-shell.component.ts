import { Component, inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { AuthFacade } from '../../core/auth/application/auth.facade';
import { ThemeService } from '../../core/config/theme.service';
import { NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChatBubbleComponent } from '../../features/chat/presentation/chat-bubble/chat-bubble.component';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, ChatBubbleComponent],
  template: `
    <nav style="background: var(--bg); border-bottom: 1px solid var(--border-color)" class="sticky top-0 z-40">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a routerLink="/app/notes" class="inline-flex items-center gap-2 no-underline" style="color: var(--accent)">
          <span class="text-xl">📝</span>
          <span class="text-lg font-bold" style="color: var(--text-primary)">NotasAPP</span>
        </a>

        <div class="flex items-center gap-3">
          <button
            (click)="themeService.toggle()"
            class="btn btn-ghost btn-sm"
            [attr.aria-label]="themeService.currentTheme() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            [title]="themeService.currentTheme() === 'dark' ? 'Modo claro' : 'Modo oscuro'"
          >
            {{ themeService.currentTheme() === 'dark' ? '☀️' : '🌙' }}
          </button>

          <div class="relative">
            <button
              (click)="userMenuOpen = !userMenuOpen"
              class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors"
              style="background: var(--accent-light); color: var(--accent)"
              [attr.aria-expanded]="userMenuOpen"
              aria-haspopup="true"
              aria-label="Menú de usuario"
            >
              {{ userInitial() }}
            </button>

            @if (userMenuOpen) {
              <div
                class="absolute right-0 top-full mt-2 w-56 overflow-hidden"
                style="background: var(--bg); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg)"
                role="menu"
              >
                @if (authFacade.currentUser(); as user) {
                  <div class="border-b px-4 py-3" style="border-color: var(--border-color)">
                    <p class="text-sm font-semibold" style="color: var(--text-primary)">{{ user.email }}</p>
                  </div>
                }

                <div class="p-1.5">
                  @if (isOnProfile()) {
                    <a routerLink="/app/notes" (click)="userMenuOpen = false" class="dropdown-item no-underline" role="menuitem">
                      <span>📋</span> Dashboard
                    </a>
                  } @else {
                    <a routerLink="/app/profile" (click)="userMenuOpen = false" class="dropdown-item no-underline" role="menuitem">
                      <span>👤</span> Mi perfil
                    </a>
                  }
                  <div class="my-1" style="border-top: 1px solid var(--border-color)"></div>
                  <button (click)="handleLogout()" class="dropdown-item dropdown-item--danger" role="menuitem">
                    <span>🚪</span> Cerrar sesión
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </nav>

    <main class="mx-auto max-w-6xl px-6 py-8">
      <router-outlet />
    </main>

    <footer style="border-top: 1px solid var(--border-color); color: var(--text-muted)" class="py-6 text-center text-sm">
      NotasAPP &copy; 2025
    </footer>

    <app-chat-bubble />
  `,
})
export class AppShellComponent implements OnDestroy {
  protected readonly authFacade = inject(AuthFacade);
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  protected userMenuOpen = false;
  protected currentUrl = '';

  private readonly clickOutsideHandler = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.userMenuOpen = false;
    }
  };

  private readonly routeSub = this.router.events.pipe(
    filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd)
  ).subscribe((e) => {
    this.currentUrl = e.urlAfterRedirects;
    this.userMenuOpen = false;
  });

  constructor() {
    document.addEventListener('click', this.clickOutsideHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickOutsideHandler);
    this.routeSub.unsubscribe();
  }

  userInitial = (): string => {
    const user = this.authFacade.currentUser();
    return user?.email?.charAt(0).toUpperCase() ?? 'U';
  };

  isOnProfile = (): boolean => this.currentUrl.includes('/app/profile');

  handleLogout(): void {
    this.userMenuOpen = false;
    this.authFacade.logout();
    this.router.navigate(['/login']);
  }
}
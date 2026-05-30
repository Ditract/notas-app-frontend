import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed right-4 top-4 z-50 flex flex-col gap-2"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [class]="toastClass(toast)"
          [@.class]="toast.dismissing ? 'animate-slide-out' : 'animate-slide-in'"
          role="alert"
        >
          <div class="flex items-start gap-3">
            <span class="text-lg">{{ icon(toast.type) }}</span>
            <div class="flex-1">
              <p class="text-sm font-semibold">{{ toast.title }}</p>
              @if (toast.message) {
                <p class="mt-0.5 text-sm opacity-90">{{ toast.message }}</p>
              }
            </div>
            <button
              (click)="toastService.dismiss(toast.id)"
              class="ml-2 text-current opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  icon(type: string): string {
    const icons: Record<string, string> = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[type] ?? 'ℹ️';
  }

  toastClass(toast: { type: string; dismissing?: boolean }): string {
    const base =
      'min-w-80 max-w-md rounded-[var(--radius-lg)] border shadow-[var(--shadow-lg)] p-4 text-white transition-all duration-300';

    const variants: Record<string, string> = {
      success: 'bg-[var(--color-success)] border-transparent',
      error: 'bg-[var(--color-danger)] border-transparent',
      warning: 'bg-[var(--color-warning)] border-transparent text-gray-900',
      info: 'bg-[var(--color-info)] border-transparent',
    };

    const animation = toast.dismissing
      ? 'translate-x-full opacity-0'
      : 'translate-x-0 opacity-100';

    return [base, variants[toast.type] ?? variants['info'], animation].join(' ');
  }
}
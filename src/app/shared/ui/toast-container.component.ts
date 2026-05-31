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
          role="alert"
        >
          <div class="flex items-start gap-3">
            <span class="text-lg">{{ icon(toast.type) }}</span>
            <div class="flex-1">
              <p class="text-sm font-semibold">{{ toast.title }}</p>
              @if (toast.message) {
                <p class="mt-0.5 text-sm" style="opacity:0.9">{{ toast.message }}</p>
              }
            </div>
            <button
              (click)="toastService.dismiss(toast.id)"
              class="ml-2 opacity-60 hover:opacity-100 transition-opacity"
              style="color:inherit;background:none;border:none;cursor:pointer"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-base {
      min-width: 20rem;
      max-width: 28rem;
      border-radius: var(--radius-lg);
      padding: 1rem;
      transition: all 0.3s ease;
    }
    .toast-success { background: var(--success); color: #fff; }
    .toast-error { background: var(--danger); color: #fff; }
    .toast-warning { background: var(--warning); color: #1a1b1e; }
    .toast-info { background: var(--accent); color: #fff; }
    .toast-enter { animation: slide-in 0.3s ease; }
    .toast-exit { transform: translateX(100%); opacity: 0; }

    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
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
    const typeMap: Record<string, string> = {
      success: 'toast-success',
      error: 'toast-error',
      warning: 'toast-warning',
      info: 'toast-info',
    };
    const animation = toast.dismissing ? 'toast-exit' : 'toast-enter';
    return `toast-base ${typeMap[toast.type] ?? typeMap['info']} ${animation}`;
  }
}
import { Injectable, signal, computed } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  dismissing?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private idCounter = 0;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = computed(() => this._toasts());

  success(title: string, message?: string): void {
    this.add('success', title, message);
  }

  error(title: string, message?: string): void {
    this.add('error', title, message);
  }

  warning(title: string, message?: string): void {
    this.add('warning', title, message);
  }

  info(title: string, message?: string): void {
    this.add('info', title, message);
  }

  dismiss(id: number): void {
    this._toasts.update((toasts) =>
      toasts.map((t) =>
        t.id === id ? { ...t, dismissing: true } : t,
      ),
    );

    setTimeout(() => {
      this._toasts.update((toasts) => toasts.filter((t) => t.id !== id));
    }, 300);
  }

  private add(
    type: Toast['type'],
    title: string,
    message?: string,
  ): void {
    const id = ++this.idCounter;
    this._toasts.update((toasts) => [
      ...toasts,
      { id, type, title, message },
    ]);

    setTimeout(() => this.dismiss(id), 4000);
  }
}
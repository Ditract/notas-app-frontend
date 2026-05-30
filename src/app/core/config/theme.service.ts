import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'notasapp-theme';

  readonly currentTheme = signal<'light' | 'dark'>('light');

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') {
      this.currentTheme.set(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme.set(prefersDark ? 'dark' : 'light');
    }

    effect(() => {
      this.applyTheme(this.currentTheme());
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved || saved === 'system') {
        this.currentTheme.set(e.matches ? 'dark' : 'light');
      }
    });
  }

  toggle(): void {
    const next = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(next);
    localStorage.setItem(this.STORAGE_KEY, next);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}
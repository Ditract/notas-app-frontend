import { Component, input, output, ElementRef, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { DialogModule, Dialog } from '@angular/cdk/dialog';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      (click)="onBackdropClick()"
    >
      <div
        class="w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6"
        (click)="$event.stopPropagation()"
        role="dialog"
        [attr.aria-label]="title()"
        aria-modal="true"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[var(--color-on-surface)]">{{ title() }}</h2>
          <button
            (click)="closed.emit()"
            class="rounded-[var(--radius-sm)] p-1 text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-alt)] transition-colors"
            aria-label="Cerrar diálogo"
          >
            ✕
          </button>
        </div>

        <ng-content />
      </div>
    </div>
  `,
})
export class DialogComponent {
  readonly title = input.required<string>();
  readonly closed = output<void>();

  onBackdropClick(): void {
    this.closed.emit();
  }
}
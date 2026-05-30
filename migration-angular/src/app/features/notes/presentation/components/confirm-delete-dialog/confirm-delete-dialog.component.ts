import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="cancel.emit()">
      <div
        class="w-full max-w-sm rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
        (click)="$event.stopPropagation()"
        role="alertdialog"
        aria-label="Confirmar eliminación"
        aria-modal="true"
      >
        <div class="mb-4 text-center">
          <div class="mb-3 text-4xl">🗑️</div>
          <h2 class="text-lg font-semibold text-[var(--color-on-surface)]">¿Eliminar nota?</h2>
          <p class="mt-1 text-sm text-[var(--color-on-surface-muted)]">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div class="flex gap-3">
          <button
            (click)="cancel.emit()"
            class="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-alt)] transition-colors"
          >
            Cancelar
          </button>
          <button
            (click)="confirm.emit()"
            class="flex-1 rounded-[var(--radius-md)] bg-[var(--color-danger)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDeleteDialogComponent {
  readonly noteTitle = input('');
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
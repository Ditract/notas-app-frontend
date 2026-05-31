import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(0,0,0,0.5)" (click)="cancel.emit()">
      <div
        class="card w-full max-w-sm p-6"
        (click)="$event.stopPropagation()"
        role="alertdialog"
        aria-label="Confirmar eliminación"
        aria-modal="true"
      >
        <div class="mb-5 text-center">
          <div class="mb-3 text-4xl">🗑️</div>
          <h2 class="text-lg font-bold" style="color: var(--text-primary)">¿Eliminar nota?</h2>
          <p class="mt-1 text-sm" style="color: var(--text-muted)">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div class="flex gap-3">
          <button
            (click)="cancel.emit()"
            class="btn btn-secondary btn-md flex-1"
          >
            Cancelar
          </button>
          <button
            (click)="confirm.emit()"
            class="btn btn-danger btn-md flex-1"
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
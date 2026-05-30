import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { SanitizeHtmlPipe } from '../../../../../shared/pipes/sanitize-html.pipe';

@Component({
  selector: 'app-note-view-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SanitizeHtmlPipe],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="close.emit()">
      <div
        class="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-label="Ver nota"
        aria-modal="true"
      >
        <div class="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 class="text-lg font-semibold text-[var(--color-on-surface)]">{{ note()?.titulo }}</h2>
          <button
            (click)="close.emit()"
            class="rounded-[var(--radius-sm)] p-1 text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-alt)] transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div class="prose prose-sm max-w-none p-6 text-[var(--color-on-surface)]" [innerHTML]="note()?.contenido | sanitizeHtml"></div>
      </div>
    </div>
  `,
})
export class NoteViewDialogComponent {
  readonly note = input<{ titulo: string; contenido: string } | null>(null);
  readonly close = output<void>();
}
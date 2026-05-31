import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { SanitizeHtmlPipe } from '../../../../../shared/pipes/sanitize-html.pipe';

@Component({
  selector: 'app-note-view-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SanitizeHtmlPipe],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(0,0,0,0.5)" (click)="close.emit()">
      <div
        class="card w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-label="Ver nota"
        aria-modal="true"
      >
        <div class="flex items-center justify-between border-b px-6 py-4" style="border-color: var(--border-color)">
          <h2 class="text-lg font-semibold" style="color: var(--text-primary)">{{ note()?.titulo }}</h2>
          <button
            (click)="close.emit()"
            class="btn btn-ghost btn-sm"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div class="prose prose-sm max-w-none p-6" style="color: var(--text-primary)" [innerHTML]="note()?.contenido | sanitizeHtml"></div>
      </div>
    </div>
  `,
})
export class NoteViewDialogComponent {
  readonly note = input<{ titulo: string; contenido: string } | null>(null);
  readonly close = output<void>();
}
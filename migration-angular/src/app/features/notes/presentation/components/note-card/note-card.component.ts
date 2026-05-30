import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { NotePreviewPipe } from '../../../../../shared/pipes/note-preview.pipe';

@Component({
  selector: 'app-note-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NotePreviewPipe],
  template: `
    <div
      class="group flex cursor-pointer flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
      (click)="view.emit(note())"
    >
      <div class="mb-2 flex items-start justify-between gap-2">
        <h3 class="line-clamp-1 text-base font-semibold text-[var(--color-on-surface)]">
          {{ note().titulo }}
        </h3>
        @if (note().isFavorite) {
          <span class="shrink-0 text-base" title="Favorita">⭐</span>
        }
      </div>

      <p class="mb-4 line-clamp-3 flex-1 text-sm text-[var(--color-on-surface-muted)]">
        {{ note().contenido | notePreview:200 }}
      </p>

      <div class="flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
        <button
          (click)="onToggleFavorite($event)"
          class="rounded-[var(--radius-sm)] px-2 py-1 text-xs transition-colors"
          [class.text-[var(--color-warning)]]="note().isFavorite"
          [class.hover:bg-[var(--color-warning-light)]]="note().isFavorite"
          [class.text-[var(--color-on-surface-muted)]]="!note().isFavorite"
          [class.hover:bg-[var(--color-surface-alt)]]="!note().isFavorite"
          [attr.aria-label]="note().isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
        >
          {{ note().isFavorite ? '⭐ Favorita' : '☆ Favorita' }}
        </button>
        <button
          (click)="onEdit($event)"
          class="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)] transition-colors"
          aria-label="Editar nota"
        >
          ✏️ Editar
        </button>
        <button
          (click)="onDelete($event)"
          class="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors"
          aria-label="Eliminar nota"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  `,
})
export class NoteCardComponent {
  readonly note = input.required<{ id: number; titulo: string; contenido: string; isFavorite: boolean }>();
  readonly view = output<{ id: number; titulo: string; contenido: string; isFavorite: boolean }>();
  readonly edit = output<{ id: number; titulo: string; contenido: string; isFavorite: boolean }>();
  readonly delete = output<number>();
  readonly toggleFavorite = output<number>();

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    this.toggleFavorite.emit(this.note().id);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.note());
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.note().id);
  }
}
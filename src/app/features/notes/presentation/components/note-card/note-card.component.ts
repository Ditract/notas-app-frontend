import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { NotePreviewPipe } from '../../../../../shared/pipes/note-preview.pipe';
import { getCategoriaColor } from '../../../domain/categoria.constantes';

@Component({
  selector: 'app-note-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NotePreviewPipe],
  template: `
    <div
      class="card note-card-hover cursor-pointer overflow-hidden p-0"
      (click)="view.emit(note())"
    >
      <div class="p-5">
        <div class="mb-3 flex items-start justify-between gap-2">
          <h3 class="line-clamp-1 text-base font-semibold" style="color: var(--text-primary)">
            {{ note().titulo }}
          </h3>
          @if (note().isFavorite) {
            <span class="shrink-0 text-sm" title="Favorita">⭐</span>
          }
        </div>

        @if (note().categoria) {
          <span class="mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium" [style.background-color]="getCategoriaColor(note().categoria!)" style="color: #1f2937">
            {{ note().categoria }}
          </span>
        }

        <p class="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed" style="color: var(--text-secondary)">
          {{ note().contenido | notePreview:180 }}
        </p>

        @if (note().createdAt) {
          <p class="text-xs" style="color: var(--text-muted)">
            {{ getRelativeTime(note().createdAt!) }}
          </p>
        }
      </div>

      <div class="flex items-center gap-1 border-t px-4 py-2.5" style="border-color: var(--border-color); background: var(--bg-secondary)">
        <button
          (click)="onToggleFavorite($event)"
          class="card-action card-action--fav"
          [attr.aria-label]="note().isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
        >
          {{ note().isFavorite ? '⭐ Favorita' : '☆ Favorita' }}
        </button>
        <button
          (click)="onEdit($event)"
          class="card-action card-action--edit"
          aria-label="Editar nota"
        >
          ✏️ Editar
        </button>
        <button
          (click)="onDelete($event)"
          class="card-action card-action--delete"
          aria-label="Eliminar nota"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  `,
})
export class NoteCardComponent {
  readonly note = input.required<{ id: number; titulo: string; contenido: string; categoria?: string; createdAt?: string; isFavorite: boolean }>();
  readonly view = output<{ id: number; titulo: string; contenido: string; categoria?: string; createdAt?: string; isFavorite: boolean }>();
  readonly edit = output<{ id: number; titulo: string; contenido: string; categoria?: string; createdAt?: string; isFavorite: boolean }>();
  readonly delete = output<number>();
  readonly toggleFavorite = output<number>();

  getCategoriaColor(categoria: string): string {
    return getCategoriaColor(categoria);
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'hace un momento';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays} días`;
    return date.toLocaleDateString();
  }

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
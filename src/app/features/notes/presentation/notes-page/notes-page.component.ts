import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotesFacade } from '../../application/notes.facade';
import { NoteCardComponent } from '../components/note-card/note-card.component';
import { NoteEditorDialogComponent } from '../components/note-editor-dialog/note-editor-dialog.component';
import { NoteViewDialogComponent } from '../components/note-view-dialog/note-view-dialog.component';
import { ConfirmDeleteDialogComponent } from '../components/confirm-delete-dialog/confirm-delete-dialog.component';
import { SpinnerComponent } from '../../../../shared/ui/spinner.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state.component';
import { CATEGORIAS } from '../../domain/categoria.constantes';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NoteCardComponent,
    NoteEditorDialogComponent,
    NoteViewDialogComponent,
    ConfirmDeleteDialogComponent,
    SpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold" style="color: var(--text-primary)">Mis Notas</h1>
        <button
          (click)="showNewEditor = true"
          class="btn btn-primary btn-md"
        >
          + Nueva nota
        </button>
      </div>

      @if (facade.estadisticas(); as stats) {
        <div class="flex flex-wrap gap-3 text-sm" style="color: var(--text-secondary)">
          <span class="rounded-lg px-3 py-1.5" style="background: var(--bg-secondary)">
            📝 {{ stats.totalNotas }} notas
          </span>
          <span class="rounded-lg px-3 py-1.5" style="background: var(--bg-secondary)">
            ⭐ {{ facade.favorites().size }} favoritas
          </span>
        </div>
      }

      <div class="relative">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style="width:16px;height:16px;color:var(--text-muted)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          type="text"
          [value]="facade.searchTerm()"
          (input)="onSearch($event)"
          placeholder="Buscar notas..."
          class="input-field"
          style="padding-left: 2.75rem"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          (click)="facade.setCategoriaFiltro(null)"
          class="rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
          [style.background-color]="!facade.categoriaFiltro() ? 'var(--accent)' : 'var(--bg-secondary)'"
          [style.color]="!facade.categoriaFiltro() ? 'white' : 'var(--text-secondary)'"
        >
          Todas
          @if (facade.estadisticas(); as stats) {
            <span class="ml-1 text-xs">({{ stats.totalNotas }})</span>
          }
        </button>
        @for (cat of categorias; track cat) {
          <button
            (click)="facade.setCategoriaFiltro(cat)"
            class="rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
            [style.background-color]="facade.categoriaFiltro() === cat ? 'var(--accent)' : 'var(--bg-secondary)'"
            [style.color]="facade.categoriaFiltro() === cat ? 'white' : 'var(--text-secondary)'"
          >
            {{ cat }}
            @if (facade.estadisticas(); as stats) {
              <span class="ml-1 text-xs">({{ stats.notasPorCategoria[cat] || 0 }})</span>
            }
          </button>
        }
      </div>

      @if (facade.loading()) {
        <app-spinner />
      }

      @else if (facade.isEmpty()) {
        <app-empty-state
          icon="📝"
          title="Sin notas"
          message="Crea tu primera nota haciendo clic en el botón de arriba."
        />
      }

      @else if (facade.filteredNotes().length === 0 && (facade.searchTerm() || facade.categoriaFiltro())) {
        <app-empty-state
          icon="🔍"
          title="Sin resultados"
          message="No se encontraron notas que coincidan con tu búsqueda o filtro."
        />
      }

      @else {
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (note of facade.filteredNotes(); track note.id) {
            <app-note-card
              [note]="note"
              (view)="facade.openViewer($event)"
              (edit)="facade.openEditor($event)"
              (delete)="facade.confirmDelete($event)"
              (toggleFavorite)="facade.toggleFavorite($event)"
            />
          }
        </div>
      }

      @if (showNewEditor) {
        <app-note-editor-dialog
          [note]="null"
          (save)="onSaveNew($event)"
          (cancel)="showNewEditor = false"
        />
      }

      @if (facade.editingNote(); as editNote) {
        <app-note-editor-dialog
          [note]="editNote"
          (save)="onSaveEdit($event)"
          (cancel)="facade.closeEditor()"
        />
      }

      @if (facade.viewingNote(); as viewNote) {
        <app-note-view-dialog
          [note]="viewNote"
          (close)="facade.closeViewer()"
        />
      }

      @if (facade.deletingNoteId(); as deletingId) {
        <app-confirm-delete-dialog
          (confirm)="facade.remove(deletingId!)"
          (cancel)="facade.cancelDelete()"
        />
      }
    </div>
  `,
})
export class NotesPageComponent implements OnInit {
  protected readonly facade = inject(NotesFacade);
  protected readonly categorias = CATEGORIAS;
  protected showNewEditor = false;

  ngOnInit(): void {
    this.facade.load();
    this.facade.cargarEstadisticas();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.facade.setSearch(target.value);
  }

  onSaveNew(data: { titulo: string; contenido: string; categoria?: string }): void {
    this.facade.create(data);
    this.showNewEditor = false;
  }

  onSaveEdit(data: { titulo: string; contenido: string; categoria?: string }): void {
    const editNote = this.facade.editingNote();
    if (editNote) {
      this.facade.update(editNote.id, data);
    }
  }
}
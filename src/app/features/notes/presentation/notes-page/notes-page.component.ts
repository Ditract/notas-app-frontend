import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotesFacade } from '../../application/notes.facade';
import { NoteCardComponent } from '../components/note-card/note-card.component';
import { NoteEditorDialogComponent } from '../components/note-editor-dialog/note-editor-dialog.component';
import { NoteViewDialogComponent } from '../components/note-view-dialog/note-view-dialog.component';
import { ConfirmDeleteDialogComponent } from '../components/confirm-delete-dialog/confirm-delete-dialog.component';
import { SpinnerComponent } from '../../../../shared/ui/spinner.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state.component';

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

      @else if (facade.filteredNotes().length === 0 && facade.searchTerm()) {
        <app-empty-state
          icon="🔍"
          title="Sin resultados"
          message="No se encontraron notas que coincidan con tu búsqueda."
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

      @if (facade.deletingNoteId()) {
        <app-confirm-delete-dialog
          (confirm)="facade.remove(facade.deletingNoteId()!)"
          (cancel)="facade.cancelDelete()"
        />
      }
    </div>
  `,
})
export class NotesPageComponent implements OnInit {
  protected readonly facade = inject(NotesFacade);
  protected showNewEditor = false;

  ngOnInit(): void {
    this.facade.load();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.facade.setSearch(target.value);
  }

  onSaveNew(data: { titulo: string; contenido: string }): void {
    this.facade.create(data);
    this.showNewEditor = false;
  }

  onSaveEdit(data: { titulo: string; contenido: string }): void {
    const editNote = this.facade.editingNote();
    if (editNote) {
      this.facade.update(editNote.id, data);
    }
  }
}
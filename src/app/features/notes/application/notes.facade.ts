import { Injectable, inject, signal, computed } from '@angular/core';
import { NotesRepository } from '../domain/notes.repository';
import { FavoritesRepository } from '../domain/favorites.repository';
import { Nota, CreateNotaData, UpdateNotaData } from '../domain/nota.model';
import { EstadisticasResponse } from '../domain/estadisticas.model';
import { ToastService } from '../../../shared/ui/toast.service';

export type NotesViewMode = 'grid' | 'list';

@Injectable({ providedIn: 'root' })
export class NotesFacade {
  private readonly notesRepo = inject(NotesRepository);
  private readonly favoritesRepo = inject(FavoritesRepository);
  private readonly toast = inject(ToastService);

  private readonly _notes = signal<Nota[]>([]);
  private readonly _favorites = signal<Set<number>>(new Set());
  private readonly _searchTerm = signal('');
  private readonly _categoriaFiltro = signal<string | null>(null);
  private readonly _estadisticas = signal<EstadisticasResponse | null>(null);
  private readonly _notasRecientes = signal<Nota[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _editingNote = signal<Nota | null>(null);
  private readonly _viewingNote = signal<Nota | null>(null);
  private readonly _deletingNoteId = signal<number | null>(null);
  readonly viewMode = signal<NotesViewMode>('grid');

  readonly notes = computed(() => this._notes());
  readonly favorites = computed(() => this._favorites());
  readonly searchTerm = computed(() => this._searchTerm());
  readonly categoriaFiltro = computed(() => this._categoriaFiltro());
  readonly estadisticas = computed(() => this._estadisticas());
  readonly notasRecientes = computed(() => this._notasRecientes());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly editingNote = computed(() => this._editingNote());
  readonly viewingNote = computed(() => this._viewingNote());
  readonly deletingNoteId = computed(() => this._deletingNoteId());

  readonly filteredNotes = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const categoria = this._categoriaFiltro();
    const notes = this._notes();
    const favs = this._favorites();

    let result = notes;

    if (categoria) {
      result = result.filter((n) => n.categoria === categoria);
    }

    if (!term) return result.map((n) => ({ ...n, isFavorite: favs.has(n.id) }));

    return result
      .filter((n) => {
        const plainContent = n.contenido.replace(/<[^>]*>/g, '').toLowerCase();
        return n.titulo.toLowerCase().includes(term) || plainContent.includes(term);
      })
      .map((n) => ({ ...n, isFavorite: favs.has(n.id) }));
  });

  readonly favoriteNotes = computed(() => {
    const favs = this._favorites();
    return this._notes().filter((n) => favs.has(n.id));
  });

  readonly isEmpty = computed(() => this._notes().length === 0 && !this._loading());

  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.notesRepo.list().subscribe({
      next: (notes) => {
        this._notes.set(notes);
        this._loading.set(false);
        this.loadFavorites();
      },
      error: () => {
        this._error.set('Error al cargar las notas');
        this._loading.set(false);
        this.toast.error('Error', 'No se pudieron cargar las notas');
      },
    });
  }

  private loadFavorites(): void {
    this.favoritesRepo.listFavoriteIds().subscribe({
      next: (ids) => this._favorites.set(new Set(ids)),
      error: () => {},
    });
  }

  create(data: CreateNotaData): void {
    this.notesRepo.create(data).subscribe({
      next: (note) => {
        this._notes.update((notes) => [...notes, note]);
        this._editingNote.set(null);
        this.toast.success('Nota creada', `"${note.titulo}" se ha creado exitosamente.`);
      },
      error: () => {
        this.toast.error('Error', 'No se pudo crear la nota');
      },
    });
  }

  update(id: number, data: UpdateNotaData): void {
    this.notesRepo.update(id, data).subscribe({
      next: (updated) => {
        this._notes.update((notes) =>
          notes.map((n) => (n.id === id ? updated : n)),
        );
        this._editingNote.set(null);
        this.toast.success('Nota actualizada', `"${updated.titulo}" se ha actualizado.`);
      },
      error: () => {
        this.toast.error('Error', 'No se pudo actualizar la nota');
      },
    });
  }

  remove(id: number): void {
    this.notesRepo.remove(id).subscribe({
      next: () => {
        const note = this._notes().find((n) => n.id === id);
        this._notes.update((notes) => notes.filter((n) => n.id !== id));
        this._deletingNoteId.set(null);
        this.toast.success('Nota eliminada', note ? `"${note.titulo}" se ha eliminado.` : 'Nota eliminada.');
      },
      error: () => {
        this.toast.error('Error', 'No se pudo eliminar la nota');
      },
    });
  }

  toggleFavorite(noteId: number): void {
    const favs = this._favorites();
    if (favs.has(noteId)) {
      this.favoritesRepo.removeFavorite(noteId).subscribe({
        next: () => {
          this._favorites.update((s) => {
            const newSet = new Set(s);
            newSet.delete(noteId);
            return newSet;
          });
        },
        error: () => this.toast.error('Error', 'No se pudo quitar de favoritos'),
      });
    } else {
      this.favoritesRepo.addFavorite(noteId).subscribe({
        next: () => {
          this._favorites.update((s) => {
            const newSet = new Set(s);
            newSet.add(noteId);
            return newSet;
          });
        },
        error: () => this.toast.error('Error', 'No se pudo agregar a favoritos'),
      });
    }
  }

  setSearch(term: string): void {
    this._searchTerm.set(term);
  }

  openEditor(note?: Nota): void {
    this._editingNote.set(note ?? null);
  }

  closeEditor(): void {
    this._editingNote.set(null);
  }

  openViewer(note: Nota): void {
    this._viewingNote.set(note);
  }

  closeViewer(): void {
    this._viewingNote.set(null);
  }

  confirmDelete(noteId: number): void {
    this._deletingNoteId.set(noteId);
  }

  cancelDelete(): void {
    this._deletingNoteId.set(null);
  }

  isFavorite(noteId: number): boolean {
    return this._favorites().has(noteId);
  }

  setCategoriaFiltro(categoria: string | null): void {
    this._categoriaFiltro.set(categoria);
  }

  cargarEstadisticas(): void {
    this.notesRepo.estadisticas().subscribe({
      next: (stats) => this._estadisticas.set(stats),
      error: () => {},
    });
  }

  cargarRecientes(limit: number): void {
    this.notesRepo.recientes(limit).subscribe({
      next: (notes) => this._notasRecientes.set(notes),
      error: () => {},
    });
  }

  buscarServerSide(keyword: string): void {
    if (!keyword.trim()) {
      this.load();
      return;
    }
    this._loading.set(true);
    this.notesRepo.buscar(keyword).subscribe({
      next: (notes) => {
        this._notes.set(notes);
        this._loading.set(false);
        this.loadFavorites();
      },
      error: () => {
        this._error.set('Error al buscar notas');
        this._loading.set(false);
        this.toast.error('Error', 'No se pudieron buscar las notas');
      },
    });
  }
}
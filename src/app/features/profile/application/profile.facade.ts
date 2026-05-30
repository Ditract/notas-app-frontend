import { Injectable, inject, signal, computed } from '@angular/core';
import { ProfileRepository } from '../domain/profile.repository';
import { AuthFacade } from '../../../core/auth/application/auth.facade';
import { ToastService } from '../../../shared/ui/toast.service';
import { Nota } from '../../notes/domain/nota.model';
import { NotesRepository } from '../../notes/domain/notes.repository';
import { FavoritesRepository } from '../../notes/domain/favorites.repository';

@Injectable({ providedIn: 'root' })
export class ProfileFacade {
  private readonly profileRepo = inject(ProfileRepository);
  private readonly notesRepo = inject(NotesRepository);
  private readonly favoritesRepo = inject(FavoritesRepository);
  private readonly authFacade = inject(AuthFacade);
  private readonly toast = inject(ToastService);

  private readonly _perfil = signal<{ nombre: string; notasFavoritas: number[] } | null>(null);
  private readonly _favoriteNotes = signal<Nota[]>([]);
  private readonly _loading = signal(false);
  private readonly _editingName = signal(false);
  private readonly _editingPassword = signal(false);

  readonly perfil = computed(() => this._perfil());
  readonly favoriteNotes = computed(() => this._favoriteNotes());
  readonly loading = computed(() => this._loading());
  readonly editingName = computed(() => this._editingName());
  readonly editingPassword = computed(() => this._editingPassword());
  readonly userEmail = computed(() => this.authFacade.currentUser()?.email ?? '');
  readonly favoritesCount = computed(() => this._perfil()?.notasFavoritas?.length ?? 0);

  load(): void {
    this._loading.set(true);
    this.profileRepo.getMyProfile().subscribe({
      next: (perfil) => {
        this._perfil.set(perfil);
        this._loading.set(false);
        this.loadFavoriteNotes(perfil.notasFavoritas ?? []);
      },
      error: () => {
        this._loading.set(false);
        this.toast.error('Error', 'No se pudo cargar el perfil');
      },
    });
  }

  private loadFavoriteNotes(favoriteIds: number[]): void {
    if (favoriteIds.length === 0) {
      this._favoriteNotes.set([]);
      return;
    }

    this.notesRepo.list().subscribe({
      next: (allNotes) => {
        this._favoriteNotes.set(allNotes.filter((n) => favoriteIds.includes(n.id)));
      },
      error: () => {},
    });
  }

  updateName(nombre: string): void {
    this._editingName.set(true);
    this.profileRepo.updateName(nombre).subscribe({
      next: (updated) => {
        this._perfil.set(updated);
        this._editingName.set(false);
        this.toast.success('Perfil actualizado', 'Tu nombre ha sido cambiado exitosamente.');
      },
      error: () => {
        this._editingName.set(false);
        this.toast.error('Error', 'No se pudo actualizar el nombre');
      },
    });
  }

  changePassword(passwordActual: string, nuevaPassword: string): void {
    this._editingPassword.set(true);
    this.profileRepo.changePassword({ passwordActual, nuevaPassword }).subscribe({
      next: () => {
        this._editingPassword.set(false);
        this.toast.success('Contraseña actualizada', 'Tu contraseña ha sido cambiada exitosamente.');
      },
      error: (err: Record<string, unknown>) => {
        this._editingPassword.set(false);
        const errorObj = err as { message?: string };
        this.toast.error('Error', errorObj.message ?? 'No se pudo cambiar la contraseña');
      },
    });
  }

  removeFavorite(noteId: number): void {
    this.favoritesRepo.removeFavorite(noteId).subscribe({
      next: () => {
        this.toast.info('Favorito removido', 'La nota ha sido quitada de favoritos.');
        this.load();
      },
      error: () => {
        this.toast.error('Error', 'No se pudo quitar de favoritos');
      },
    });
  }

  openEditName(): void {
    this._editingName.set(true);
  }

  closeEditName(): void {
    this._editingName.set(false);
  }

  openEditPassword(): void {
    this._editingPassword.set(true);
  }

  closeEditPassword(): void {
    this._editingPassword.set(false);
  }
}
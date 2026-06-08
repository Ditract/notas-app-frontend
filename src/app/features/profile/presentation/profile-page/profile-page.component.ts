import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProfileFacade } from '../../application/profile.facade';
import { AuthFacade } from '../../../../core/auth/application/auth.facade';
import { NotePreviewPipe } from '../../../../shared/pipes/note-preview.pipe';
import { SpinnerComponent } from '../../../../shared/ui/spinner.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state.component';
import { NoteViewDialogComponent } from '../../../notes/presentation/components/note-view-dialog/note-view-dialog.component';
import { passwordValidator } from '../../../../shared/validators/validators';
import { NotesFacade } from '../../../notes/application/notes.facade';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NotePreviewPipe,
    SpinnerComponent,
    EmptyStateComponent,
    NoteViewDialogComponent,
  ],
  template: `
    <div class="space-y-6">
      @if (facade.loading()) {
        <app-spinner />
      } @else {
        <div class="card p-6">
          <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold" style="background-color: var(--accent-light); color: var(--accent)">
              {{ userInitial() }}
            </div>
            <div class="text-center sm:text-left flex-1">
              <h1 class="text-xl font-bold" style="color: var(--text-primary)">{{ facade.perfil()?.nombre ?? 'Usuario' }}</h1>
              <p class="text-sm" style="color: var(--text-muted)">{{ facade.userEmail() }}</p>
              <div class="mt-2 flex items-center gap-4 text-sm" style="color: var(--text-muted)">
                <span>⭐ {{ facade.favoritesCount() }} favoritas</span>
              </div>
            </div>
            <div class="flex shrink-0 gap-2">
              <button (click)="showEditName = true" class="btn btn-secondary btn-sm">Editar nombre</button>
              <button (click)="showChangePassword = true" class="btn btn-secondary btn-sm">Cambiar contraseña</button>
            </div>
          </div>
        </div>

        @if (notesFacade.estadisticas(); as stats) {
          <div class="card p-6">
            <h2 class="mb-4 text-lg font-semibold" style="color: var(--text-primary)">Estadísticas</h2>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <div class="rounded-lg p-4 text-center" style="background: var(--bg-secondary)">
                <p class="text-2xl font-bold" style="color: var(--accent)">{{ stats.totalNotas }}</p>
                <p class="text-sm" style="color: var(--text-muted)">Total notas</p>
              </div>
              <div class="rounded-lg p-4 text-center" style="background: var(--bg-secondary)">
                <p class="text-2xl font-bold" style="color: var(--accent)">{{ facade.favoriteNotes().length }}</p>
                <p class="text-sm" style="color: var(--text-muted)">Favoritas</p>
              </div>
              @for (cat of categoriaKeys(stats.notasPorCategoria); track cat) {
                <div class="rounded-lg p-4 text-center" style="background: var(--bg-secondary)">
                  <p class="text-2xl font-bold" style="color: var(--accent)">{{ stats.notasPorCategoria[cat] }}</p>
                  <p class="text-sm" style="color: var(--text-muted)">{{ cat }}</p>
                </div>
              }
            </div>
          </div>
        }

        <div>
          <h2 class="mb-4 text-lg font-semibold" style="color: var(--text-primary)">Notas favoritas</h2>

          @if (facade.favoriteNotes().length === 0) {
            <app-empty-state icon="⭐" title="Sin notas favoritas" message="Marca tus notas favoritas desde el dashboard." />
          } @else {
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              @for (note of facade.favoriteNotes(); track note.id) {
                <div class="card note-card-hover cursor-pointer overflow-hidden p-0" (click)="facade.viewNote(note)">
                  <div class="p-5">
                    <div class="mb-3 flex items-start justify-between gap-2">
                      <h3 class="line-clamp-1 text-base font-semibold" style="color: var(--text-primary)">{{ note.titulo }}</h3>
                      <span class="shrink-0 text-sm" title="Favorita">⭐</span>
                    </div>
                    <p class="line-clamp-3 text-sm leading-relaxed" style="color: var(--text-secondary)">{{ note.contenido | notePreview:180 }}</p>
                  </div>
                  <div class="flex items-center gap-1 border-t px-4 py-2.5" style="border-color: var(--border-color); background-color: var(--bg-secondary)">
                    <button
                      (click)="onRemoveFavorite($event, note.id)"
                      class="card-action card-action--delete"
                    >
                      Quitar de favoritos
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      @if (facade.viewingNote(); as viewNote) {
        <app-note-view-dialog
          [note]="viewNote"
          (close)="facade.closeViewer()"
        />
      }

      @if (showEditName) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" style="background-color: rgba(0,0,0,0.5)" (click)="showEditName = false">
          <div class="card w-full max-w-md p-6" (click)="$event.stopPropagation()" role="dialog" aria-label="Editar nombre" aria-modal="true">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-lg font-bold" style="color: var(--text-primary)">Editar nombre</h2>
              <button (click)="showEditName = false" class="btn btn-ghost btn-sm" aria-label="Cerrar">✕</button>
            </div>

            <form [formGroup]="nameForm" (ngSubmit)="onUpdateName()" class="space-y-5">
              <div>
                <label for="perfil-nombre" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
                  Nombre <span style="color: var(--danger)">*</span>
                </label>
                <input
                  id="perfil-nombre"
                  type="text"
                  formControlName="nombre"
                  placeholder="Tu nombre"
                  minlength="3"
                  maxlength="40"
                  class="input-field"
                  [class.error]="nameForm.get('nombre')?.invalid && nameForm.get('nombre')?.touched"
                />
                @if (nameForm.get('nombre')?.invalid && nameForm.get('nombre')?.touched) {
                  <p class="mt-1 text-sm" style="color: var(--danger)">El nombre debe tener entre 3 y 40 caracteres</p>
                }
              </div>

              <div class="flex justify-end gap-3">
                <button type="button" (click)="showEditName = false" class="btn btn-secondary btn-md">Cancelar</button>
                <button type="submit" [disabled]="nameForm.invalid" class="btn btn-primary btn-md">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (showChangePassword) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" style="background-color: rgba(0,0,0,0.5)" (click)="showChangePassword = false">
          <div class="card w-full max-w-md p-6" (click)="$event.stopPropagation()" role="dialog" aria-label="Cambiar contraseña" aria-modal="true">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-lg font-bold" style="color: var(--text-primary)">Cambiar contraseña</h2>
              <button (click)="showChangePassword = false" class="btn btn-ghost btn-sm" aria-label="Cerrar">✕</button>
            </div>

            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-5">
              <div>
                <label for="pw-current" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
                  Contraseña actual <span style="color: var(--danger)">*</span>
                </label>
                <input
                  id="pw-current"
                  type="password"
                  formControlName="passwordActual"
                  placeholder="Tu contraseña actual"
                  class="input-field"
                  autocomplete="current-password"
                />
                @if (passwordForm.get('passwordActual')?.invalid && passwordForm.get('passwordActual')?.touched) {
                  <p class="mt-1 text-sm" style="color: var(--danger)">La contraseña actual es obligatoria</p>
                }
              </div>

              <div>
                <label for="pw-new" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
                  Nueva contraseña <span style="color: var(--danger)">*</span>
                </label>
                <input
                  id="pw-new"
                  type="password"
                  formControlName="nuevaPassword"
                  placeholder="Mínimo 8 caracteres"
                  class="input-field"
                  autocomplete="new-password"
                />
                @if (passwordForm.get('nuevaPassword')?.invalid && passwordForm.get('nuevaPassword')?.touched) {
                  <p class="mt-1 text-sm" style="color: var(--danger)">Debe incluir mayúscula, minúscula, número y carácter especial (8-64 chars)</p>
                }
              </div>

              <div>
                <label for="pw-confirm" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
                  Confirmar contraseña <span style="color: var(--danger)">*</span>
                </label>
                <input
                  id="pw-confirm"
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Repite tu nueva contraseña"
                  class="input-field"
                  autocomplete="new-password"
                />
                @if (passwordForm.errors?.['passwordMismatch'] && passwordForm.get('confirmPassword')?.touched) {
                  <p class="mt-1 text-sm" style="color: var(--danger)">Las contraseñas no coinciden</p>
                }
              </div>

              <div class="flex justify-end gap-3">
                <button type="button" (click)="showChangePassword = false" class="btn btn-secondary btn-md">Cancelar</button>
                <button type="submit" [disabled]="passwordForm.invalid" class="btn btn-primary btn-md">Cambiar contraseña</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProfilePageComponent implements OnInit {
  protected readonly facade = inject(ProfileFacade);
  protected readonly notesFacade = inject(NotesFacade);
  private readonly authFacade = inject(AuthFacade);
  private readonly fb = inject(FormBuilder);

  protected showEditName = false;
  protected showChangePassword = false;

  nameForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
  });

  passwordForm = this.fb.group(
    {
      passwordActual: ['', [Validators.required]],
      nuevaPassword: ['', [Validators.required, passwordValidator]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  userInitial = () => {
    const email = this.authFacade.currentUser()?.email ?? '';
    return email.charAt(0).toUpperCase();
  };

  ngOnInit(): void {
    this.facade.load();
    this.notesFacade.cargarEstadisticas();
    this.nameForm.patchValue({ nombre: this.facade.perfil()?.nombre ?? '' });
  }

  categoriaKeys(obj: Record<string, number>): string[] {
    return Object.keys(obj).filter((k) => obj[k] > 0);
  }

  onUpdateName(): void {
    if (this.nameForm.invalid) return;
    this.facade.updateName(this.nameForm.value.nombre ?? '');
    this.showEditName = false;
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;
    this.facade.changePassword(
      this.passwordForm.value.passwordActual ?? '',
      this.passwordForm.value.nuevaPassword ?? '',
    );
    this.showChangePassword = false;
    this.passwordForm.reset();
  }

  onRemoveFavorite(event: Event, noteId: number): void {
    event.stopPropagation();
    this.facade.removeFavorite(noteId);
  }

  private passwordMatchValidator(group: import('@angular/forms').AbstractControl): import('@angular/forms').ValidationErrors | null {
    const password = group.get('nuevaPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
}
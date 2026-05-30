import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProfileFacade } from '../../application/profile.facade';
import { AuthFacade } from '../../../../core/auth/application/auth.facade';
import { NotePreviewPipe } from '../../../../shared/pipes/note-preview.pipe';
import { SpinnerComponent } from '../../../../shared/ui/spinner.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state.component';
import { passwordValidator } from '../../../../shared/validators/validators';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NotePreviewPipe,
    SpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="space-y-6">
      @if (facade.loading()) {
        <app-spinner />
      } @else {
        <!-- Profile header -->
        <div class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
          <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-2xl font-bold text-[var(--color-primary-700)]">
              {{ userInitial() }}
            </div>
            <div class="text-center sm:text-left">
              <h1 class="text-xl font-bold text-[var(--color-on-surface)]">{{ facade.perfil()?.nombre ?? 'Usuario' }}</h1>
              <p class="text-sm text-[var(--color-on-surface-muted)]">{{ facade.userEmail() }}</p>
              <div class="mt-2 flex items-center gap-4 text-sm text-[var(--color-on-surface-muted)]">
                <span>⭐ {{ facade.favoritesCount() }} favoritas</span>
              </div>
            </div>
            <div class="flex gap-2 sm:ml-auto">
              <button
                (click)="showEditName = true"
                class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-alt)] transition-colors"
              >
                Editar nombre
              </button>
              <button
                (click)="showChangePassword = true"
                class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-alt)] transition-colors"
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>

        <!-- Favorites section -->
        <div>
          <h2 class="mb-4 text-lg font-semibold text-[var(--color-on-surface)]">Notas favoritas</h2>

          @if (facade.favoriteNotes().length === 0) {
            <app-empty-state
              icon="⭐"
              title="Sin notas favoritas"
              message="Marca tus notas favoritas desde el dashboard."
            />
          } @else {
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (note of facade.favoriteNotes(); track note.id) {
                <div class="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
                  <h3 class="mb-1 line-clamp-1 text-base font-semibold text-[var(--color-on-surface)]">{{ note.titulo }}</h3>
                  <p class="mb-4 flex-1 line-clamp-3 text-sm text-[var(--color-on-surface-muted)]">{{ note.contenido | notePreview:120 }}</p>
                  <div class="flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
                    <button
                      (click)="facade.removeFavorite(note.id)"
                      class="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors"
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

      <!-- Edit Name Dialog -->
      @if (showEditName) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="showEditName = false">
          <div
            class="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
            (click)="$event.stopPropagation()"
            role="dialog"
            aria-label="Editar nombre"
            aria-modal="true"
          >
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-[var(--color-on-surface)]">Editar nombre</h2>
              <button (click)="showEditName = false" class="rounded-[var(--radius-sm)] p-1 text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-alt)] transition-colors" aria-label="Cerrar">✕</button>
            </div>

            <form [formGroup]="nameForm" (ngSubmit)="onUpdateName()" class="space-y-4">
              <div>
                <label for="nombre" class="mb-1.5 block text-sm font-medium text-[var(--color-on-surface)]">
                  Nombre <span class="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  formControlName="nombre"
                  placeholder="Tu nombre"
                  minlength="3"
                  maxlength="40"
                  class="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                  [class.border-[var(--color-danger)]]="nameForm.get('nombre')?.invalid && nameForm.get('nombre')?.touched"
                />
                @if (nameForm.get('nombre')?.invalid && nameForm.get('nombre')?.touched) {
                  <p class="mt-1 text-sm text-[var(--color-danger)]">El nombre debe tener entre 3 y 40 caracteres</p>
                }
              </div>

              <div class="flex justify-end gap-3">
                <button type="button" (click)="showEditName = false" class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-alt)] transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="nameForm.invalid" class="rounded-[var(--radius-md)] bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] disabled:opacity-50 transition-colors">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Change Password Dialog -->
      @if (showChangePassword) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="showChangePassword = false">
          <div
            class="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
            (click)="$event.stopPropagation()"
            role="dialog"
            aria-label="Cambiar contraseña"
            aria-modal="true"
          >
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-[var(--color-on-surface)]">Cambiar contraseña</h2>
              <button (click)="showChangePassword = false" class="rounded-[var(--radius-sm)] p-1 text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-alt)] transition-colors" aria-label="Cerrar">✕</button>
            </div>

            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-4">
              <div>
                <label for="currentPassword" class="mb-1.5 block text-sm font-medium text-[var(--color-on-surface)]">
                  Contraseña actual <span class="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  formControlName="passwordActual"
                  placeholder="Tu contraseña actual"
                  class="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                  autocomplete="current-password"
                />
                @if (passwordForm.get('passwordActual')?.invalid && passwordForm.get('passwordActual')?.touched) {
                  <p class="mt-1 text-sm text-[var(--color-danger)]">La contraseña actual es obligatoria</p>
                }
              </div>

              <div>
                <label for="newPassword" class="mb-1.5 block text-sm font-medium text-[var(--color-on-surface)]">
                  Nueva contraseña <span class="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  id="newPassword"
                  type="password"
                  formControlName="nuevaPassword"
                  placeholder="Mínimo 8 caracteres"
                  class="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                  autocomplete="new-password"
                />
                @if (passwordForm.get('nuevaPassword')?.invalid && passwordForm.get('nuevaPassword')?.touched) {
                  <p class="mt-1 text-sm text-[var(--color-danger)]">Debe incluir mayúscula, minúscula, número y carácter especial (8-64 chars)</p>
                }
              </div>

              <div>
                <label for="confirmPassword" class="mb-1.5 block text-sm font-medium text-[var(--color-on-surface)]">
                  Confirmar contraseña <span class="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Repite tu nueva contraseña"
                  class="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                  autocomplete="new-password"
                />
                @if (passwordForm.errors?.['passwordMismatch'] && passwordForm.get('confirmPassword')?.touched) {
                  <p class="mt-1 text-sm text-[var(--color-danger)]">Las contraseñas no coinciden</p>
                }
              </div>

              <div class="flex justify-end gap-3">
                <button type="button" (click)="showChangePassword = false" class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-alt)] transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="passwordForm.invalid" class="rounded-[var(--radius-md)] bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] disabled:opacity-50 transition-colors">
                  Cambiar contraseña
                </button>
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
    this.nameForm.patchValue({ nombre: this.facade.perfil()?.nombre ?? '' });
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

  private passwordMatchValidator(group: import('@angular/forms').AbstractControl): import('@angular/forms').ValidationErrors | null {
    const password = group.get('nuevaPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
}
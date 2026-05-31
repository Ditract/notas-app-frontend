import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RichTextEditorComponent } from '../../../../../shared/ui/rich-text-editor.component';
import { APP_CONFIG, AppConfig } from '../../../../../core/config/app-config.token';

@Component({
  selector: 'app-note-editor-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RichTextEditorComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(0,0,0,0.5)" (click)="cancel.emit()">
      <div
        class="card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
        role="dialog"
        [attr.aria-label]="note() ? 'Editar nota' : 'Nueva nota'"
        aria-modal="true"
      >
        <div class="flex items-center justify-between border-b px-6 py-4" style="border-color: var(--border-color)">
          <h2 class="text-lg font-semibold" style="color: var(--text-primary)">
            {{ note() ? 'Editar nota' : 'Nueva nota' }}
          </h2>
          <button (click)="cancel.emit()" class="btn btn-ghost btn-sm" aria-label="Cerrar">✕</button>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label for="note-titulo" class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
              Título <span style="color: var(--danger)">*</span>
            </label>
            <input
              id="note-titulo"
              type="text"
              [formControl]="tituloControl"
              placeholder="Título de la nota"
              maxlength="255"
              class="input-field"
              [class.error]="tituloControl.invalid && tituloControl.touched"
            />
            @if (tituloControl.invalid && tituloControl.touched) {
              <p class="mt-1 text-sm" style="color: var(--danger)">El título es obligatorio (máximo 255 caracteres)</p>
            }
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium" style="color: var(--text-primary)">
              Contenido <span style="color: var(--danger)">*</span>
            </label>
            <app-rich-text-editor
              [value]="contenidoInitial"
              placeholder="Escribe el contenido de tu nota..."
              [charCountLimit]="10000"
              (valueChange)="onContenidoChange($event)"
            />
            @if (contenidoError) {
              <p class="mt-1 text-sm" style="color: var(--danger)">{{ contenidoError }}</p>
            }
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" (click)="cancel.emit()" class="btn btn-secondary btn-md">Cancelar</button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="tituloControl.invalid || !contenidoValue.trim()"
              class="btn btn-primary btn-md"
            >
              {{ note() ? 'Guardar cambios' : 'Crear nota' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NoteEditorDialogComponent {
  readonly note = input<{ id: number; titulo: string; contenido: string } | null>(null);
  readonly save = output<{ titulo: string; contenido: string }>();
  readonly cancel = output<void>();

  private readonly fb = inject(FormBuilder);

  tituloControl = this.fb.control(this.note()?.titulo ?? '', [Validators.required, Validators.maxLength(255)]);
  contenidoInitial = this.note()?.contenido ?? '';
  contenidoValue = this.note()?.contenido ?? '';
  contenidoError: string | null = null;

  onContenidoChange(html: string): void {
    this.contenidoValue = html;
    const plainText = html.replace(/<[^>]*>/g, '').trim();
    if (!plainText) {
      this.contenidoError = 'El contenido es obligatorio';
    } else if (plainText.length > 10000) {
      this.contenidoError = `El contenido no puede exceder 10,000 caracteres (${plainText.length})`;
    } else {
      this.contenidoError = null;
    }
  }

  onSubmit(): void {
    if (this.tituloControl.invalid || !this.contenidoValue.trim()) {
      this.tituloControl.markAsTouched();
      return;
    }
    this.save.emit({
      titulo: this.tituloControl.value ?? '',
      contenido: this.contenidoValue,
    });
  }
}
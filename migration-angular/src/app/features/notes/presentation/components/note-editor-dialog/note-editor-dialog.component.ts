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
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="cancel.emit()">
      <div
        class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]"
        (click)="$event.stopPropagation()"
        role="dialog"
        [attr.aria-label]="note() ? 'Editar nota' : 'Nueva nota'"
        aria-modal="true"
      >
        <div class="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 class="text-lg font-semibold text-[var(--color-on-surface)]">
            {{ note() ? 'Editar nota' : 'Nueva nota' }}
          </h2>
          <button
            (click)="cancel.emit()"
            class="rounded-[var(--radius-sm)] p-1 text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-alt)] transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label for="titulo" class="mb-1.5 block text-sm font-medium text-[var(--color-on-surface)]">
              Título <span class="text-[var(--color-danger)]">*</span>
            </label>
            <input
              id="titulo"
              type="text"
              [formControl]="tituloControl"
              placeholder="Título de la nota"
              maxlength="255"
              class="block w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
              [class.border-[var(--color-danger)]]="tituloControl.invalid && tituloControl.touched"
            />
            <div class="mt-1 flex justify-between">
              @if (tituloControl.invalid && tituloControl.touched) {
                <p class="text-xs text-[var(--color-danger)]">El título es obligatorio (máximo 255 caracteres)</p>
              }
              <p class="text-xs text-[var(--color-on-surface-muted)] ml-auto">{{ tituloControl.value?.length ?? 0 }}/255</p>
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-[var(--color-on-surface)]">
              Contenido <span class="text-[var(--color-danger)]">*</span>
            </label>
            <app-rich-text-editor
              [value]="contenidoInitial"
              placeholder="Escribe el contenido de tu nota..."
              [charCountLimit]="10000"
              (valueChange)="onContenidoChange($event)"
            />
            @if (contenidoError) {
              <p class="mt-1 text-xs text-[var(--color-danger)]">{{ contenidoError }}</p>
            }
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              (click)="cancel.emit()"
              class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="tituloControl.invalid || !contenidoValue.trim()"
              class="rounded-[var(--radius-md)] bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] disabled:opacity-50 transition-colors"
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
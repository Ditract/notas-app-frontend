import { Component, input, output, OnDestroy, OnInit, ElementRef, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="rich-text-editor rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div class="flex flex-wrap items-center gap-1 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1.5">
        <button (click)="toggleBold()" [class.is-active]="isActive('bold')" class="editor-btn" title="Negrita (Ctrl+B)"><b>B</b></button>
        <button (click)="toggleItalic()" [class.is-active]="isActive('italic')" class="editor-btn" title="Itálica (Ctrl+I)"><i>I</i></button>
        <button (click)="toggleUnderline()" [class.is-active]="isActive('underline')" class="editor-btn" title="Subrayado (Ctrl+U)"><u>U</u></button>
        <button (click)="toggleStrike()" [class.is-active]="isActive('strike')" class="editor-btn" title="Tachado"><s>S</s></button>
        <div class="mx-1 h-4 w-px bg-[var(--color-border)]"></div>
        <button (click)="toggleHeading(2)" [class.is-active]="isActive('heading', { level: 2 })" class="editor-btn" title="Título 2">H2</button>
        <button (click)="toggleHeading(3)" [class.is-active]="isActive('heading', { level: 3 })" class="editor-btn" title="Título 3">H3</button>
        <div class="mx-1 h-4 w-px bg-[var(--color-border)]"></div>
        <button (click)="toggleBulletList()" [class.is-active]="isActive('bulletList')" class="editor-btn" title="Lista">•</button>
        <button (click)="toggleOrderedList()" [class.is-active]="isActive('orderedList')" class="editor-btn" title="Lista numerada">1.</button>
        <button (click)="toggleBlockquote()" [class.is-active]="isActive('blockquote')" class="editor-btn" title="Cita">❝</button>
        <button (click)="toggleCodeBlock()" [class.is-active]="isActive('codeBlock')" class="editor-btn" title="Bloque de código">&lt;/&gt;</button>
        <div class="mx-1 h-4 w-px bg-[var(--color-border)]"></div>
        <button (click)="setAlign('left')" class="editor-btn" title="Alinear izquierda">◧</button>
        <button (click)="setAlign('center')" class="editor-btn" title="Centrar">▦</button>
        <button (click)="setAlign('right')" class="editor-btn" title="Alinear derecha">◨</button>
        <div class="mx-1 h-4 w-px bg-[var(--color-border)]"></div>
        <button (click)="toggleHighlight()" [class.is-active]="isActive('highlight')" class="editor-btn" title="Resaltar">🖍</button>
        <button (click)="clearMarks()" class="editor-btn" title="Limpiar formato">🧹</button>
      </div>

      <div #editorContainer class="tiptap-content min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 focus:outline-none" style="font-size: 14px;"></div>

      <div class="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-1 text-xs text-[var(--color-on-surface-muted)]">
        {{ charCount }} caracteres
      </div>
    </div>
  `,
  styles: [`
    .editor-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 500;
      color: var(--color-on-surface-muted);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background-color 0.15s, color 0.15s;
    }
    .editor-btn:hover {
      background: var(--color-surface);
      color: var(--color-on-surface);
    }
    .editor-btn.is-active {
      background: var(--color-primary-100);
      color: var(--color-primary-700);
    }
    :host ::ng-deep .ProseMirror {
      outline: none;
      min-height: 200px;
    }
    :host ::ng-deep .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: var(--color-on-surface-muted);
      pointer-events: none;
      height: 0;
    }
    :host ::ng-deep .ProseMirror h2 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.25rem; }
    :host ::ng-deep .ProseMirror h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
    :host ::ng-deep .ProseMirror ul, :host ::ng-deep .ProseMirror ol { padding-left: 1.5rem; margin: 0.5rem 0; }
    :host ::ng-deep .ProseMirror blockquote { border-left: 3px solid var(--color-primary-300); padding-left: 1rem; margin: 0.5rem 0; color: var(--color-on-surface-muted); }
    :host ::ng-deep .ProseMirror pre { background: var(--color-surface-alt); border-radius: var(--radius-md); padding: 0.75rem 1rem; margin: 0.5rem 0; overflow-x: auto; font-size: 0.85rem; }
    :host ::ng-deep .ProseMirror mark { background: var(--color-warning-light); padding: 0.1rem 0; }
  `],
})
export class RichTextEditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef<HTMLElement>;

  readonly value = input('');
  readonly placeholder = input('Escribe aquí...');
  readonly charCountLimit = input(10000);
  readonly valueChange = output<string>();

  editor!: Editor;
  charCount = 0;

  ngOnInit(): void {
    this.editor = new Editor({
      element: this.editorContainer.nativeElement,
      extensions: [
        StarterKit,
        Underline,
        Placeholder.configure({ placeholder: this.placeholder() }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        CharacterCount.configure({ limit: this.charCountLimit() }),
        Link.configure({ openOnClick: false }),
        Highlight,
      ],
      content: this.value(),
      onUpdate: ({ editor }) => {
        this.valueChange.emit(editor.getHTML());
        this.charCount = editor.storage.characterCount?.characters() ?? editor.getText().length;
      },
    });

    this.charCount = this.editor.storage.characterCount?.characters() ?? 0;
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  isActive(name: string, attrs?: Record<string, unknown>): boolean {
    return this.editor?.isActive(name, attrs) ?? false;
  }

  toggleBold(): void { this.editor.chain().focus().toggleBold().run(); }
  toggleItalic(): void { this.editor.chain().focus().toggleItalic().run(); }
  toggleUnderline(): void { this.editor.chain().focus().toggleUnderline().run(); }
  toggleStrike(): void { this.editor.chain().focus().toggleStrike().run(); }
  toggleHeading(level: number): void { this.editor.chain().focus().toggleHeading({ level: level as 2 | 3 }).run(); }
  toggleBulletList(): void { this.editor.chain().focus().toggleBulletList().run(); }
  toggleOrderedList(): void { this.editor.chain().focus().toggleOrderedList().run(); }
  toggleBlockquote(): void { this.editor.chain().focus().toggleBlockquote().run(); }
  toggleCodeBlock(): void { this.editor.chain().focus().toggleCodeBlock().run(); }
  setAlign(align: string): void { this.editor.chain().focus().setTextAlign(align).run(); }
  toggleHighlight(): void { this.editor.chain().focus().toggleHighlight().run(); }
  clearMarks(): void { this.editor.chain().focus().unsetAllMarks().run(); }
}
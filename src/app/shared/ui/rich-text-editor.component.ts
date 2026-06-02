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
    <div class="rte">
      <div class="rte-toolbar">
        <button (click)="toggleBold()" [class.rte-active]="isActive('bold')" class="rte-btn" title="Negrita (Ctrl+B)"><b>B</b></button>
        <button (click)="toggleItalic()" [class.rte-active]="isActive('italic')" class="rte-btn" title="Itálica (Ctrl+I)"><i>I</i></button>
        <button (click)="toggleUnderline()" [class.rte-active]="isActive('underline')" class="rte-btn" title="Subrayado (Ctrl+U)"><u>U</u></button>
        <button (click)="toggleStrike()" [class.rte-active]="isActive('strike')" class="rte-btn" title="Tachado"><s>S</s></button>
        <div class="rte-divider"></div>
        <button (click)="toggleHeading(2)" [class.rte-active]="isActive('heading', { level: 2 })" class="rte-btn" title="Título 2">H2</button>
        <button (click)="toggleHeading(3)" [class.rte-active]="isActive('heading', { level: 3 })" class="rte-btn" title="Título 3">H3</button>
        <div class="rte-divider"></div>
        <button (click)="toggleBulletList()" [class.rte-active]="isActive('bulletList')" class="rte-btn" title="Lista">•</button>
        <button (click)="toggleOrderedList()" [class.rte-active]="isActive('orderedList')" class="rte-btn" title="Lista numerada">1.</button>
        <button (click)="toggleBlockquote()" [class.rte-active]="isActive('blockquote')" class="rte-btn" title="Cita">❝</button>
        <button (click)="toggleCodeBlock()" [class.rte-active]="isActive('codeBlock')" class="rte-btn" title="Bloque de código">&lt;/&gt;</button>
        <div class="rte-divider"></div>
        <button (click)="setAlign('left')" class="rte-btn" title="Alinear izquierda">◧</button>
        <button (click)="setAlign('center')" class="rte-btn" title="Centrar">▦</button>
        <button (click)="setAlign('right')" class="rte-btn" title="Alinear derecha">◨</button>
        <div class="rte-divider"></div>
        <button (click)="toggleHighlight()" [class.rte-active]="isActive('highlight')" class="rte-btn" title="Resaltar">🖍</button>
        <button (click)="clearMarks()" class="rte-btn" title="Limpiar formato">🧹</button>
      </div>

      <div #editorContainer class="rte-content"></div>

      <div class="rte-footer">
        {{ charCount }} caracteres
      </div>
    </div>
  `,
  styles: [`
    .rte {
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg);
      overflow: hidden;
      transition: border-color 0.15s ease;
    }
    .rte:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(76,110,245,0.15);
    }

    .rte-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 6px 8px;
    }

    .rte-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background-color 0.15s, color 0.15s;
    }
    .rte-btn:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    .rte-btn.rte-active {
      background: var(--accent-light);
      color: var(--accent);
    }

    .rte-divider {
      width: 1px;
      height: 16px;
      background: var(--border-color);
      margin: 0 4px;
    }

    .rte-content {
      min-height: 200px;
      max-height: 400px;
      overflow-y: auto;
      padding: 12px 16px;
      font-size: 14px;
    }

    .rte-footer {
      border-top: 1px solid var(--border-color);
      background: var(--bg-secondary);
      padding: 4px 12px;
      font-size: 12px;
      color: var(--text-muted);
    }

    :host ::ng-deep .ProseMirror {
      outline: none;
      min-height: 200px;
    }
    :host ::ng-deep .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: var(--text-muted);
      pointer-events: none;
      height: 0;
    }
    :host ::ng-deep .ProseMirror h2 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.25rem; color: var(--text-primary); }
    :host ::ng-deep .ProseMirror h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; color: var(--text-primary); }
    :host ::ng-deep .ProseMirror ul, :host ::ng-deep .ProseMirror ol { padding-left: 1.5rem; margin: 0.5rem 0; }
    :host ::ng-deep .ProseMirror blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; margin: 0.5rem 0; color: var(--text-secondary); }
    :host ::ng-deep .ProseMirror pre { background: var(--bg-secondary); border-radius: var(--radius-md); padding: 0.75rem 1rem; margin: 0.5rem 0; overflow-x: auto; font-size: 0.85rem; }
    :host ::ng-deep .ProseMirror mark { background: var(--warning-light); padding: 0.1rem 0; }
    :host ::ng-deep .ProseMirror a { color: var(--accent); }
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
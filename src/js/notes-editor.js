// notes-editor.js - Gestión de los editores Quill (crear y editar)

const NotesEditor = {
    quill: null,
    editQuill: null,

    init() {
        this.initQuillEditor();
        this.initEditQuillEditor();
    },

    initQuillEditor() {
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
        ];

        this.quill = new Quill('#quill-editor', {
            theme: 'snow',
            placeholder: 'Escribe tu nota aquí...',
            modules: {
                toolbar: toolbarOptions
            }
        });

        this.quill.on('text-change', () => {
            const content = this.quill.root.innerHTML;
            const noteContentEl = document.getElementById('noteContent');
            if (noteContentEl) noteContentEl.value = content;
            ErrorManager.hide('contenidoError');
        });
    },

    initEditQuillEditor() {
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
        ];

        this.editQuill = new Quill('#edit-quill-editor', {
            theme: 'snow',
            placeholder: 'Edita tu nota aquí...',
            modules: {
                toolbar: toolbarOptions
            }
        });

        this.editQuill.on('text-change', () => {
            const content = this.editQuill.root.innerHTML;
            const editNoteContentEl = document.getElementById('editNoteContent');
            if (editNoteContentEl) editNoteContentEl.value = content;
            ErrorManager.hide('editContenidoError');
        });
    },

    clearEditor() {
        if (this.quill) {
            this.quill.setContents([]);
            const noteContentEl = document.getElementById('noteContent');
            if (noteContentEl) noteContentEl.value = '';
        }
    },

    clearEditEditor() {
        if (this.editQuill) {
            this.editQuill.setContents([]);
            const editNoteContentEl = document.getElementById('editNoteContent');
            if (editNoteContentEl) editNoteContentEl.value = '';
        }
    },

    getEditorTextContent() {
        return this.quill ? this.quill.getText().trim() : '';
    },

    getEditorHtmlContent() {
        return this.quill ? this.quill.root.innerHTML : '';
    },

    getEditEditorTextContent() {
        return this.editQuill ? this.editQuill.getText().trim() : '';
    },

    getEditEditorHtmlContent() {
        return this.editQuill ? this.editQuill.root.innerHTML : '';
    },

    loadContentIntoEditEditor(htmlContent) {
        if (this.editQuill && htmlContent) {
            const delta = this.editQuill.clipboard.convert(htmlContent);
            this.editQuill.setContents(delta);
        }
    }
};

window.NotesEditor = NotesEditor;
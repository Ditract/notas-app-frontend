// notes.js - Manejo de notas con Quill Editor (crear, leer, actualizar, eliminar)

const NotesManager = {
    token: null,
    quill: null, // Instancia del editor Quill

    init() {
        this.token = TokenManager.get();
        if (!this.token) {
            console.warn('No se encontró token, redirigiendo a login...');
            window.location.href = 'login.html';
            return;
        }

        this.initQuillEditor();
        this.initForm();
        this.initSearch();
        this.loadNotes();
    },

    // --- Inicializar Quill Editor ---
    initQuillEditor() {
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean'] // remove formatting button
        ];

        this.quill = new Quill('#quill-editor', {
            theme: 'snow',
            placeholder: 'Escribe tu nota aquí...',
            modules: {
                toolbar: toolbarOptions
            }
        });

        // Listener para sincronizar el contenido con el input oculto
        this.quill.on('text-change', () => {
            const content = this.quill.root.innerHTML;
            document.getElementById('noteContent').value = content;

            // Limpiar errores cuando el usuario comience a escribir
            ErrorManager.hide('contenidoError');
        });
    },

    // --- Función para limpiar el editor ---
    clearEditor() {
        if (this.quill) {
            this.quill.setContents([]);
            document.getElementById('noteContent').value = '';
        }
    },

    // --- Función para obtener el contenido como texto plano para validación ---
    getEditorTextContent() {
        return this.quill ? this.quill.getText().trim() : '';
    },

    // --- Función para obtener el contenido HTML ---
    getEditorHtmlContent() {
        return this.quill ? this.quill.root.innerHTML : '';
    },

    // --- Función para convertir HTML a texto plano para búsqueda ---
    stripHtml(html) {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    },

    // --- Cargar notas ---
    async loadNotes() {
        try {
            console.log('Enviando petición a /api/notas con token:', this.token);
            const response = await fetch(`${CONFIG.API_BASE_URL}/notas`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Status response notas:', response.status);

            if (!response.ok) {
                const text = await response.text();
                console.error('Respuesta del backend:', text);
                if (response.status === 401) {
                    ErrorManager.show('errorMessage', 'Sesión expirada o token inválido. Por favor, inicia sesión nuevamente.');
                    setTimeout(() => {
                        TokenManager.clear();
                        window.location.href = 'login.html';
                    }, 2000);
                    return;
                }
                throw new Error(`Error al cargar las notas (status ${response.status})`);
            }

            const notes = await response.json();
            this.renderNotes(notes);
        } catch (error) {
            console.error('Error al cargar notas:', error);
            ErrorManager.show('errorMessage', error.message);
        }
    },

    // --- Renderizar notas ---
    renderNotes(notes) {
        const notesList = document.getElementById('notesList');
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        if (!notesList) {
            console.error('Elemento notesList no encontrado');
            return;
        }

        notesList.innerHTML = '';

        // Filtrar notas si hay término de búsqueda
        const filteredNotes = notes.filter(note => {
            if (!searchTerm) return true;

            const titleMatch = note.titulo.toLowerCase().includes(searchTerm);
            // Convertir HTML a texto plano para búsqueda
            const contentText = this.stripHtml(note.contenido);
            const contentMatch = contentText.toLowerCase().includes(searchTerm);

            return titleMatch || contentMatch;
        });

        if (filteredNotes.length === 0) {
            notesList.innerHTML = `
                <div class="list-group-item text-center py-4">
                    <i class="bi bi-journal-x fs-1 text-muted mb-3"></i>
                    <p class="text-muted mb-0">
                        ${searchTerm ? 'No se encontraron notas que coincidan con tu búsqueda.' : 'No tienes notas aún. ¡Crea tu primera nota!'}
                    </p>
                </div>
            `;
            return;
        }

        filteredNotes.forEach(note => {
            console.log('Generando nota con ID:', note.id);
            const noteItem = document.createElement('div');
            noteItem.className = 'list-group-item d-flex justify-content-between align-items-start';

            // Crear vista previa mejorada con contenido HTML
            const previewData = this.createNotePreview(note.titulo, note.contenido);

            // Escapar HTML para prevenir problemas en los atributos
            const escapedTitle = escapeHtml(previewData.fullTitle);
            const escapedContent = note.contenido; // Mantener HTML para el modal

            noteItem.innerHTML = `
                <div class="flex-grow-1 me-3">
                    <div class="note-preview" 
                         data-bs-toggle="modal" 
                         data-bs-target="#noteModal" 
                         data-title="${escapedTitle}" 
                         data-content="${escapedContent}" 
                         data-is-html="true">
                        <strong class="d-block mb-1">${escapeHtml(previewData.title)}</strong>
                        <span class="text-muted">${escapeHtml(previewData.preview)}</span>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm delete-note" 
                        data-note-id="${note.id}" 
                        title="Eliminar nota">
                    <i class="bi bi-trash"></i>
                </button>
            `;

            notesList.appendChild(noteItem);
        });
    },

    // --- Crear vista previa de la nota ---
    createNotePreview(title, htmlContent) {
        const maxTitleLength = 50;
        const maxPreviewLength = 100;

        // Convertir HTML a texto plano para la vista previa
        const plainTextContent = this.stripHtml(htmlContent);

        const truncatedTitle = title.length > maxTitleLength
            ? title.substring(0, maxTitleLength) + '...'
            : title;

        const truncatedPreview = plainTextContent.length > maxPreviewLength
            ? plainTextContent.substring(0, maxPreviewLength) + '...'
            : plainTextContent;

        return {
            title: truncatedTitle,
            preview: truncatedPreview,
            fullTitle: title,
            fullContent: htmlContent
        };
    },

    // --- Inicializar formulario ---
    initForm() {
        const noteForm = document.getElementById('noteForm');
        if (noteForm) {
            noteForm.addEventListener('submit', this.handleAddNote.bind(this));
        }
    },

    // --- Manejar agregar nota ---
    async handleAddNote(e) {
        e.preventDefault();
        ErrorManager.hide('errorMessage');
        ErrorManager.hide('tituloError');
        ErrorManager.hide('contenidoError');

        const title = document.getElementById('noteTitle').value;
        const htmlContent = this.getEditorHtmlContent();
        const textContent = this.getEditorTextContent();

        // Validación del lado del cliente
        const validation = Validators.validateForm({
            titulo: {
                value: title,
                rules: [
                    { test: (val) => val.trim() !== '', message: 'El título es obligatorio' },
                    {
                        test: (val) => val.trim().length <= CONFIG.VALIDATION.TITLE_MAX_LENGTH,
                        message: `El título no puede exceder ${CONFIG.VALIDATION.TITLE_MAX_LENGTH} caracteres`
                    }
                ]
            },
            contenido: {
                value: textContent, // Validar longitud usando texto plano
                rules: [
                    { test: (val) => val.trim() !== '', message: 'El contenido es obligatorio' },
                    {
                        test: (val) => val.trim().length <= CONFIG.VALIDATION.CONTENT_MAX_LENGTH,
                        message: `El contenido no puede exceder ${CONFIG.VALIDATION.CONTENT_MAX_LENGTH} caracteres`
                    }
                ]
            }
        });

        if (!validation.isValid) {
            Object.entries(validation.errors).forEach(([field, message]) => {
                ErrorManager.show(`${field}Error`, message);
            });
            console.log('Validación del cliente fallida, no se envía la solicitud');
            return;
        }

        try {
            console.log('Enviando nota con token:', this.token);
            const response = await fetch(`${CONFIG.API_BASE_URL}/notas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ titulo: title, contenido: htmlContent })
            });

            console.log('Status response agregar nota:', response.status);

            if (!response.ok) {
                const responseText = await response.text();
                console.error('Respuesta backend agregar nota:', responseText);
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    errorData = { message: `Error ${response.status}: No se pudo procesar la respuesta` };
                }
                if (response.status === 401) {
                    ErrorManager.show('errorMessage', 'Sesión expirada o token inválido. Por favor, inicia sesión nuevamente.');
                    setTimeout(() => {
                        TokenManager.clear();
                        window.location.href = 'login.html';
                    }, 2000);
                    return;
                }
                if (errorData.validationErrors) {
                    Object.entries(errorData.validationErrors).forEach(([field, message]) => {
                        const errorElement = document.getElementById(`${field}Error`);
                        if (errorElement) {
                            errorElement.textContent = message;
                            errorElement.classList.remove('d-none');
                        } else {
                            ErrorManager.show('errorMessage', message);
                        }
                    });
                } else {
                    ErrorManager.show('errorMessage', errorData.message || `Error ${response.status}: No se pudo agregar la nota`);
                }
                return;
            }

            // Limpiar formulario después del éxito
            document.getElementById('noteTitle').value = '';
            this.clearEditor();
            this.loadNotes();
        } catch (error) {
            console.error('Error al agregar nota:', error);
            ErrorManager.show('errorMessage', error.message || 'Ocurrió un error al agregar la nota');
        }
    },

    // --- Eliminar nota ---
    async deleteNote(noteId) {
        try {
            console.log('Eliminando nota con ID:', noteId);
            const response = await fetch(`${CONFIG.API_BASE_URL}/notas/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
            if (!response.ok) {
                const text = await response.text();
                console.error('Respuesta backend eliminar nota:', text);
                if (response.status === 401) {
                    ErrorManager.show('errorMessage', 'Sesión expirada o token inválido. Por favor, inicia sesión nuevamente.');
                    setTimeout(() => {
                        TokenManager.clear();
                        window.location.href = 'login.html';
                    }, 2000);
                    return false;
                }
                throw new Error(`Error al eliminar la nota (status ${response.status})`);
            }
            console.log('Nota eliminada con éxito, ID:', noteId);
            return true;
        } catch (error) {
            console.error('Error al eliminar nota:', error);
            ErrorManager.show('errorMessage', error.message);
            return false;
        }
    },

    // --- Inicializar búsqueda ---
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.loadNotes();
            });
        }
    }
};

// Exportar para uso global
window.NotesManager = NotesManager;
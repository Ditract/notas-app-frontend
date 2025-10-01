// notes.js - Manejo de notas con Quill Editor (crear, leer, actualizar, eliminar)

const NotesManager = {
    token: null,
    quill: null,
    editQuill: null,
    favorites: new Set(),
    currentEditingNoteId: null,
    notesCache: [], // Cache para almacenar las notas cargadas

    init() {
        this.token = TokenManager.get();
        if (!this.token) {
            console.warn('No se encontró token, redirigiendo a login...');
            window.location.href = 'login.html';
            return;
        }

        this.initQuillEditor();
        this.initEditQuillEditor();
        this.initForm();
        this.initEditForm();
        this.initSearch();
        this.loadFavorites().then(() => {
            this.loadNotes();
        });
    },

    async loadFavorites() {
        try {
            console.log('Cargando perfil con token:', this.token);
            const response = await fetch(`${CONFIG.API_BASE_URL}/perfiles/mi-perfil`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Respuesta del backend perfil:', text);
                if (response.status === 401) {
                    ErrorManager.show('errorMessage', 'Sesión expirada o token inválido. Por favor, inicia sesión nuevamente.');
                    setTimeout(() => {
                        TokenManager.clear();
                        window.location.href = 'login.html';
                    }, 2000);
                    return;
                }
                throw new Error(`Error al cargar perfil (status ${response.status})`);
            }

            const data = await response.json();
            this.favorites = new Set(data.notasFavoritas || []);
            console.log('Favoritos cargados:', Array.from(this.favorites));
        } catch (error) {
            console.error('Error al cargar favoritos:', error);
            this.favorites = new Set();
        }
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

    stripHtml(html) {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    },

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
            this.notesCache = notes; // Guardar en cache
            this.renderNotes(notes);
        } catch (error) {
            console.error('Error al cargar notas:', error);
            ErrorManager.show('errorMessage', error.message);
        }
    },

    renderNotes(notes) {
        const notesList = document.getElementById('notesList');
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        if (!notesList) {
            console.error('Elemento notesList no encontrado');
            return;
        }

        notesList.innerHTML = '';

        const filteredNotes = notes.filter(note => {
            if (!searchTerm) return true;
            const titleMatch = (note.titulo || '').toLowerCase().includes(searchTerm);
            const contentText = this.stripHtml(note.contenido || '');
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
            const isFavorite = this.favorites.has(note.id);
            const noteItem = document.createElement('div');
            noteItem.className = 'list-group-item d-flex justify-content-between align-items-center';

            const previewData = this.createNotePreview(note.titulo, note.contenido);
            const escapedTitle = escapeHtml(previewData.fullTitle || '');

            noteItem.innerHTML = `
                <div class="flex-grow-1 me-3 note-content-wrapper">
                    <div class="note-preview" 
                         data-bs-toggle="modal" 
                         data-bs-target="#noteModal" 
                         data-title="${escapedTitle}" 
                         data-is-html="true">
                        <strong class="d-block mb-1">${escapeHtml(previewData.title)}</strong>
                        <span class="text-muted">${escapeHtml(previewData.preview)}</span>
                    </div>
                </div>
                <div class="note-actions d-flex gap-2">
                    <button class="btn btn-sm favorite-btn ${isFavorite ? 'btn-warning' : 'btn-outline-secondary'}" 
                            data-note-id="${note.id}" 
                            title="${isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                        <i class="bi ${isFavorite ? 'bi-star-fill' : 'bi-star'}"></i>
                    </button>
                    <button class="btn btn-primary btn-sm edit-note" 
                            data-note-id="${note.id}" 
                            data-note-title="${escapedTitle}"
                            title="Editar nota">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-note" 
                            data-note-id="${note.id}" 
                            title="Eliminar nota">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;

            const previewEl = noteItem.querySelector('.note-preview');
            if (previewEl) {
                previewEl.noteContent = note.contenido || '';
            }

            const editButton = noteItem.querySelector('.edit-note');
            if (editButton) {
                editButton.noteContent = note.contenido || '';
            }

            notesList.appendChild(noteItem);
        });
    },

    createNotePreview(title, htmlContent) {
        const maxTitleLength = 50;
        const maxPreviewLength = 100;
        const plainTextContent = this.stripHtml(htmlContent || '');

        const truncatedTitle = (title || '').length > maxTitleLength
            ? title.substring(0, maxTitleLength) + '...'
            : (title || '');

        const truncatedPreview = plainTextContent.length > maxPreviewLength
            ? plainTextContent.substring(0, maxPreviewLength) + '...'
            : plainTextContent;

        return {
            title: truncatedTitle,
            preview: truncatedPreview,
            fullTitle: title || '',
            fullContent: htmlContent || ''
        };
    },

    initForm() {
        const noteForm = document.getElementById('noteForm');
        if (noteForm) {
            noteForm.addEventListener('submit', this.handleAddNote.bind(this));
        }
    },

    initEditForm() {
        const editNoteForm = document.getElementById('editNoteForm');
        if (editNoteForm) {
            editNoteForm.addEventListener('submit', this.handleEditNote.bind(this));
        }
    },

    async handleAddNote(e) {
        e.preventDefault();
        ErrorManager.hide('errorMessage');
        ErrorManager.hide('tituloError');
        ErrorManager.hide('contenidoError');

        const titleEl = document.getElementById('noteTitle');
        const title = titleEl ? titleEl.value : '';
        const htmlContent = this.getEditorHtmlContent();
        const textContent = this.getEditorTextContent();

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
                value: textContent,
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

            const titleInput = document.getElementById('noteTitle');
            if (titleInput) titleInput.value = '';
            this.clearEditor();
            this.loadNotes();
        } catch (error) {
            console.error('Error al agregar nota:', error);
            ErrorManager.show('errorMessage', error.message || 'Ocurrió un error al agregar la nota');
        }
    },

    async handleEditNote(e) {
        e.preventDefault();
        ErrorManager.hide('editErrorMessage');
        ErrorManager.hide('editTituloError');
        ErrorManager.hide('editContenidoError');

        const titleEl = document.getElementById('editNoteTitle');
        const title = titleEl ? titleEl.value : '';
        const htmlContent = this.getEditEditorHtmlContent();
        const textContent = this.getEditEditorTextContent();

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
                value: textContent,
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
                ErrorManager.show(`edit${field.charAt(0).toUpperCase() + field.slice(1)}Error`, message);
            });
            console.log('Validación del cliente fallida, no se envía la solicitud');
            return;
        }

        try {
            console.log('Editando nota con ID:', this.currentEditingNoteId);
            const response = await fetch(`${CONFIG.API_BASE_URL}/notas/${this.currentEditingNoteId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ titulo: title, contenido: htmlContent })
            });

            console.log('Status response editar nota:', response.status);

            if (!response.ok) {
                const responseText = await response.text();
                console.error('Respuesta backend editar nota:', responseText);
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    errorData = { message: `Error ${response.status}: No se pudo procesar la respuesta` };
                }
                if (response.status === 401) {
                    ErrorManager.show('editErrorMessage', 'Sesión expirada o token inválido. Por favor, inicia sesión nuevamente.');
                    setTimeout(() => {
                        TokenManager.clear();
                        window.location.href = 'login.html';
                    }, 2000);
                    return;
                }
                if (errorData.validationErrors) {
                    Object.entries(errorData.validationErrors).forEach(([field, message]) => {
                        const errorElement = document.getElementById(`edit${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
                        if (errorElement) {
                            errorElement.textContent = message;
                            errorElement.classList.remove('d-none');
                        } else {
                            ErrorManager.show('editErrorMessage', message);
                        }
                    });
                } else {
                    ErrorManager.show('editErrorMessage', errorData.message || `Error ${response.status}: No se pudo editar la nota`);
                }
                return;
            }

            const editModal = document.getElementById('editNoteModal');
            const modalInstance = bootstrap.Modal.getInstance(editModal);
            if (modalInstance) {
                modalInstance.hide();
            }
            this.loadNotes();
        } catch (error) {
            console.error('Error al editar nota:', error);
            ErrorManager.show('editErrorMessage', error.message || 'Ocurrió un error al editar la nota');
        }
    },

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

    async addToFavorites(noteId) {
        try {
            console.log('Agregando nota a favoritos, ID:', noteId);
            const response = await fetch(`${CONFIG.API_BASE_URL}/perfiles/favoritas/${noteId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Respuesta backend agregar favorita:', text);
                if (response.status === 401) {
                    ErrorManager.show('errorMessage', 'Sesión expirada o token inválido.');
                    setTimeout(() => {
                        TokenManager.clear();
                        window.location.href = 'login.html';
                    }, 2000);
                    return false;
                }
                throw new Error(`Error al agregar favorita (status ${response.status})`);
            }

            console.log('Nota agregada a favoritos exitosamente');
            return true;
        } catch (error) {
            console.error('Error al agregar favorita:', error);
            ErrorManager.show('errorMessage', error.message);
            return false;
        }
    },

    async removeFromFavorites(noteId) {
        try {
            console.log('Quitando nota de favoritos, ID:', noteId);
            const response = await fetch(`${CONFIG.API_BASE_URL}/perfiles/favoritas/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Respuesta backend quitar favorita:', text);
                if (response.status === 401) {
                    ErrorManager.show('errorMessage', 'Sesión expirada o token inválido.');
                    setTimeout(() => {
                        TokenManager.clear();
                        window.location.href = 'login.html';
                    }, 2000);
                    return false;
                }
                throw new Error(`Error al quitar favorita (status ${response.status})`);
            }

            console.log('Nota quitada de favoritos exitosamente');
            return true;
        } catch (error) {
            console.error('Error al quitar favorita:', error);
            ErrorManager.show('errorMessage', error.message);
            return false;
        }
    },

    initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.loadNotes();
            });
        }
    },

    getNoteById(noteId) {
        return this.notesCache.find(note => note.id === parseInt(noteId));
    }
};

window.NotesManager = NotesManager;
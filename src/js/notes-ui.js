// notes-ui.js
document.addEventListener('DOMContentLoaded', () => {
    // Modal para ver nota completa
    const noteModal = document.getElementById('noteModal');
    if (noteModal) {
        noteModal.addEventListener('show.bs.modal', (event) => {
            console.log('Abriendo modal de visualización de nota');
            const triggerButton = event.relatedTarget;
            const title = triggerButton.getAttribute('data-title');
            const content = triggerButton.noteContent;
            const isHtml = triggerButton.getAttribute('data-is-html') === 'true';

            const modalTitle = document.getElementById('noteModalLabel');
            modalTitle.textContent = title;

            const modalBody = document.getElementById('modalNoteContent');

            if (isHtml && content) {
                modalBody.innerHTML = sanitizeHtml(content);
            } else {
                const sanitizedContent = (content || '')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\n/g, '<br>');
                modalBody.innerHTML = sanitizedContent;
            }
        });
    }

    // Modal para editar nota - Limpiar al cerrar
    const editNoteModal = document.getElementById('editNoteModal');
    if (editNoteModal) {
        editNoteModal.addEventListener('hidden.bs.modal', () => {
            console.log('Cerrando modal de edición');
            NotesManager.currentEditingNoteId = null;
            const editNoteTitleInput = document.getElementById('editNoteTitle');
            if (editNoteTitleInput) {
                editNoteTitleInput.value = '';
            }
            NotesManager.clearEditEditor();
            ErrorManager.hide('editErrorMessage');
            ErrorManager.hide('editTituloError');
            ErrorManager.hide('editContenidoError');
        });
    }

    // Modal para confirmar eliminación
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    if (confirmDeleteModal) {
        const notesList = document.getElementById('notesList');
        if (notesList) {
            // Manejar eliminación
            notesList.addEventListener('click', (event) => {
                const deleteButton = event.target.closest('.delete-note');
                if (deleteButton) {
                    console.log('Clic en botón Eliminar detectado');
                    const noteId = deleteButton.getAttribute('data-note-id');
                    console.log('ID de la nota a eliminar:', noteId);
                    const confirmButton = document.getElementById('confirmDeleteButton');
                    confirmButton.onclick = async () => {
                        console.log('Confirmando eliminación de nota con ID:', noteId);
                        const success = await NotesManager.deleteNote(noteId);
                        if (success) {
                            console.log('Nota eliminada, actualizando lista');
                            bootstrap.Modal.getInstance(confirmDeleteModal).hide();
                            NotesManager.loadNotes();
                        }
                    };
                    new bootstrap.Modal(confirmDeleteModal).show();
                }
            });

            // Manejar favoritos (toggle)
            notesList.addEventListener('click', async (event) => {
                const favoriteButton = event.target.closest('.favorite-btn');
                if (favoriteButton) {
                    event.preventDefault();
                    const noteId = parseInt(favoriteButton.getAttribute('data-note-id'));
                    console.log('Clic en botón de favoritos, ID:', noteId);

                    const isFavorite = NotesManager.favorites.has(noteId);
                    let success;

                    if (isFavorite) {
                        success = await NotesManager.removeFromFavorites(noteId);
                        if (success) {
                            NotesManager.favorites.delete(noteId);
                            favoriteButton.classList.remove('btn-warning');
                            favoriteButton.classList.add('btn-outline-secondary');
                            const icon = favoriteButton.querySelector('i');
                            icon.classList.remove('bi-star-fill');
                            icon.classList.add('bi-star');
                            favoriteButton.title = 'Agregar a favoritos';
                        }
                    } else {
                        success = await NotesManager.addToFavorites(noteId);
                        if (success) {
                            NotesManager.favorites.add(noteId);
                            favoriteButton.classList.remove('btn-outline-secondary');
                            favoriteButton.classList.add('btn-warning');
                            const icon = favoriteButton.querySelector('i');
                            icon.classList.remove('bi-star');
                            icon.classList.add('bi-star-fill');
                            favoriteButton.title = 'Quitar de favoritos';
                        }
                    }
                }
            });

            // Manejar editar - Abre el modal de edición
            notesList.addEventListener('click', (event) => {
                const editButton = event.target.closest('.edit-note');
                if (editButton) {
                    event.preventDefault();
                    const noteId = editButton.getAttribute('data-note-id');
                    console.log('Editar nota ID:', noteId);

                    // Guardar el ID antes de abrir el modal
                    NotesManager.currentEditingNoteId = noteId;

                    // Obtener la nota del cache y cargar los datos
                    const note = NotesManager.getNoteById(noteId);

                    console.log('Nota completa del cache:', note);

                    if (note) {
                        const editNoteTitleInput = document.getElementById('editNoteTitle');
                        if (editNoteTitleInput) {
                            editNoteTitleInput.value = note.titulo || '';
                            console.log('Título cargado:', note.titulo);
                        }

                        if (NotesManager.editQuill && note.contenido) {
                            const delta = NotesManager.editQuill.clipboard.convert(note.contenido);
                            NotesManager.editQuill.setContents(delta);
                            console.log('Contenido cargado en el editor de edición');
                        }
                    }

                    ErrorManager.hide('editErrorMessage');
                    ErrorManager.hide('editTituloError');
                    ErrorManager.hide('editContenidoError');

                    const editModal = new bootstrap.Modal(document.getElementById('editNoteModal'));
                    editModal.show();
                }
            });
        }
    }
});

function sanitizeHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span'];
    const allowedAttributes = ['class', 'style'];

    function cleanElement(element) {
        const tagName = element.tagName.toLowerCase();

        if (!allowedTags.includes(tagName)) {
            return document.createTextNode(element.textContent);
        }

        const cleanEl = document.createElement(tagName);

        for (const attr of element.attributes) {
            if (allowedAttributes.includes(attr.name.toLowerCase())) {
                if (attr.name.toLowerCase() === 'style') {
                    const safeStyle = sanitizeStyle(attr.value);
                    if (safeStyle) {
                        cleanEl.setAttribute('style', safeStyle);
                    }
                } else {
                    cleanEl.setAttribute(attr.name, attr.value);
                }
            }
        }

        for (const child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                cleanEl.appendChild(child.cloneNode(true));
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const cleanChild = cleanElement(child);
                if (cleanChild) {
                    cleanEl.appendChild(cleanChild);
                }
            }
        }

        return cleanEl;
    }

    const result = document.createElement('div');
    for (const child of temp.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            result.appendChild(child.cloneNode(true));
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            const cleanChild = cleanElement(child);
            if (cleanChild) {
                result.appendChild(cleanChild);
            }
        }
    }

    return result.innerHTML;
}

function sanitizeStyle(styleStr) {
    const allowedProperties = [
        'color', 'background-color', 'font-weight', 'font-style',
        'text-decoration', 'text-align', 'font-size', 'line-height'
    ];

    const styles = styleStr.split(';').map(s => s.trim()).filter(s => s);
    const safeStyles = [];

    for (const style of styles) {
        const [property, value] = style.split(':').map(s => s.trim());

        if (property && value && allowedProperties.includes(property.toLowerCase())) {
            if (!value.toLowerCase().includes('javascript:') &&
                !value.toLowerCase().includes('expression(') &&
                !value.toLowerCase().includes('url(javascript:)')) {
                safeStyles.push(`${property}: ${value}`);
            }
        }
    }

    return safeStyles.join('; ');
}
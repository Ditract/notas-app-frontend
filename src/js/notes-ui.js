document.addEventListener('DOMContentLoaded', () => {
    // Modal para ver nota completa
    const noteModal = document.getElementById('noteModal');
    if (noteModal) {
        noteModal.addEventListener('show.bs.modal', (event) => {
            console.log('Abriendo modal de visualización de nota');
            const triggerButton = event.relatedTarget;
            const title = triggerButton.getAttribute('data-title');
            const content = triggerButton.getAttribute('data-content');
            const isHtml = triggerButton.getAttribute('data-is-html') === 'true';

            // Establecer título con manejo de overflow
            const modalTitle = document.getElementById('noteModalLabel');
            modalTitle.textContent = title;

            // Establecer contenido
            const modalBody = document.getElementById('modalNoteContent');

            if (isHtml && content) {
                // Si el contenido es HTML (notas creadas con Quill), renderizarlo directamente
                // pero sanitizarlo para seguridad
                modalBody.innerHTML = sanitizeHtml(content);
            } else {
                // Para notas antiguas o contenido de texto plano, convertir saltos de línea
                const sanitizedContent = content
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\n/g, '<br>');
                modalBody.innerHTML = sanitizedContent;
            }
        });
    } else {
        console.error('Elemento noteModal no encontrado');
    }

    // Modal para confirmar eliminación
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    if (confirmDeleteModal) {
        const notesList = document.getElementById('notesList');
        if (notesList) {
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
                        } else {
                            console.error('Fallo al eliminar la nota con ID:', noteId);
                        }
                    };
                    try {
                        new bootstrap.Modal(confirmDeleteModal).show();
                        console.log('Modal de confirmación abierto');
                    } catch (error) {
                        console.error('Error al abrir el modal de confirmación:', error);
                    }
                }
            });
        } else {
            console.error('Elemento notesList no encontrado');
        }
    } else {
        console.error('Elemento confirmDeleteModal no encontrado');
    }
});

// Función para sanitizar HTML básico (permitir solo elementos seguros)
function sanitizeHtml(html) {
    // Crear un elemento temporal para parsear el HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Lista de elementos permitidos (elementos que Quill puede generar)
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span'];
    const allowedAttributes = ['class', 'style'];

    // Función recursiva para limpiar elementos
    function cleanElement(element) {
        const tagName = element.tagName.toLowerCase();

        // Si el elemento no está permitido, reemplazarlo con su contenido de texto
        if (!allowedTags.includes(tagName)) {
            return document.createTextNode(element.textContent);
        }

        // Crear nuevo elemento limpio
        const cleanEl = document.createElement(tagName);

        // Copiar solo atributos permitidos
        for (const attr of element.attributes) {
            if (allowedAttributes.includes(attr.name.toLowerCase())) {
                // Para el atributo style, solo permitir estilos seguros
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

        // Procesar hijos recursivamente
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

    // Procesar todos los elementos hijos
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

// Función para sanitizar estilos CSS
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
            // Validación básica del valor (evitar javascript: y similares)
            if (!value.toLowerCase().includes('javascript:') &&
                !value.toLowerCase().includes('expression(') &&
                !value.toLowerCase().includes('url(javascript:)')) {
                safeStyles.push(`${property}: ${value}`);
            }
        }
    }

    return safeStyles.join('; ');
}
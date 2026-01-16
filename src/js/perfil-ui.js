// perfil-ui.js - Manejo de la interfaz del perfil

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el perfil
    PerfilManager.init();

    // Manejar logout
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            TokenManager.clear();
            window.location.href = 'login.html';
        });
    }

    // Modal para ver nota completa - Manejar el evento show.bs.modal
    const noteModal = document.getElementById('noteModal');
    if (noteModal) {
        noteModal.addEventListener('show.bs.modal', (event) => {
            const triggerButton = event.relatedTarget;
            const title = triggerButton.getAttribute('data-title');
            const content = triggerButton.noteContent;
            const isHtml = triggerButton.getAttribute('data-is-html') === 'true';

            const modalTitle = document.getElementById('noteModalLabel');
            const modalContent = document.getElementById('modalNoteContent');

            if (modalTitle && modalContent) {
                modalTitle.textContent = title;
                if (isHtml && content) {
                    modalContent.innerHTML = sanitizeHtml(content);
                } else {
                    modalContent.textContent = content || '';
                }
            }
        });
    }

    // Modal de cambiar contraseña - Limpiar al cerrar
    const editPasswordModal = document.getElementById('editPasswordModal');
    if (editPasswordModal) {
        editPasswordModal.addEventListener('hidden.bs.modal', () => {
            console.log('Cerrando modal de cambiar contraseña');

            // Limpiar campos
            const currentPassword = document.getElementById('currentPassword');
            const newPassword = document.getElementById('newPassword');
            const confirmNewPassword = document.getElementById('confirmNewPassword');

            if (currentPassword) currentPassword.value = '';
            if (newPassword) newPassword.value = '';
            if (confirmNewPassword) confirmNewPassword.value = '';

            // Limpiar errores
            ErrorManager.hide('passwordErrorMessage');
            ErrorManager.hide('currentPasswordError');
            ErrorManager.hide('newPasswordError');
            ErrorManager.hide('confirmNewPasswordError');
        });
    }

    // Manejar remover de favoritos con modal de confirmación
    let noteIdToRemove = null;

    document.addEventListener('click', (e) => {
        const removeFavoriteBtn = e.target.closest('.remove-favorite');
        if (removeFavoriteBtn) {
            e.preventDefault();
            noteIdToRemove = removeFavoriteBtn.getAttribute('data-note-id');

            // Mostrar modal de confirmación
            const confirmModal = new bootstrap.Modal(document.getElementById('confirmRemoveFavoriteModal'));
            confirmModal.show();
        }
    });

    // Confirmar eliminación desde el modal
    const confirmRemoveButton = document.getElementById('confirmRemoveButton');
    if (confirmRemoveButton) {
        confirmRemoveButton.addEventListener('click', async () => {
            if (noteIdToRemove) {
                const success = await PerfilManager.removerFavorita(noteIdToRemove);
                if (success) {
                    // Cerrar modal
                    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmRemoveFavoriteModal'));
                    if (confirmModal) confirmModal.hide();

                    // Recargar perfil para actualizar la lista
                    await PerfilManager.loadPerfil();
                }
                noteIdToRemove = null;
            }
        });
    }
});

// Función para sanitizar HTML (misma que en notes-ui.js)
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
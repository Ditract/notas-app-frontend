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

    // Manejar clicks en notas favoritas (para ver en modal)
    document.addEventListener('click', (e) => {
        const notePreview = e.target.closest('.note-preview');
        if (notePreview) {
            const title = notePreview.getAttribute('data-title');
            const content = notePreview.getAttribute('data-content');
            const isHtml = notePreview.getAttribute('data-is-html') === 'true';

            const modalTitle = document.getElementById('noteModalLabel');
            const modalContent = document.getElementById('modalNoteContent');

            if (modalTitle && modalContent) {
                modalTitle.textContent = title;
                if (isHtml) {
                    modalContent.innerHTML = content;
                } else {
                    modalContent.textContent = content;
                }
            }
        }
    });

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
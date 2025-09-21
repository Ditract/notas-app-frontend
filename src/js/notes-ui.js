document.addEventListener('DOMContentLoaded', () => {
    // Modal para ver nota completa
    const noteModal = document.getElementById('noteModal');
    if (noteModal) {
        noteModal.addEventListener('show.bs.modal', (event) => {
            console.log('Abriendo modal de visualización de nota');
            const triggerButton = event.relatedTarget;
            const title = triggerButton.getAttribute('data-title');
            const content = triggerButton.getAttribute('data-content');

            // Establecer título con manejo de overflow
            const modalTitle = document.getElementById('noteModalLabel');
            modalTitle.textContent = title;

            // Establecer contenido con manejo de saltos de línea
            const modalBody = document.getElementById('modalNoteContent');
            // Usar textContent para evitar problemas de XSS, y luego convertir \n a <br>
            const sanitizedContent = content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\n/g, '<br>');

            modalBody.innerHTML = sanitizedContent;
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
                        const success = await window.deleteNote(noteId);
                        if (success) {
                            console.log('Nota eliminada, actualizando lista');
                            bootstrap.Modal.getInstance(confirmDeleteModal).hide();
                            window.loadNotes();
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
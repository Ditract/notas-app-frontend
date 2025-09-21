// app.js - Archivo principal que inicializa la aplicación

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar autenticación en todas las páginas
    AuthManager.initLogin();
    AuthManager.initRegister();
    AuthManager.initLogout();

    // Inicializar dashboard si estamos en esa página
    if (window.location.pathname.includes('dashboard.html')) {
        NotesManager.init();

        // Exponer función deleteNote globalmente para el modal de confirmación
        window.deleteNote = async (noteId) => {
            return await NotesManager.deleteNote(noteId);
        };

        // Exponer función loadNotes globalmente para actualizar después de eliminar
        window.loadNotes = async () => {
            return await NotesManager.loadNotes();
        };
    }
});

console.log('Aplicación inicializada correctamente');
// config.js - Configuración global de la aplicación
const CONFIG = {
    API_BASE_URL: (function () {
        const host = window.location.hostname;
        // Si estamos en desarrollo
        if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
            return 'http://localhost:8080/api';  // backend local
        } else {
            return 'https://spring-boot-notes-api.onrender.com/api'; // producción
        }
    })(),
    VALIDATION: {
        TITLE_MAX_LENGTH: 255,
        CONTENT_MAX_LENGTH: 10000,
        PASSWORD_MIN_LENGTH: 8,
        PASSWORD_MAX_LENGTH: 64,
        PREVIEW_MAX_LENGTH: 150,
        TITLE_PREVIEW_MAX_LENGTH: 50
    }
};

// Exponer globalmente
window.CONFIG = CONFIG;

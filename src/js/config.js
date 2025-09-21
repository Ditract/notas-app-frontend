// config.js - Configuración global de la aplicación
const CONFIG = {
    API_BASE_URL: 'https://spring-boot-notes-api.onrender.com/api',
    VALIDATION: {
        TITLE_MAX_LENGTH: 255,
        CONTENT_MAX_LENGTH: 10000,
        PASSWORD_MIN_LENGTH: 8,
        PASSWORD_MAX_LENGTH: 64,
        PREVIEW_MAX_LENGTH: 150,
        TITLE_PREVIEW_MAX_LENGTH: 50
    }
};

// Exportar configuración para otros módulos
window.CONFIG = CONFIG;
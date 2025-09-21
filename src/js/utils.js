// utils.js - Funciones utilitarias compartidas

// --- Token Helpers ---
const TokenManager = {
    get() {
        const token = localStorage.getItem('token');
        console.log('Token recuperado de localStorage:', token);
        return token;
    },

    set(token) {
        console.log('Guardando token en localStorage:', token);
        localStorage.setItem('token', token);
    },

    clear() {
        console.log('Limpiando token de localStorage');
        localStorage.removeItem('token');
    }
};

// --- Error Helpers ---
const ErrorManager = {
    show(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
        } else {
            console.error(`Elemento con ID ${elementId} no encontrado`);
        }
    },

    hide(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.classList.add('d-none');
        } else {
            console.error(`Elemento con ID ${elementId} no encontrado`);
        }
    }
};

// --- Funciones auxiliares para vista previa ---
function createNotePreview(title, content, maxLength = window.CONFIG.VALIDATION.PREVIEW_MAX_LENGTH) {
    // Limpiar y normalizar el contenido
    const cleanContent = content.replace(/\s+/g, ' ').trim();
    const cleanTitle = title.replace(/\s+/g, ' ').trim();

    // Truncar título si es muy largo
    const truncatedTitle = cleanTitle.length > window.CONFIG.VALIDATION.TITLE_PREVIEW_MAX_LENGTH ?
        cleanTitle.substring(0, window.CONFIG.VALIDATION.TITLE_PREVIEW_MAX_LENGTH) + '...' : cleanTitle;

    // Crear vista previa del contenido
    const preview = cleanContent.length > maxLength ?
        cleanContent.substring(0, maxLength) + '...' : cleanContent;

    return {
        title: truncatedTitle,
        preview: preview,
        fullTitle: cleanTitle,
        fullContent: cleanContent
    };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Validadores ---
const Validators = {
    email(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validateForm(fields) {
        let isValid = true;
        const errors = {};

        for (const [fieldName, { value, rules }] of Object.entries(fields)) {
            for (const rule of rules) {
                if (!rule.test(value)) {
                    errors[fieldName] = rule.message;
                    isValid = false;
                    break;
                }
            }
        }

        return { isValid, errors };
    }
};

// Exportar para uso global
window.TokenManager = TokenManager;
window.ErrorManager = ErrorManager;
window.createNotePreview = createNotePreview;
window.escapeHtml = escapeHtml;
window.Validators = Validators;
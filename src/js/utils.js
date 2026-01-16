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

    password(password) {
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!?.*_-]).*$/;
        return passwordRegex.test(password);
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

// --- Validador específico para cambio de contraseña ---
const PasswordValidator = {
    validatePasswordChange(currentPassword, newPassword, confirmPassword) {
        const errors = {};
        let isValid = true;

        // Validar contraseña actual
        if (!currentPassword || currentPassword.trim() === '') {
            errors.currentPassword = 'La contraseña actual es obligatoria';
            isValid = false;
        }

        // Validar nueva contraseña - longitud
        if (!newPassword || newPassword.trim() === '') {
            errors.newPassword = 'La nueva contraseña es obligatoria';
            isValid = false;
        } else if (newPassword.length < 8 || newPassword.length > 64) {
            errors.newPassword = 'La nueva contraseña debe tener entre 8 y 64 caracteres';
            isValid = false;
        } else if (!Validators.password(newPassword)) {
            errors.newPassword = 'La nueva contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial';
            isValid = false;
        }

        // Validar que las contraseñas coincidan
        if (!confirmPassword || confirmPassword.trim() === '') {
            errors.confirmPassword = 'Debes confirmar la nueva contraseña';
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
            isValid = false;
        }

        // Validar que la nueva contraseña sea diferente a la actual
        if (newPassword && currentPassword && newPassword === currentPassword) {
            errors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
            isValid = false;
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
window.PasswordValidator = PasswordValidator;
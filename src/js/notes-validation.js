// notes-validation.js - Validaciones específicas para notas

const NotesValidation = {
    validateNote(title, content) {
        const validation = Validators.validateForm({
            titulo: {
                value: title,
                rules: [
                    { test: (val) => val.trim() !== '', message: 'El título es obligatorio' },
                    {
                        test: (val) => val.trim().length <= CONFIG.VALIDATION.TITLE_MAX_LENGTH,
                        message: `El título no puede exceder ${CONFIG.VALIDATION.TITLE_MAX_LENGTH} caracteres`
                    }
                ]
            },
            contenido: {
                value: content,
                rules: [
                    { test: (val) => val.trim() !== '', message: 'El contenido es obligatorio' },
                    {
                        test: (val) => val.trim().length <= CONFIG.VALIDATION.CONTENT_MAX_LENGTH,
                        message: `El contenido no puede exceder ${CONFIG.VALIDATION.CONTENT_MAX_LENGTH} caracteres`
                    }
                ]
            }
        });

        return validation;
    }
};

window.NotesValidation = NotesValidation;
// password-recovery.js - Lógica para recuperación y restablecimiento de contraseña

const PasswordRecoveryManager = {
    token: null,

    init() {
        // Detectar en qué página estamos
        const currentPage = window.location.pathname;

        if (currentPage.includes('forgot-password.html')) {
            this.initForgotPassword();
        } else if (currentPage.includes('reset-password.html')) {
            this.initResetPassword();
        }
    },

    // --- FORGOT PASSWORD ---
    initForgotPassword() {
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', this.handleForgotPassword.bind(this));
        }
    },

    async handleForgotPassword(e) {
        e.preventDefault();
        ErrorManager.hide('errorMessage');
        ErrorManager.hide('emailError');

        const submitButton = document.querySelector('#forgotPasswordForm button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        const email = document.getElementById('email').value;

        // Validar email
        if (!email || !Validators.email(email)) {
            ErrorManager.show('emailError', 'Por favor, ingresa un email válido');
            return;
        }

        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
        submitButton.disabled = true;

        try {
            console.log('Solicitando recuperación de contraseña para:', email);
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/forgot-password?email=${encodeURIComponent(email)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error('Error al solicitar recuperación:', data);
                ErrorManager.show('errorMessage', data.message || 'Ocurrió un error al procesar tu solicitud.');
                return;
            }

            // Éxito - Mostrar mensaje
            this.showSuccessSection();

        } catch (error) {
            console.error('Error al solicitar recuperación:', error);
            ErrorManager.show('errorMessage', 'Ocurrió un error de conexión. Por favor, intenta nuevamente.');
        } finally {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    },

    showSuccessSection() {
        document.getElementById('requestSection').classList.add('d-none');
        document.getElementById('successSection').classList.remove('d-none');
    },

    // --- RESET PASSWORD ---
    initResetPassword() {
        // Obtener token de la URL
        const urlParams = new URLSearchParams(window.location.search);
        this.token = urlParams.get('token');

        if (!this.token) {
            console.error('No se encontró token en la URL');
            this.showInvalidTokenSection();
            return;
        }

        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', this.handleResetPassword.bind(this));
        }
    },

    async handleResetPassword(e) {
        e.preventDefault();
        ErrorManager.hide('errorMessage');
        ErrorManager.hide('newPasswordError');
        ErrorManager.hide('confirmPasswordError');

        const submitButton = document.querySelector('#resetPasswordForm button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validaciones frontend
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!?.*_-]).*$/;

        if (!newPassword) {
            ErrorManager.show('newPasswordError', 'La contraseña es obligatoria');
            return;
        }

        if (newPassword.length < 8 || newPassword.length > 64) {
            ErrorManager.show('newPasswordError', 'La contraseña debe tener entre 8 y 64 caracteres');
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            ErrorManager.show('newPasswordError', 'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial');
            return;
        }

        if (newPassword !== confirmPassword) {
            ErrorManager.show('confirmPasswordError', 'Las contraseñas no coinciden');
            return;
        }

        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Restableciendo...';
        submitButton.disabled = true;

        try {
            console.log('Restableciendo contraseña con token:', this.token);
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: this.token,
                    nuevaPassword: newPassword
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error('Error al restablecer contraseña:', data);

                // Token inválido o expirado
                if (response.status === 404) {
                    this.showInvalidTokenSection();
                    return;
                }

                // Validaciones del backend
                if (data.validationErrors) {
                    Object.entries(data.validationErrors).forEach(([field, message]) => {
                        if (field === 'nuevaPassword') {
                            ErrorManager.show('newPasswordError', message);
                        } else {
                            ErrorManager.show('errorMessage', message);
                        }
                    });
                } else {
                    ErrorManager.show('errorMessage', data.message || 'Ocurrió un error al restablecer la contraseña.');
                }
                return;
            }

            // Éxito
            this.showResetSuccessSection();

        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            ErrorManager.show('errorMessage', 'Ocurrió un error de conexión. Por favor, intenta nuevamente.');
        } finally {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    },

    showResetSuccessSection() {
        document.getElementById('formSection').classList.add('d-none');
        document.getElementById('successSection').classList.remove('d-none');
    },

    showInvalidTokenSection() {
        document.getElementById('formSection').classList.add('d-none');
        document.getElementById('successSection').classList.add('d-none');
        document.getElementById('invalidTokenSection').classList.remove('d-none');
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    PasswordRecoveryManager.init();
});

window.PasswordRecoveryManager = PasswordRecoveryManager;
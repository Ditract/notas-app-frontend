// verify.js - Lógica para verificación de cuenta

const VerifyManager = {
    token: null,

    init() {
        // Obtener token de la URL
        const urlParams = new URLSearchParams(window.location.search);
        this.token = urlParams.get('token');

        if (!this.token) {
            this.showError('No se encontró el token de verificación. Por favor, verifica el link que recibiste por email.');
            return;
        }

        // Verificar automáticamente
        this.verifyAccount();
    },

    async verifyAccount() {
        try {
            console.log('Verificando cuenta con token:', this.token);
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/verify?token=${encodeURIComponent(this.token)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error('Error en verificación:', data);

                // Personalizar mensajes según el error
                let errorMessage = data.message || 'Ha ocurrido un error al verificar tu cuenta.';

                if (response.status === 404) {
                    errorMessage = 'El token de verificación es inválido o ha expirado. Por favor, solicita un nuevo email de verificación.';
                } else if (response.status === 400) {
                    errorMessage = data.message || 'La cuenta ya ha sido verificada o el token es inválido.';
                }

                this.showError(errorMessage);
                return;
            }

            // Verificación exitosa
            this.showSuccess();
        } catch (error) {
            console.error('Error al verificar cuenta:', error);
            this.showError('Ocurrió un error de conexión. Por favor, intenta nuevamente más tarde.');
        }
    },

    showSuccess() {
        document.getElementById('loadingSection').classList.add('d-none');
        document.getElementById('successSection').classList.remove('d-none');
    },

    showError(message) {
        document.getElementById('loadingSection').classList.add('d-none');
        document.getElementById('errorSection').classList.remove('d-none');
        document.getElementById('errorMessage').textContent = message;
    },

    showResendSection() {
        document.getElementById('errorSection').classList.add('d-none');
        document.getElementById('resendSection').classList.remove('d-none');
    },

    hideResendSection() {
        document.getElementById('resendSection').classList.add('d-none');
        document.getElementById('errorSection').classList.remove('d-none');
    },

    async handleResend(email) {
        ErrorManager.hide('resendEmailError');
        ErrorManager.hide('resendErrorMessage');
        ErrorManager.hide('resendSuccessMessage');

        // Validar email
        if (!email || !Validators.email(email)) {
            ErrorManager.show('resendEmailError', 'Por favor, ingresa un email válido');
            return;
        }

        const submitButton = document.querySelector('#resendForm button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
        submitButton.disabled = true;

        try {
            console.log('Reenviando email de verificación para:', email);
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/resend-verification?email=${encodeURIComponent(email)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error('Error al reenviar email:', data);

                let errorMessage = data.message || 'Error al reenviar el email de verificación.';

                if (response.status === 404) {
                    errorMessage = 'No se encontró una cuenta con ese email.';
                } else if (response.status === 400) {
                    errorMessage = data.message || 'La cuenta ya está verificada o ha ocurrido un error.';
                }

                ErrorManager.show('resendErrorMessage', errorMessage);
                return;
            }

            // Éxito
            ErrorManager.show('resendSuccessMessage', data.mensaje || 'Email de verificación enviado. Por favor, revisa tu correo.');

            // Limpiar formulario
            document.getElementById('resendEmail').value = '';

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        } catch (error) {
            console.error('Error al reenviar email:', error);
            ErrorManager.show('resendErrorMessage', 'Ocurrió un error de conexión. Por favor, intenta nuevamente.');
        } finally {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    VerifyManager.init();

    // Botón para mostrar formulario de reenvío
    const resendBtn = document.getElementById('resendBtn');
    if (resendBtn) {
        resendBtn.addEventListener('click', () => {
            VerifyManager.showResendSection();
        });
    }

    // Botón para volver desde formulario de reenvío
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            VerifyManager.hideResendSection();
        });
    }

    // Formulario de reenvío
    const resendForm = document.getElementById('resendForm');
    if (resendForm) {
        resendForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('resendEmail').value;
            VerifyManager.handleResend(email);
        });
    }
});

window.VerifyManager = VerifyManager;
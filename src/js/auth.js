// auth.js - Manejo de autenticación (login, registro, logout)

const AuthManager = {
    // --- LOGIN ---
    initLogin() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        this._clearErrors(['errorMessage', 'emailError', 'passwordError']);

        const loginButton = document.querySelector('#loginForm button[type="submit"]');
        const originalButtonText = loginButton.innerHTML;

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        this._setLoading(loginButton, 'Iniciando sesión...');

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error('Error en respuesta del login:', data);

                // Mensaje especial para cuenta no verificada
                if (response.status === 401 && data.message && data.message.toLowerCase().includes('verificad')) {
                    ErrorManager.show('errorMessage',
                        'Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación.'
                    );
                } else {
                    this._handleValidationErrors(data);
                }
                return;
            }

            if (!data.token) throw new Error('No se encontró el token en la respuesta del servidor');

            TokenManager.set(data.token);
            console.log('Token guardado en localStorage:', localStorage.getItem('token'));

            this._setSuccess(loginButton, '¡Éxito!', () => window.location.href = 'dashboard.html', 500);

        } catch (error) {
            console.error('Error en login:', error);
            ErrorManager.show('errorMessage', error.message || 'Ocurrió un error al iniciar sesión');
        } finally {
            this._resetButton(loginButton, originalButtonText);
        }
    },

    // --- REGISTER ---
    initRegister() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        this._clearErrors(['errorMessage', 'emailError', 'passwordError', 'successMessage']);

        const registerButton = document.querySelector('#registerForm button[type="submit"]');
        const originalButtonText = registerButton.innerHTML;

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        this._setLoading(registerButton, 'Registrando...');

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error('Error en signup:', data);
                this._handleValidationErrors(data);
                return;
            }

            // Registro exitoso - Mostrar mensaje del backend
            const successMessageEl = document.getElementById('successMessage');
            const successMessageTextEl = document.getElementById('successMessageText');

            if (successMessageEl && successMessageTextEl) {
                successMessageTextEl.textContent = data.mensaje || 'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico.';
                successMessageEl.classList.remove('d-none');
            }

            // Ocultar el formulario
            const registerForm = document.getElementById('registerForm');
            if (registerForm) {
                registerForm.style.display = 'none';
            }

            // Redirigir después de 5 segundos
            this._setSuccess(registerButton, '¡Registro exitoso!', () => {
                window.location.href = 'login.html';
            }, 5000);

        } catch (error) {
            console.error('Error en registro:', error);
            ErrorManager.show('errorMessage', error.message || 'Ocurrió un error al registrarse');
        } finally {
            this._resetButton(registerButton, originalButtonText);
        }
    },

    // --- LOGOUT ---
    initLogout() {
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', this.handleLogout.bind(this));
        }
    },

    handleLogout(e) {
        e.preventDefault();
        TokenManager.clear();
        window.location.href = 'index.html';
    },

    // --- UTILIDADES PRIVADAS ---
    _clearErrors(fields) {
        fields.forEach(f => ErrorManager.hide(f));
    },

    _setLoading(button, text) {
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${text}`;
        button.disabled = true;
    },

    _resetButton(button, originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    },

    _setSuccess(button, text, callback, delay = 500) {
        button.innerHTML = `<i class="bi bi-check-circle me-2"></i>${text}`;
        if (callback) setTimeout(callback, delay);
    },

    _handleValidationErrors(data) {
        if (data.validationErrors && Object.keys(data.validationErrors).length > 0) {
            Object.entries(data.validationErrors).forEach(([field, messages]) => {
                const errorElement = document.getElementById(`${field}Error`);
                if (errorElement) {
                    const msgs = Array.isArray(messages) ? messages : [messages];
                    errorElement.innerHTML = `<ul class="mb-0">${msgs.map(m => `<li>${m}</li>`).join('')}</ul>`;
                    errorElement.classList.remove('d-none');
                }
            });
        } else {
            ErrorManager.show('errorMessage', data.message || 'Ocurrió un error');
        }
    }
};

// Exportar para uso global
window.AuthManager = AuthManager;
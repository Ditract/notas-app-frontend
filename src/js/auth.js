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
        ErrorManager.hide('errorMessage');
        ErrorManager.hide('emailError');
        ErrorManager.hide('passwordError');

        // Obtener el botón y guardarlo para restaurar después
        const loginButton = document.querySelector('#loginForm button[type="submit"]');
        const originalButtonText = loginButton.innerHTML;

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log('Iniciando login con email:', email);

        // Validación del lado del cliente
        const validation = Validators.validateForm({
            email: {
                value: email,
                rules: [
                    { test: (val) => val.trim() !== '', message: 'El correo electrónico es obligatorio' },
                    { test: (val) => Validators.email(val), message: 'El correo electrónico no es válido' }
                ]
            },
            password: {
                value: password,
                rules: [
                    { test: (val) => val.trim() !== '', message: 'La contraseña es obligatoria' },
                    {
                        test: (val) => val.length >= CONFIG.VALIDATION.PASSWORD_MIN_LENGTH && val.length <= CONFIG.VALIDATION.PASSWORD_MAX_LENGTH,
                        message: `La contraseña debe tener entre ${CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} y ${CONFIG.VALIDATION.PASSWORD_MAX_LENGTH} caracteres`
                    }
                ]
            }
        });

        if (!validation.isValid) {
            Object.entries(validation.errors).forEach(([field, message]) => {
                ErrorManager.show(`${field}Error`, message);
            });
            console.log('Validación del cliente fallida, no se envía la solicitud');
            return;
        }

        // Activar loading spinner
        loginButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Iniciando sesión...';
        loginButton.disabled = true;

        try {
            console.log('Enviando petición a /api/auth/signin...');
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            console.log('Status de respuesta login:', response.status);
            console.log('Headers de respuesta:', [...response.headers.entries()]);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { message: `Error ${response.status}: No se pudo procesar la respuesta` };
                }
                console.error('Error en respuesta del login:', errorData);

                if (errorData.validationErrors) {
                    Object.entries(errorData.validationErrors).forEach(([field, message]) => {
                        const errorElement = document.getElementById(`${field}Error`);
                        if (errorElement) {
                            errorElement.textContent = message;
                            errorElement.classList.remove('d-none');
                        } else {
                            ErrorManager.show('errorMessage', message);
                        }
                    });
                } else {
                    ErrorManager.show('errorMessage', errorData.message || `Error ${response.status}: No se pudo iniciar sesión`);
                }
                throw new Error(errorData.message || 'Error al iniciar sesión');
            }

            let data;
            try {
                data = await response.json();
                console.log('Respuesta completa del login:', data);
            } catch (error) {
                console.error('Error al parsear JSON de login:', error);
                throw new Error('La respuesta del servidor no es un JSON válido');
            }

            let token = data.token;
            if (!token) {
                console.error('Estructura de respuesta inesperada:', data);
                throw new Error('No se encontró el token en la respuesta del servidor');
            }
            console.log('Token extraído:', token);
            TokenManager.set(token);
            console.log('Token guardado en localStorage:', localStorage.getItem('token'));

            // Cambiar a éxito antes de redirigir
            loginButton.innerHTML = '<i class="bi bi-check-circle me-2"></i>¡Éxito!';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);

        } catch (error) {
            console.error('Error en login:', error);
            ErrorManager.show('errorMessage', error.message || 'Ocurrió un error al iniciar sesión');
        } finally {
            // Solo restaurar si no fue exitoso (para evitar que se vea el cambio antes del redirect)
            if (!TokenManager.get()) {
                loginButton.innerHTML = originalButtonText;
                loginButton.disabled = false;
            }
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
        ErrorManager.hide('errorMessage');
        ErrorManager.hide('nombreError');
        ErrorManager.hide('emailError');
        ErrorManager.hide('passwordError');

        // Obtener el botón y guardarlo para restaurar después
        const registerButton = document.querySelector('#registerForm button[type="submit"]');
        const originalButtonText = registerButton.innerHTML;

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Activar loading spinner
        registerButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Registrando...';
        registerButton.disabled = true;

        try {
            console.log('Enviando petición a /api/auth/signup...');
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });

            const responseText = await response.text();
            console.log('Respuesta de signup:', responseText);

            if (response.status === 201 || response.status === 200) {
                // Cambiar a éxito
                registerButton.innerHTML = '<i class="bi bi-check-circle me-2"></i>¡Registro exitoso!';

                // Mostrar toast en lugar de alert
                const successToast = new bootstrap.Toast(document.getElementById('successToast'));
                successToast.show();

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } else {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    errorData = { message: 'Error desconocido del servidor' };
                }
                console.error('Error en signup:', errorData);

                if (errorData.validationErrors) {
                    Object.entries(errorData.validationErrors).forEach(([field, message]) => {
                        const errorElement = document.getElementById(`${field}Error`);
                        if (errorElement) {
                            errorElement.textContent = message;
                            errorElement.classList.remove('d-none');
                        } else {
                            ErrorManager.show('errorMessage', message);
                        }
                    });
                } else {
                    ErrorManager.show('errorMessage', errorData.message || `Error ${response.status}: No se pudo registrar`);
                }
                throw new Error('Error en el registro');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            ErrorManager.show('errorMessage', error.message || 'Ocurrió un error al registrarse');
        } finally {
            // Solo restaurar si hubo error
            if (registerButton.innerHTML.includes('spinner-border') || registerButton.innerHTML.includes('Registrando')) {
                registerButton.innerHTML = originalButtonText;
                registerButton.disabled = false;
            }
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
        window.location.href = 'login.html';
    }
};

// Exportar para uso global
window.AuthManager = AuthManager;
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
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Error en login:', error);
            ErrorManager.show('errorMessage', error.message || 'Ocurrió un error al iniciar sesión');
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

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

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
                alert('Registro exitoso. Por favor, inicia sesión.');
                window.location.href = 'login.html';
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
            }
        } catch (error) {
            console.error('Error en registro:', error);
            ErrorManager.show('errorMessage', error.message || 'Ocurrió un error al registrarse');
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
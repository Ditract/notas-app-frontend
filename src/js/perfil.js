// perfil.js - Manejo del perfil de usuario

const PerfilManager = {
    token: null,
    perfilData: null,
    userData: null, // Datos del usuario desde el token

    init() {
        this.token = TokenManager.get();
        if (!this.token) {
            console.warn('No se encontró token, redirigiendo a login...');
            window.location.href = 'login.html';
            return;
        }

        // Decodificar token para obtener email
        this.userData = this.decodeToken(this.token);

        this.loadPerfil();
        this.initForm();
        this.initPasswordForm();
    },

    // Decodificar JWT para extraer el email
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            console.log('Token decodificado:', payload);
            return {
                email: payload.sub || payload.email,
                roles: payload.roles || []
            };
        } catch (error) {
            console.error('Error al decodificar token:', error);
            return { email: 'usuario@ejemplo.com', roles: [] };
        }
    },

    // --- Cargar perfil ---
    async loadPerfil() {
        try {
            console.log('Cargando perfil con token:', this.token);
            const response = await fetch(`${CONFIG.API_BASE_URL}/perfiles/mi-perfil`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Status response perfil:', response.status);

            if (!response.ok) {
                const text = await response.text();
                console.error('Respuesta del backend:', text);
                if (response.status === 401) {
                    ErrorManager.show('favoritesErrorMessage', 'Sesión expirada o token inválido. Por favor, inicia sesión nuevamente.');
                    setTimeout(() => {
                        TokenManager.clear();
                        window.location.href = 'login.html';
                    }, 2000);
                    return;
                }
                throw new Error(`Error al cargar el perfil (status ${response.status})`);
            }

            this.perfilData = await response.json();
            this.renderPerfil(this.perfilData);
            this.loadFavoritas();
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            ErrorManager.show('favoritesErrorMessage', error.message);
        }
    },

    // --- Renderizar perfil ---
    renderPerfil(perfil) {
        document.getElementById('profileName').textContent = perfil.nombre || 'Usuario';
        document.getElementById('profileEmail').textContent = this.userData?.email || 'usuario@ejemplo.com';
        document.getElementById('favoritesCount').textContent = perfil.notasFavoritas?.length || 0;

        const profileNameInput = document.getElementById('profileNameInput');
        if (profileNameInput) {
            profileNameInput.value = perfil.nombre || '';
        }
    },

    // --- Inicializar formulario de nombre ---
    initForm() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleUpdatePerfil.bind(this));
        }
    },

    // --- Inicializar formulario de contraseña ---
    initPasswordForm() {
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', this.handleChangePassword.bind(this));
        }
    },

    // --- Actualizar perfil ---
    async handleUpdatePerfil(e) {
        e.preventDefault();
        ErrorManager.hide('profileErrorMessage');
        ErrorManager.hide('nombreError');

        const nombre = document.getElementById('profileNameInput').value;

        if (!nombre.trim()) {
            ErrorManager.show('nombreError', 'El nombre es obligatorio');
            return;
        }

        if (nombre.trim().length < 3) {
            ErrorManager.show('nombreError', 'El nombre debe tener al menos 3 caracteres');
            return;
        }

        if (nombre.trim().length > 40) {
            ErrorManager.show('nombreError', 'El nombre no puede exceder 40 caracteres');
            return;
        }

        try {
            console.log('Actualizando perfil con token:', this.token);
            const response = await fetch(`${CONFIG.API_BASE_URL}/perfiles/mi-perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ nombre })
            });

            console.log('Status response actualizar perfil:', response.status);

            if (!response.ok) {
                const responseText = await response.text();
                console.error('Respuesta backend actualizar perfil:', responseText);
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    errorData = { message: `Error ${response.status}: No se pudo procesar la respuesta` };
                }

                if (response.status === 401) {
                    ErrorManager.show('profileErrorMessage', 'Sesión expirada o token inválido. Por favor, inicia sesión nuevamente.');
                    setTimeout(() => {
                        TokenManager.clear();
                        window.location.href = 'login.html';
                    }, 2000);
                    return;
                }

                if (errorData.validationErrors) {
                    Object.entries(errorData.validationErrors).forEach(([field, message]) => {
                        ErrorManager.show(`${field}Error`, message);
                    });
                } else {
                    ErrorManager.show('profileErrorMessage', errorData.message || 'Error al actualizar el perfil');
                }
                return;
            }

            const updatedPerfil = await response.json();
            this.perfilData = updatedPerfil;
            this.renderPerfil(updatedPerfil);

            ToastManager.success('¡Perfil actualizado!', 'Tu nombre ha sido actualizado exitosamente.');

            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editNameModal'));
                if (modal) modal.hide();
            }, 1000);
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            ErrorManager.show('profileErrorMessage', error.message || 'Ocurrió un error al actualizar el perfil');
        }
    },

    // --- Cambiar contraseña ---
    async handleChangePassword(e) {
        e.preventDefault();

        // Limpiar errores previos
        ErrorManager.hide('passwordErrorMessage');
        ErrorManager.hide('currentPasswordError');
        ErrorManager.hide('newPasswordError');
        ErrorManager.hide('confirmNewPasswordError');

        const submitButton = document.querySelector('#changePasswordForm button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        // Validar con PasswordValidator
        const validation = PasswordValidator.validatePasswordChange(currentPassword, newPassword, confirmNewPassword);

        if (!validation.isValid) {
            Object.entries(validation.errors).forEach(([field, message]) => {
                const errorId = field === 'currentPassword' ? 'currentPasswordError' :
                    field === 'newPassword' ? 'newPasswordError' : 'confirmNewPasswordError';
                ErrorManager.show(errorId, message);
            });
            return;
        }

        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Actualizando...';
        submitButton.disabled = true;

        try {
            console.log('Cambiando contraseña con token:', this.token);
            const response = await fetch(`${CONFIG.API_BASE_URL}/perfiles/mi-perfil/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    passwordActual: currentPassword,
                    nuevaPassword: newPassword
                })
            });

            console.log('Status response cambiar contraseña:', response.status);

            // FIX: Manejar respuestas exitosas (200, 204)
            if (response.ok) {
                // Respuesta exitosa
                let data = {};

                // Intentar parsear JSON solo si hay contenido
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        data = await response.json();
                    } catch (e) {
                        console.log('Respuesta sin JSON, asumiendo éxito');
                    }
                }

                console.log('Contraseña cambiada exitosamente');
                ToastManager.success('¡Contraseña actualizada!', data.mensaje || 'Tu contraseña ha sido actualizada exitosamente.');

                // Limpiar formulario
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmNewPassword').value = '';

                // Cerrar modal después de 1 segundo
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editPasswordModal'));
                    if (modal) modal.hide();
                }, 1000);

                return;
            }

            // Si llegamos aquí, hubo un error
            const responseText = await response.text();
            console.error('Respuesta backend cambiar contraseña:', responseText);
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch {
                errorData = { message: `Error ${response.status}: No se pudo procesar la respuesta` };
            }

            if (response.status === 401) {
                ErrorManager.show('passwordErrorMessage', 'Sesión expirada o token inválido. Por favor, inicia sesión nuevamente.');
                setTimeout(() => {
                    TokenManager.clear();
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }

            if (response.status === 400) {
                // Contraseña actual incorrecta u otro error de validación
                if (errorData.message && errorData.message.includes('incorrecta')) {
                    ErrorManager.show('currentPasswordError', 'La contraseña actual es incorrecta');
                } else if (errorData.validationErrors) {
                    Object.entries(errorData.validationErrors).forEach(([field, message]) => {
                        if (field === 'nuevaPassword') {
                            ErrorManager.show('newPasswordError', message);
                        } else if (field === 'passwordActual') {
                            ErrorManager.show('currentPasswordError', message);
                        } else {
                            ErrorManager.show('passwordErrorMessage', message);
                        }
                    });
                } else {
                    ErrorManager.show('passwordErrorMessage', errorData.message || 'Error al cambiar la contraseña');
                }
            } else {
                ErrorManager.show('passwordErrorMessage', errorData.message || 'Error al cambiar la contraseña');
            }

        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            ErrorManager.show('passwordErrorMessage', 'Ocurrió un error de conexión. Por favor, intenta nuevamente.');
        } finally {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    },

    // --- Cargar notas favoritas ---
    async loadFavoritas() {
        try {
            if (!this.perfilData || !this.perfilData.notasFavoritas || this.perfilData.notasFavoritas.length === 0) {
                this.renderFavoritas([]);
                return;
            }

            const response = await fetch(`${CONFIG.API_BASE_URL}/notas`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar las notas');
            }

            const allNotas = await response.json();
            const favoritasIds = this.perfilData.notasFavoritas;
            const notasFavoritas = allNotas.filter(nota => favoritasIds.includes(nota.id));

            this.renderFavoritas(notasFavoritas);
        } catch (error) {
            console.error('Error al cargar favoritas:', error);
            ErrorManager.show('favoritesErrorMessage', error.message);
            this.renderFavoritas([]);
        }
    },

    // --- Renderizar favoritas ---
    renderFavoritas(favoritas) {
        const favoritesList = document.getElementById('favoritesList');

        if (!favoritesList) {
            console.error('Elemento favoritesList no encontrado');
            return;
        }

        favoritesList.innerHTML = '';

        if (favoritas.length === 0) {
            favoritesList.innerHTML = `
                <div class="list-group-item text-center py-4">
                    <i class="bi bi-star fs-1 text-muted mb-3"></i>
                    <p class="text-muted mb-0">No tienes notas favoritas aún.</p>
                    <small class="text-muted">Marca tus notas favoritas desde el dashboard.</small>
                </div>
            `;
            return;
        }

        favoritas.forEach(nota => {
            const noteItem = document.createElement('div');
            noteItem.className = 'list-group-item d-flex justify-content-between align-items-start';

            const previewData = this.createNotePreview(nota.titulo, nota.contenido);
            const escapedTitle = escapeHtml(previewData.fullTitle);

            noteItem.innerHTML = `
                <div class="flex-grow-1 me-3">
                    <div class="note-preview" 
                         data-bs-toggle="modal" 
                         data-bs-target="#noteModal" 
                         data-title="${escapedTitle}" 
                         data-is-html="true">
                        <strong class="d-block mb-1">
                            <i class="bi bi-star-fill text-warning me-1"></i>
                            ${escapeHtml(previewData.title)}
                        </strong>
                        <span class="text-muted">${escapeHtml(previewData.preview)}</span>
                    </div>
                </div>
                <button class="btn btn-outline-warning btn-sm remove-favorite" 
                        data-note-id="${nota.id}" 
                        title="Quitar de favoritos">
                    <i class="bi bi-star-fill"></i>
                </button>
            `;

            const previewEl = noteItem.querySelector('.note-preview');
            if (previewEl) {
                previewEl.noteContent = nota.contenido || '';
            }

            favoritesList.appendChild(noteItem);
        });
    },

    // --- Crear preview de nota ---
    createNotePreview(title, htmlContent) {
        const maxTitleLength = 50;
        const maxPreviewLength = 100;
        const plainTextContent = this.stripHtml(htmlContent);

        const truncatedTitle = title.length > maxTitleLength
            ? title.substring(0, maxTitleLength) + '...'
            : title;

        const truncatedPreview = plainTextContent.length > maxPreviewLength
            ? plainTextContent.substring(0, maxPreviewLength) + '...'
            : plainTextContent;

        return {
            title: truncatedTitle,
            preview: truncatedPreview,
            fullTitle: title,
            fullContent: htmlContent
        };
    },

    stripHtml(html) {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    },

    // --- Agregar nota a favoritos ---
    async agregarFavorita(notaId) {
        try {
            console.log('Agregando nota a favoritos, ID:', notaId);
            const response = await fetch(`${CONFIG.API_BASE_URL}/perfiles/favoritas/${notaId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Respuesta backend agregar favorita:', text);
                if (response.status === 401) {
                    ErrorManager.show('favoritesErrorMessage', 'Sesión expirada o token inválido.');
                    setTimeout(() => {
                        TokenManager.clear();
                        window.location.href = 'login.html';
                    }, 2000);
                    return false;
                }
                throw new Error(`Error al agregar favorita (status ${response.status})`);
            }

            console.log('Nota agregada a favoritos exitosamente');
            ToastManager.success('¡Favorito agregado!', 'La nota ha sido marcada como favorita.');
            return true;
        } catch (error) {
            console.error('Error al agregar favorita:', error);
            ErrorManager.show('favoritesErrorMessage', error.message);
            return false;
        }
    },

    // --- Remover nota de favoritos ---
    async removerFavorita(notaId) {
        try {
            console.log('Removiendo nota de favoritos, ID:', notaId);
            const response = await fetch(`${CONFIG.API_BASE_URL}/perfiles/favoritas/${notaId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Respuesta backend remover favorita:', text);
                if (response.status === 401) {
                    ErrorManager.show('favoritesErrorMessage', 'Sesión expirada o token inválido.');
                    setTimeout(() => {
                        TokenManager.clear();
                        window.location.href = 'login.html';
                    }, 2000);
                    return false;
                }
                throw new Error(`Error al remover favorita (status ${response.status})`);
            }

            console.log('Nota removida de favoritos exitosamente');
            ToastManager.info('Favorito removido', 'La nota ha sido quitada de favoritos.');
            return true;
        } catch (error) {
            console.error('Error al remover favorita:', error);
            ErrorManager.show('favoritesErrorMessage', error.message);
            return false;
        }
    }
};

window.PerfilManager = PerfilManager;
// perfil.js - Manejo del perfil de usuario

const PerfilManager = {
    token: null,
    perfilData: null,

    init() {
        this.token = TokenManager.get();
        if (!this.token) {
            console.warn('No se encontró token, redirigiendo a login...');
            window.location.href = 'login.html';
            return;
        }

        this.loadPerfil();
        this.initForm();
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
        document.getElementById('profileEmail').textContent = perfil.email || '';
        document.getElementById('favoritesCount').textContent = perfil.notasFavoritas?.length || 0;

        // Llenar el formulario
        document.getElementById('profileNameInput').value = perfil.nombre || '';
    },

    // --- Inicializar formulario ---
    initForm() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleUpdatePerfil.bind(this));
        }
    },

    // --- Actualizar perfil ---
    async handleUpdatePerfil(e) {
        e.preventDefault();
        ErrorManager.hide('profileErrorMessage');
        ErrorManager.hide('profileSuccessMessage');
        ErrorManager.hide('nombreError');

        const nombre = document.getElementById('profileNameInput').value;

        // Validación básica
        if (!nombre.trim()) {
            ErrorManager.show('nombreError', 'El nombre es obligatorio');
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

            ErrorManager.show('profileSuccessMessage', '¡Perfil actualizado exitosamente!');
            setTimeout(() => {
                ErrorManager.hide('profileSuccessMessage');
                // Cerrar modal después de 2 segundos
                const modal = bootstrap.Modal.getInstance(document.getElementById('editNameModal'));
                if (modal) modal.hide();
            }, 2000);
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            ErrorManager.show('profileErrorMessage', error.message || 'Ocurrió un error al actualizar el perfil');
        }
    },

    // --- Cargar notas favoritas (solo IDs desde el perfil) ---
    async loadFavoritas() {
        try {
            if (!this.perfilData || !this.perfilData.notasFavoritas || this.perfilData.notasFavoritas.length === 0) {
                this.renderFavoritas([]);
                return;
            }

            // Como solo tenemos IDs, debemos cargar todas las notas del usuario y filtrar
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

            // Filtrar solo las notas que están en favoritos
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
            const escapedContent = nota.contenido;

            noteItem.innerHTML = `
                <div class="flex-grow-1 me-3">
                    <div class="note-preview" 
                         data-bs-toggle="modal" 
                         data-bs-target="#noteModal" 
                         data-title="${escapedTitle}" 
                         data-content="${escapedContent}" 
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

            favoritesList.appendChild(noteItem);
        });
    },

    // --- Crear preview de nota (mismo que notes.js) ---
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

    // --- Función para convertir HTML a texto plano ---
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
            return true;
        } catch (error) {
            console.error('Error al remover favorita:', error);
            ErrorManager.show('favoritesErrorMessage', error.message);
            return false;
        }
    }
};

// Exportar para uso global
window.PerfilManager = PerfilManager;

const ToastManager = {
    container: null,

    init() {
        // Crear contenedor de toasts si no existe
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container position-fixed top-0 end-0 p-3';
            this.container.style.zIndex = '9999';
            document.body.appendChild(this.container);
        }
    },

    show(title, message, type = 'info') {
        this.init();

        const toastId = `toast-${Date.now()}`;
        const iconMap = {
            success: 'bi-check-circle-fill',
            error: 'bi-x-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };

        const bgMap = {
            success: 'bg-success',
            error: 'bg-danger',
            warning: 'bg-warning',
            info: 'bg-info'
        };

        const icon = iconMap[type] || iconMap.info;
        const bgClass = bgMap[type] || bgMap.info;

        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi ${icon} me-2"></i>
                        <strong>${title}</strong>
                        ${message ? `<div class="mt-1 small">${message}</div>` : ''}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', toastHtml);

        const toastElement = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 4000
        });

        bsToast.show();

        // Eliminar del DOM después de ocultarse
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    },

    success(title, message = '') {
        this.show(title, message, 'success');
    },

    error(title, message = '') {
        this.show(title, message, 'error');
    },

    warning(title, message = '') {
        this.show(title, message, 'warning');
    },

    info(title, message = '') {
        this.show(title, message, 'info');
    }
};

// Exportar para uso global
window.ToastManager = ToastManager;
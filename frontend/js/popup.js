/**
 * Sistema de Popup Personalizado
 * Expone window.showPopup(title, message, type)
 */

(function () {
    let currentCloseCallback = null;

    // Crear elementos del DOM si no existen
    function initPopupDOM() {
        if (document.getElementById('custom-popup-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'custom-popup-overlay';
        overlay.className = 'popup-overlay';

        overlay.innerHTML = `
            <div class="popup-content">
                <button class="popup-close-btn" id="popup-close-x">&times;</button>
                <div class="popup-title" id="popup-title">Title</div>
                <div class="popup-message" id="popup-message">Message content goes here...</div>
                <button class="popup-action-btn" id="popup-action-ok">Entendido</button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Escuchadores de eventos
        const closeBtn = document.getElementById('popup-close-x');
        const okBtn = document.getElementById('popup-action-ok');

        const close = () => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
                if (currentCloseCallback) {
                    currentCloseCallback();
                    currentCloseCallback = null;
                }
            }, 300); // Esperar la transición
        };

        closeBtn.addEventListener('click', close);
        okBtn.addEventListener('click', close);

        // Cerrar al hacer clic fuera (área de vidrio)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close();
            }
        });

        window.closeCustomPopup = close;
    }

    // Inicializar al cargar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPopupDOM);
    } else {
        initPopupDOM();
    }

    /**
     * Mostrar Popup
     * @param {string} title Título del popup
     * @param {string} message Mensaje del popup
     * @param {string} type 'error', 'success', o 'info'
     * @param {function} onClose Función callback a ejecutar al cerrar
     */
    window.showPopup = function (title, message, type = 'info', onClose = null) {
        const overlay = document.getElementById('custom-popup-overlay');
        if (!overlay) {
            initPopupDOM(); // Por si acaso
            return;
        }

        currentCloseCallback = onClose;

        const titleEl = document.getElementById('popup-title');
        const msgEl = document.getElementById('popup-message');

        titleEl.textContent = title;
        // Convertir saltos de línea en <br> para mostrarse correctamente en HTML
        const safeMessage = message
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
        msgEl.innerHTML = safeMessage;

        // Reiniciar clases
        titleEl.className = 'popup-title';
        if (type === 'error') titleEl.classList.add('error');
        if (type === 'success') titleEl.classList.add('success');

        overlay.style.display = 'flex';
        // Pequeño retraso para permitir que display:flex se aplique antes de añadir clase de opacidad
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    };

    /**
     * Show Confirm Dialog (reuses popup glassmorphism style)
     * @param {string} title 
     * @param {string} message 
     * @param {object} options  Optional { confirmText, cancelText, type }
     * @returns {Promise<boolean>} Resolves true if confirmed, false if cancelled
     */
    window.showConfirm = function (title, message, options = {}) {
        const {
            confirmText = 'Eliminar',
            cancelText = 'Cancelar',
            type = 'error'
        } = options;

        return new Promise((resolve) => {
            // Remove any previous confirm overlay
            const prev = document.getElementById('custom-confirm-overlay');
            if (prev) prev.remove();

            const overlay = document.createElement('div');
            overlay.id = 'custom-confirm-overlay';
            overlay.className = 'popup-overlay';

            const titleClass = type === 'error' ? 'error' : type === 'success' ? 'success' : '';

            overlay.innerHTML = `
                <div class="popup-content">
                    <div class="popup-title ${titleClass}">${title}</div>
                    ${message ? `<div class="popup-message">${message}</div>` : ''}
                    <div class="confirm-actions">
                        <button class="popup-action-btn confirm-cancel-btn" id="confirm-cancel">${cancelText}</button>
                        <button class="popup-action-btn confirm-delete-btn" id="confirm-ok">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Show with animation
            overlay.style.display = 'flex';
            setTimeout(() => overlay.classList.add('active'), 10);

            const close = (result) => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 300);
            };

            overlay.querySelector('#confirm-cancel').addEventListener('click', () => close(false));
            overlay.querySelector('#confirm-ok').addEventListener('click', () => close(true));

            // Close on click outside
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(false);
            });
        });
    };

})();

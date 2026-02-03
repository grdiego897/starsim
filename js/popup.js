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
        msgEl.textContent = message;

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

})();

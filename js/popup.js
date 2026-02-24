/**
 * Custom Popup System
 * Exposes window.showPopup(title, message, type)
 */

(function () {
    let currentCloseCallback = null;

    // Create DOM elements if they don't exist
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

        // Event Listeners
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
            }, 300); // Wait for transition
        };

        closeBtn.addEventListener('click', close);
        okBtn.addEventListener('click', close);

        // Close on click outside (glass area)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close();
            }
        });

        window.closeCustomPopup = close;
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPopupDOM);
    } else {
        initPopupDOM();
    }

    /**
     * Show Popup
     * @param {string} title 
     * @param {string} message 
     * @param {string} type 'error', 'success', or 'info'
     * @param {function} onClose Callback function to run when closed
     */
    window.showPopup = function (title, message, type = 'info', onClose = null) {
        const overlay = document.getElementById('custom-popup-overlay');
        if (!overlay) {
            initPopupDOM(); // Just in case
            return;
        }

        currentCloseCallback = onClose;

        const titleEl = document.getElementById('popup-title');
        const msgEl = document.getElementById('popup-message');

        titleEl.textContent = title;
        msgEl.textContent = message;

        // Reset classes
        titleEl.className = 'popup-title';
        if (type === 'error') titleEl.classList.add('error');
        if (type === 'success') titleEl.classList.add('success');

        overlay.style.display = 'flex';
        // Small delay to allow display:flex to apply before adding opacity class
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
                    <button class="popup-close-btn" id="confirm-close-x">&times;</button>
                    <div class="popup-title ${titleClass}">${title}</div>
                    <div class="popup-message">${message}</div>
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

            overlay.querySelector('#confirm-close-x').addEventListener('click', () => close(false));
            overlay.querySelector('#confirm-cancel').addEventListener('click', () => close(false));
            overlay.querySelector('#confirm-ok').addEventListener('click', () => close(true));

            // Close on click outside
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(false);
            });
        });
    };

})();

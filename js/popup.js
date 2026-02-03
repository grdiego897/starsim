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

})();

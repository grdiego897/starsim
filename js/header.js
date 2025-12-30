function loadHeader() {
    fetch('components/header.html')
        .then(response => response.text())
        .then(data => {
            const container = document.getElementById('header-container');
            if (container) {
                container.innerHTML = data;
                initHeaderLogic();
            }
        })
        .catch(err => console.error('Error loading header:', err));
}

function initHeaderLogic() {
    // --- Notification Logic ---
    const notificationPill = document.getElementById('notificationPill');

    function showNotification(message, duration = 3000) {
        if (!notificationPill) return;

        // Update text
        notificationPill.innerText = message;

        // Allow re-triggering animation
        notificationPill.classList.remove('fade-out');
        notificationPill.classList.remove('fade-in');

        // Trigger reflow/repaint to restart animation
        void notificationPill.offsetWidth;

        notificationPill.classList.add('fade-in');

        // Set timeout for auto-hide
        setTimeout(() => {
            notificationPill.classList.remove('fade-in');
            notificationPill.classList.add('fade-out');
        }, duration);
    }

    // Expose globally
    window.showNotification = showNotification;

    // Check for 'welcome' param on load
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('welcome')) {
        showNotification("Bienvenido", 2000);
    }
}

// Start the process
loadHeader();

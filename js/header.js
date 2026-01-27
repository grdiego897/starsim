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
    // Lógica de notificaciones
    const notificationPill = document.getElementById('notificationPill');

    function showNotification(message, duration = 3000) {
        if (!notificationPill) return;

        // Actualizar texto
        notificationPill.innerText = message;

        // Permitir re-activar animación
        notificationPill.classList.remove('fade-out');
        notificationPill.classList.remove('fade-in');

        // Forzar reflow para reiniciar animación
        void notificationPill.offsetWidth;

        notificationPill.classList.add('fade-in');

        // Temporizador para ocultar automáticamente
        setTimeout(() => {
            notificationPill.classList.remove('fade-in');
            notificationPill.classList.add('fade-out');
        }, duration);
    }

    // Exponer globalmente
    window.showNotification = showNotification;

    // Verificar parámetro 'welcome' al cargar
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('welcome')) {
        showNotification("Bienvenido", 2000);
    }
}

// Iniciar el proceso
loadHeader();

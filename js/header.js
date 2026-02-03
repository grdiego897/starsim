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
    // En SPA con hash, los params pueden estar en location.search o en el hash tras ?
    let params = new URLSearchParams(window.location.search);

    // Si no hay params en search, buscamos en el hash
    if (!params.has('welcome') && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        params = new URLSearchParams(hashQuery);
    }

    if (params.has('welcome')) {
        showNotification("Bienvenido", 2000);

        // Limpiar URL para no mostrar la notificación si se recarga
        // window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split('?')[0]);
    }
}

// Iniciar el proceso
loadHeader();

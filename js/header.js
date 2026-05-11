function loadHeader() {
    fetch('components/header.html?v=' + Date.now())
        .then(response => response.text())
        .then(data => {
            const container = document.getElementById('header-container');
            if (container) {
                container.innerHTML = data;
                initHeaderLogic();
                initProfileDropdown();
                
                // Mostrar nombre del usuario en lugar de dato estático
                try {
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (user && user.name) {
                        const el = document.querySelector('.user-name');
                        if (el) el.textContent = user.name;
                    }
                    const crown = document.querySelector('.crown-icon-img');
                    if (crown) crown.hidden = !(user && user.role === 'admin');
                } catch (e) {}
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

/**
 * Inicializar el menú desplegable del perfil y la lógica de cierre de sesión.
 */
function initProfileDropdown() {
    const profileToggle = document.getElementById('userProfileToggle');
    const dropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!profileToggle || !dropdown) return;

    // Garantizar que el texto "Cerrar sesión" exista aunque el HTML servido esté en caché
    if (logoutBtn && !logoutBtn.querySelector('span')) {
        const labelSpan = document.createElement('span');
        labelSpan.textContent = 'Cerrar sesión';
        logoutBtn.appendChild(labelSpan);
    }
    const configBtnEl = document.getElementById('configBtn');
    if (configBtnEl && !configBtnEl.querySelector('span')) {
        const labelSpan = document.createElement('span');
        labelSpan.textContent = 'Configuración';
        configBtnEl.appendChild(labelSpan);
    }

    // Alternar dropdown al hacer clic en el perfil
    profileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!profileToggle.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Cerrar dropdown con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdown.classList.remove('active');
        }
    });

    // Botón "Configuración" -> emitir evento para abrir el modal
    const configBtn = document.getElementById('configBtn');
    if (configBtn) {
        configBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.remove('active');
            if (window.openConfigModal) {
                window.openConfigModal();
            } else {
                console.error("openConfigModal is not defined. Ensure configModal.js is loaded.");
            }
        });
    }

    // Botón "Cerrar sesión" → usar showConfirm existente de popup.js
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            dropdown.classList.remove('active');

            // Usar el sistema de confirmación existente (popup.js → showConfirm)
            const confirmed = await window.showConfirm(
                'Cerrar sesión',
                '¿Estás seguro de que deseas cerrar tu sesión? Tendrás que ingresar tus credenciales de nuevo para acceder.',
                {
                    confirmText: 'Cerrar sesión',
                    cancelText: 'Cancelar',
                    type: 'error'
                }
            );

            if (!confirmed) return;

            // Revocar token en el backend (fire-and-forget, sin esperar respuesta)
            const token = localStorage.getItem('api_token');
            if (token) {
                fetch(CONFIG.API_BASE + '/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }).catch(() => {}); // Ignorar errores, la sesión local ya se limpió
            }

            // Limpiar datos de sesión del navegador inmediatamente
            localStorage.removeItem('api_token');
            localStorage.removeItem('user');

            // Redirigir al login sin esperar al backend
            window.location.href = 'login.html';
        });
    }
}

// Iniciar el proceso
loadHeader();

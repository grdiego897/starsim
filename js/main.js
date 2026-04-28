function loadSidebar() {
    fetch('components/aside.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
            // Inicializar lógica DESPUÉS de inyectar el HTML
            initSidebarLogic();
        });
}

// Función para limpiar datos de misión del localStorage
function clearMissionData() {
    // Campos de mision.js que usan el prefijo misionDraft_
    const misionDraftFields = [
        'mission-name-input', 'program-select', 'destination-select',
        'ship-select', 'booster-select', 'cargo-type-select',
        'cargo-mass-input', 'port-select', 'launch-date-input',
        'landing-type-select', 'landing-id-select'
    ];

    // Campos de configAvanzada.js
    const configFields = [
        'objectives-main', 'objectives-secondary', 'duration-input',
        'crew-input', 'cargoItems'
    ];

    // Limpiar variables de estado de edición
    localStorage.removeItem('editMissionId');
    localStorage.removeItem('editLaunchId');
    localStorage.removeItem('selectedVehicleSrc');

    // Limpiar borradores guardados con prefijo
    misionDraftFields.forEach(id => {
        localStorage.removeItem('misionDraft_' + id);
    });

    // Limpiar configuraciones avanzadas
    configFields.forEach(key => {
        localStorage.removeItem(key);
    });
}

// Función para navegar a Nueva Misión (limpia datos primero)
// Los usuarios con rol 'viewer' no tienen permiso para acceder a esta página.
function goToNewMission() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.role === 'viewer') {
        if (window.showNotification) {
            window.showNotification('No tienes permiso para crear misiones', 3000);
        }
        return;
    }
    clearMissionData();
    if (window.router) {
        window.router.navigateTo('mision');
    } else {
        window.location.hash = 'mision';
    }
}

function initSidebarLogic() {
    const grokForm = document.getElementById('grokSearchForm');
    const grokPopup = document.getElementById('grokPopup');
    const grokTrigger = document.getElementById('grokTrigger');

    // Ocultar opción "Nueva Misión" para usuarios con rol 'viewer'
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.role === 'viewer') {
        // Buscar el <li> del sidebar que llama a goToNewMission y ocultarlo
        const navItems = document.querySelectorAll('#sidebar .nav-menu li');
        navItems.forEach(item => {
            if (item.getAttribute('onclick') && item.getAttribute('onclick').includes('goToNewMission')) {
                item.style.display = 'none';
            }
        });
    }

    // 1. Lógica del formulario Grok
    if (grokForm) {
        grokForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const inputElement = document.querySelector('.grok-input');
            const input = inputElement.value;
            const formattedText = input.trim().replace(/\s+/g, '+');
            window.open("https://grok.com/?q=" + formattedText);

            // Limpiar el contenido y cerrar el widget
            inputElement.value = '';
            if (grokPopup) {
                grokPopup.classList.remove('active');
            }
        });
    }

    // 2. Lógica del toggle del sidebar
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('toggleSidebar');

    if (sidebar && toggle) {
        // Aplicar estado persistido
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }

        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const currentState = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', currentState);
        });
    }

    // 3. Lógica del popup de Grok
    if (grokTrigger && grokPopup) {
        grokTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            grokPopup.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!grokPopup.contains(e.target) && !grokTrigger.contains(e.target)) {
                grokPopup.classList.remove('active');
            }
        });
    }
}

// Iniciar el proceso
loadSidebar();
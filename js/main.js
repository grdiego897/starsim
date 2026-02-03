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
    // Campos de mision.js
    const misionFields = [
        'mission-name-input', 'program-select', 'destination-select',
        'ship-select', 'booster-select', 'cargo-type-select',
        'cargo-mass-input', 'port-select', 'launch-site-select',
        'landing-type-select', 'landing-id-select', 'selectedVehicleSrc'
    ];

    // Campos de configAvanzada.js
    const configFields = [
        'objectives-main', 'objectives-secondary', 'duration-input',
        'crew-input', 'cargoItems'
    ];

    // Añadir editMissionId para ser limpiado
    localStorage.removeItem('editMissionId');

    // Limpiar todos los campos de misión
    [...misionFields, ...configFields].forEach(key => {
        localStorage.removeItem(key);
    });
}

// Función para navegar a Nueva Misión (limpia datos primero)
function goToNewMission() {
    clearMissionData();
    window.location.hash = 'mision';
}

function initSidebarLogic() {
    // 1. Lógica del formulario Grok
    const grokForm = document.getElementById('grokSearchForm');
    if (grokForm) {
        grokForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const input = document.querySelector('.grok-input').value;
            const formattedText = input.trim().replace(/\s+/g, '+');
            window.open("https://grok.com/?q=" + formattedText);
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
    const grokTrigger = document.getElementById('grokTrigger');
    const grokPopup = document.getElementById('grokPopup');
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
function initProgramPage() {
    console.log("Inicializando página de Programa");
    const tbody = document.getElementById('mission-table-body');
    if (!tbody) {
        console.warn("Cuerpo de tabla de misiones no encontrado");
        return;
    }

    function renderTable() {
<<<<<<< HEAD
        // Obtener misiones usando servicio global
        const missions = window.MissionService ? window.MissionService.getAllMissions() : [];
        console.log("Misiones cargadas:", missions);
=======
        // Fetch missions using global service
        let missions = window.MissionService ? window.MissionService.getAllMissions() : [];
        console.log("Missions loaded:", missions);
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7

        const statusSelect = document.getElementById('status-filter');
        const launcherSelect = document.getElementById('launcher-filter');
        const currentStatusFilter = statusSelect ? statusSelect.value : 'all';
        const currentLauncherFilter = launcherSelect ? launcherSelect.value : 'all';

        if (currentStatusFilter !== 'all') {
            missions = missions.filter(m => (m.status || 'programado') === currentStatusFilter);
        }

        if (currentLauncherFilter !== 'all') {
            missions = missions.filter(m => {
                const ship = m.ship || '';
                return ship.toLowerCase() === currentLauncherFilter.toLowerCase();
            });
        }

        tbody.innerHTML = '';

        if (missions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: #888;">No hay misiones coincidentes.</td></tr>';
            return;
        }

        // Ordenar por más reciente primero
        missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        missions.forEach(mission => {
            const tr = document.createElement('tr');

            // Formatear fecha (preferir launchDate, usar createdAt como respaldo)
            const dateObj = new Date(mission.launchDate || mission.createdAt);
            const dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

<<<<<<< HEAD
            // Construir HTML de fila
=======
            // Status handling
            const currentStatus = mission.status || 'programado';
            const statusClassMap = {
                'programado': 'programmed',
                'confirmado': 'confirmed',
                'hold': 'hold',
                'cancelado': 'cancelled'
            };
            const currentClass = statusClassMap[currentStatus] || 'programmed';

            // Construct row HTML
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
            tr.innerHTML = `
                <td><span style="font-weight: 600; color: white;">${mission.name || 'Misión'}</span> - ${mission.ship || 'Nave'}</td>
                <td>${dateStr}</td>
                <td>
                    <select class="status-pill status-select ${currentClass}" data-id="${mission.id}">
                        <option value="programado" ${currentStatus === 'programado' ? 'selected' : ''}>Programado</option>
                        <option value="confirmado" ${currentStatus === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                        <option value="hold"       ${currentStatus === 'hold' ? 'selected' : ''}>Hold</option>
                        <option value="cancelado"  ${currentStatus === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" data-id="${mission.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Editar
                        </button>
                        <button class="btn-delete" data-id="${mission.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Eliminar
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

<<<<<<< HEAD
        // Delegación de eventos para acciones (Editar/Eliminar)
        tbody.onclick = function (e) {
            // Manejar Edición
            const btnEdit = e.target.closest('.btn-edit');
            if (btnEdit) {
                const id = btnEdit.getAttribute('data-id');
                console.log('Clic en Editar, ID:', id);
                if (id && id !== 'undefined') {
                    localStorage.setItem('editMissionId', id);
                    window.router.navigateTo('mision');
                } else {
                    console.error('Falta Data ID en botón de editar');
                }
                return;
            }

            // Manejar Eliminación
            const btnDelete = e.target.closest('.btn-delete');
            if (btnDelete) {
                const id = btnDelete.getAttribute('data-id');
                if (confirm('¿Estás seguro de eliminar esta misión?')) {
                    if (window.MissionService.deleteMission(id)) {
                        renderTable();
                    }
=======
    }

    // Event delegation outside of renderTable to avoid multiple bindings
    tbody.addEventListener('change', function (e) {
        if (e.target.classList.contains('status-select')) {
            const id = e.target.getAttribute('data-id');
            const newStatus = e.target.value;
            if (id && window.MissionService) {
                const mission = window.MissionService.getMissionById(id);
                if (mission) {
                    mission.status = newStatus;
                    window.MissionService.updateMission(mission);
                    renderTable();
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
                }
            }
        }
    });

    tbody.onclick = async function (e) {
        // Handle Edit
        const btnEdit = e.target.closest('.btn-edit');
        if (btnEdit) {
            const id = btnEdit.getAttribute('data-id');
            console.log('Edit clicked, ID:', id);
            if (id && id !== 'undefined') {
                localStorage.setItem('editMissionId', id);
                window.router.navigateTo('mision');
            } else {
                console.error('Missing Data ID on edit button');
            }
            return;
        }

        // Handle Delete
        const btnDelete = e.target.closest('.btn-delete');
        if (btnDelete) {
            const id = btnDelete.getAttribute('data-id');
            const confirmed = await window.showConfirm(
                'Eliminar misión',
                '¿Estás seguro de que deseas eliminar esta misión? Esta acción no se puede deshacer.',
                { confirmText: 'Eliminar', cancelText: 'Cancelar', type: 'error' }
            );
            if (confirmed) {
                if (window.MissionService.deleteMission(id)) {
                    renderTable();
                }
            }
        }
    };

    const statusSelect = document.getElementById('status-filter');
    if (statusSelect) {
        statusSelect.addEventListener('change', renderTable);
    }

    const launcherSelect = document.getElementById('launcher-filter');
    if (launcherSelect) {
        launcherSelect.addEventListener('change', renderTable);
    }

    renderTable();
}

// Exponer globalmente
window.initProgramPage = initProgramPage;

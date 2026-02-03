function initProgramPage() {
    console.log("Initializing Program Page");
    const tbody = document.getElementById('mission-table-body');
    if (!tbody) {
        console.warn("Mission table body not found");
        return;
    }

    function renderTable() {
        // Fetch missions using global service
        const missions = window.MissionService ? window.MissionService.getAllMissions() : [];
        console.log("Missions loaded:", missions);

        tbody.innerHTML = '';

        if (missions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: #888;">No hay misiones programadas.</td></tr>';
            return;
        }

        // Sort by newest first
        missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        missions.forEach(mission => {
            const tr = document.createElement('tr');

            // Format date (prefer launchDate, fallback to createdAt)
            const dateObj = new Date(mission.launchDate || mission.createdAt);
            const dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

            // Construct row HTML
            tr.innerHTML = `
                <td><span style="font-weight: 600; color: white;">${mission.name || 'Misión'}</span> - ${mission.ship || 'Nave'}</td>
                <td>${dateStr}</td>
                <td><span class="status-pill programmed">Programado</span></td>
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

        // Event delegation for actions (Edit/Delete)
        tbody.onclick = function (e) {
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
                if (confirm('¿Estás seguro de eliminar esta misión?')) {
                    if (window.MissionService.deleteMission(id)) {
                        renderTable();
                    }
                }
            }
        };
    }

    renderTable();
}

// Expose globally
window.initProgramPage = initProgramPage;

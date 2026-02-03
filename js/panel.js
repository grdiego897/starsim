function initPanelPage() {
    console.log("Initializing Panel Page");
    const tbody = document.getElementById('upcoming-missions-list');

    // NOTE: In panel.html, the table body ID will be 'upcoming-missions-list'
    if (!tbody) {
        console.warn("Upcoming missions list not found");
        return;
    }

    function renderUpcoming() {
        // Fetch missions using global service
        const missions = window.MissionService ? window.MissionService.getAllMissions() : [];

        // Update pending count
        const countEl = document.getElementById('pending-missions-count');
        if (countEl) {
            countEl.textContent = missions.length;
        }

        // Sort by newest first (same as program logic)
        // User requested: "3 primeras misiones creadas (al igual que en program.html)" 
        // Assuming "primeras" implies "top of the list", which in Program is sorted by date (newest/upcoming).
        // Actually, if it's "Program", usually it's sorted by creation or program date?
        // program.js used: missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Take top 3
        const top3 = missions.slice(0, 3);

        tbody.innerHTML = '';

        if (top3.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: #888;">No hay misiones próximas.</td></tr>';
            return;
        }

        top3.forEach(mission => {
            const tr = document.createElement('tr');

            // Format date
            const dateObj = new Date(mission.launchDate || mission.createdAt);
            const dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

            tr.innerHTML = `
                <td>${mission.name || 'Misión'}</td>
                <td>${dateStr}</td>
                <td><span class="badge badge-scheduled" style="background-color: #333; color: white; padding: 5px 10px; border-radius: 12px; font-size: 0.8rem;">Programado</span></td>
                <td class="actions-cell">
                    <button class="btn-action btn-edit" data-id="${mission.id}" style="background:none; border:none; color: #ccc; cursor: pointer;">
                        Editar
                    </button>
                    <button class="btn-action btn-delete" data-id="${mission.id}" style="background:none; border:none; color: #da3434; cursor: pointer; margin-left: 10px;">
                        Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Event delegation for actions
        tbody.onclick = function (e) {
            // Edit
            const btnEdit = e.target.closest('.btn-edit');
            if (btnEdit) {
                const id = btnEdit.getAttribute('data-id');
                if (id) {
                    localStorage.setItem('editMissionId', id);
                    window.router.navigateTo('mision');
                }
                return;
            }

            // Delete
            const btnDelete = e.target.closest('.btn-delete');
            if (btnDelete) {
                const id = btnDelete.getAttribute('data-id');
                if (confirm('¿Estás seguro de eliminar esta misión?')) {
                    if (window.MissionService.deleteMission(id)) {
                        renderUpcoming(); // Re-render
                    }
                }
            }
        };
    }

    renderUpcoming();
}

// Expose globally
window.initPanelPage = initPanelPage;

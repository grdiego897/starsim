function initPanelPage() {
    console.log("Inicializando página de Panel");
    const tbody = document.getElementById('upcoming-missions-list');

    // NOTA: En panel.html, el ID del cuerpo de la tabla será 'upcoming-missions-list'
    if (!tbody) {
        console.warn("Lista de misiones próximas no encontrada");
        return;
    }

    function renderUpcoming() {
        // Obtener misiones usando servicio global
        const missions = window.MissionService ? window.MissionService.getAllMissions() : [];

        // Actualizar contador de pendientes
        const countEl = document.getElementById('pending-missions-count');
        if (countEl) {
            countEl.textContent = missions.length;
        }

        // Ordenar por más reciente primero (misma lógica que program)
        // El usuario solicitó: "3 primeras misiones creadas (al igual que en program.html)" 
        // Asumiendo que "primeras" implica "arriba de la lista", que en Program está ordenado por fecha (más reciente/próximo).
        // En realidad, si es "Program", ¿normalmente se ordena por creación o fecha de programa?
        // program.js usó: missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Tomar las 3 primeras
        const top3 = missions.slice(0, 3);

        tbody.innerHTML = '';

        if (top3.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: #888;">No hay misiones próximas.</td></tr>';
            return;
        }

        top3.forEach(mission => {
            const tr = document.createElement('tr');

            // Formatear fecha
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

        // Delegación de eventos para acciones
        tbody.onclick = function (e) {
            // Editar
            const btnEdit = e.target.closest('.btn-edit');
            if (btnEdit) {
                const id = btnEdit.getAttribute('data-id');
                if (id) {
                    localStorage.setItem('editMissionId', id);
                    window.router.navigateTo('mision');
                }
                return;
            }

            // Eliminar
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

// Exponer globalmente
window.initPanelPage = initPanelPage;

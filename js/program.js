function initProgramPage() {
    console.log("Inicializando página de Programa");
    const tbody = document.getElementById('mission-table-body');
    if (!tbody) {
        console.warn("Cuerpo de tabla de misiones no encontrado");
        return;
    }

    const launcherNames = {
        'starship': 'Starship',
        'superheavy': 'Starship',
        'falconheavy': 'Falcon Heavy',
        'falcon9': 'Falcon 9',
        'dragon': 'Falcon 9',
        'falcon-fairing': 'Falcon Heavy'
    };

    // Ocultar columna de acciones para viewers
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const isViewer = userData.role === 'viewer';
    if (isViewer) {
        // En program.html la tabla no tiene clase específica para el th de acciones, 
        // usamos nth-child o buscamos por texto
        const headers = document.querySelectorAll('.program-table thead th');
        headers.forEach(th => {
            if (th.textContent.trim() === 'ACCIONES') th.style.display = 'none';
        });
    }

    function getLauncherName(mission) {
        const launch = (mission.launches && mission.launches[0]) || {};
        const ship = (launch.ship || '').toLowerCase();
        const booster = (launch.booster || '').toLowerCase();
        if (ship === 'starship' || booster === 'superheavy') return 'Starship';
        if (booster === 'falconheavy' || ship === 'falcon-fairing') return 'Falcon Heavy';
        if (ship || booster) return launcherNames[ship] || launcherNames[booster] || 'Falcon 9';
        return 'Sin lanzador';
    }

    function showLoading() {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: #888;">Cargando misiones...</td></tr>';
    }

    function showError(msg) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #ff6b6b;">${msg}</td></tr>`;
    }

    async function renderTable() {
        if (!window.MissionService) {
            showError('Servicio de misiones no disponible.');
            return;
        }

        showLoading();
        let missions = await window.MissionService.getAllMissions();

        if (window.MissionService.lastError) {
            showError(window.MissionService.lastError);
            return;
        }

        const statusSelect = document.getElementById('status-filter');
        const launcherSelect = document.getElementById('launcher-filter');
        const entitySelect = document.getElementById('entity-filter');
        const programSelect = document.getElementById('program-filter');
        const currentStatusFilter = statusSelect ? statusSelect.value : 'all';
        const currentLauncherFilter = launcherSelect ? launcherSelect.value : 'all';
        const currentEntityFilter = entitySelect ? entitySelect.value : 'all';
        const currentProgramFilter = programSelect ? programSelect.value : 'all';

        if (entitySelect) {
            const entityNames = Array.from(new Set(
                missions.map(m => m.entidad?.name).filter(Boolean)
            )).sort((a, b) => a.localeCompare(b));
            const previous = entitySelect.value;
            entitySelect.innerHTML = '<option value="all">Entidad</option>' +
                entityNames.map(n => `<option value="${n}">${n}</option>`).join('');
            entitySelect.value = entityNames.includes(previous) || previous === 'all' ? previous : 'all';
        }

        if (programSelect) {
            const programNames = Array.from(new Set(
                missions.map(m => m.program).filter(Boolean)
            )).sort((a, b) => a.localeCompare(b));
            const previous = programSelect.value;
            programSelect.innerHTML = '<option value="all">Programa</option>' +
                programNames.map(n => `<option value="${n}">${n}</option>`).join('');
            programSelect.value = programNames.includes(previous) || previous === 'all' ? previous : 'all';
        }

        if (currentStatusFilter !== 'all') {
            missions = missions.filter(m => {
                const fl = (m.launches && m.launches[0]) || {};
                const d = new Date(fl.launchDate || m.launchDate || m.createdAt);
                const isPast = !isNaN(d.getTime()) && d.getTime() < Date.now();
                if (currentStatusFilter === 'lanzado') return isPast;
                if (isPast) return false;
                return (m.status || 'programado') === currentStatusFilter;
            });
        }

        if (currentLauncherFilter !== 'all') {
            missions = missions.filter(m => getLauncherName(m) === currentLauncherFilter);
        }

        if (currentEntityFilter !== 'all') {
            missions = missions.filter(m => (m.entidad?.name || '') === currentEntityFilter);
        }

        if (currentProgramFilter !== 'all') {
            missions = missions.filter(m => (m.program || '') === currentProgramFilter);
        }

        tbody.innerHTML = '';

        if (missions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: #888;">No hay misiones coincidentes.</td></tr>';
            return;
        }

        missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        missions.forEach(mission => {
            const tr = document.createElement('tr');

            const firstLaunch = (mission.launches && mission.launches[0]) || {};
            const launchDateRaw = firstLaunch.launchDate || mission.launchDate || mission.createdAt;
            const dateObj = new Date(launchDateRaw);
            const dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
            const isPast = !isNaN(dateObj.getTime()) && dateObj.getTime() < Date.now();

            const currentStatus = mission.status || 'programado';
            const statusClassMap = {
                'programado': 'programmed',
                'confirmado': 'confirmed',
                'hold': 'hold',
                'cancelado': 'cancelled'
            };
            const currentClass = statusClassMap[currentStatus] || 'programmed';

            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const isViewer = userData.role === 'viewer';

            const statusCell = isPast
                ? `<span class="status-pill launched" data-id="${mission.id}">Lanzado</span>`
                : `<select class="status-pill status-select ${currentClass}" data-id="${mission.id}" ${isViewer ? 'disabled' : ''}>
                        <option value="programado" ${currentStatus === 'programado' ? 'selected' : ''}>Programado</option>
                        <option value="confirmado" ${currentStatus === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                        <option value="hold"       ${currentStatus === 'hold' ? 'selected' : ''}>Hold</option>
                        <option value="cancelado"  ${currentStatus === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>`;

            tr.innerHTML = `
                <td><span style="font-weight: 600; color: white;">${mission.name || 'Misión'}</span> - ${getLauncherName(mission)}</td>
                <td><span class="badge" style="background: rgba(255,255,255,0.1); color: #ccc;">${mission.entidad?.name || '-'}</span></td>
                <td>${mission.program || '-'}</td>
                <td>${dateStr}</td>
                <td>${statusCell}</td>
                ${isViewer ? '' : `
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
                `}
            `;
            tbody.appendChild(tr);
        });
    }

    // Cambio de estado
    tbody.addEventListener('change', async function (e) {
        if (e.target.classList.contains('status-select')) {
            const id = e.target.getAttribute('data-id');
            const newStatus = e.target.value;
            const previousValue = e.target.dataset.previous || newStatus;
            if (id && window.MissionService) {
                e.target.disabled = true;
                const ok = await window.MissionService.updateStatus(id, newStatus);
                e.target.disabled = false;
                if (!ok) {
                    e.target.value = previousValue;
                    const msg = window.MissionService.lastError || 'No se pudo cambiar el estado.';
                    if (window.showPopup) window.showPopup('Error', msg, 'error');
                    else alert(msg);
                } else {
                    e.target.dataset.previous = newStatus;
                }
            }
        }
    });

    tbody.onclick = async function (e) {
        const btnEdit = e.target.closest('.btn-edit');
        if (btnEdit) {
            const id = btnEdit.getAttribute('data-id');
            if (id && id !== 'undefined') {
                localStorage.setItem('editMissionId', id);
                window.router.navigateTo('mision');
            } else {
                console.error('Missing Data ID on edit button');
            }
            return;
        }

        const btnDelete = e.target.closest('.btn-delete');
        if (btnDelete) {
            const id = btnDelete.getAttribute('data-id');
            const confirmed = await window.showConfirm(
                'Eliminar misión',
                '¿Estás seguro de que deseas eliminar esta misión? Esta acción no se puede deshacer.',
                { confirmText: 'Eliminar', cancelText: 'Cancelar', type: 'error' }
            );
            if (confirmed) {
                btnDelete.disabled = true;
                const ok = await window.MissionService.deleteMission(id);
                btnDelete.disabled = false;
                if (ok) {
                    renderTable();
                } else {
                    const msg = window.MissionService.lastError || 'No se pudo eliminar la misión.';
                    if (window.showPopup) window.showPopup('Error', msg, 'error');
                    else alert(msg);
                }
            }
        }
    };

    const statusSelect = document.getElementById('status-filter');
    if (statusSelect) statusSelect.addEventListener('change', renderTable);

    const launcherSelect = document.getElementById('launcher-filter');
    if (launcherSelect) launcherSelect.addEventListener('change', renderTable);

    const entitySelect = document.getElementById('entity-filter');
    if (entitySelect) entitySelect.addEventListener('change', renderTable);

    const programSelect = document.getElementById('program-filter');
    if (programSelect) programSelect.addEventListener('change', renderTable);

    renderTable();

    let unsubscribe = null;
    if (window.MissionService && window.MissionService.subscribe) {
        unsubscribe = window.MissionService.subscribe(renderTable);
    }

    if (tbody && unsubscribe) {
        const observer = new MutationObserver(() => {
            if (!document.contains(tbody)) {
                unsubscribe();
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

window.initProgramPage = initProgramPage;

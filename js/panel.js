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

            // Status handling
            const currentStatus = mission.status || 'programado';
            const statusClassMap = {
                'programado': 'badge-scheduled',
                'confirmado': 'badge-confirmed',
                'hold': 'badge-hold',
                'cancelado': 'badge-cancelled'
            };
            const currentClass = statusClassMap[currentStatus] || 'badge-scheduled';

            tr.innerHTML = `
                <td>${mission.name || 'Misión'}</td>
                <td>${dateStr}</td>
                <td>
                    <select class="badge badge-select ${currentClass}" data-id="${mission.id}">
                        <option value="programado" ${currentStatus === 'programado' ? 'selected' : ''}>Programado</option>
                        <option value="confirmado" ${currentStatus === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                        <option value="hold"       ${currentStatus === 'hold' ? 'selected' : ''}>Hold</option>
                        <option value="cancelado"  ${currentStatus === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
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
    }

    // Event delegation for actions and Status Change
    tbody.addEventListener('change', function (e) {
        if (e.target.classList.contains('badge-select')) {
            const id = e.target.getAttribute('data-id');
            const newStatus = e.target.value;
            if (id && window.MissionService) {
                const mission = window.MissionService.getMissionById(id);
                if (mission) {
                    mission.status = newStatus;
                    window.MissionService.updateMission(mission);
                    renderUpcoming();
                }
            }
        }
    });

    tbody.onclick = async function (e) {
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

        // Eliminar
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
                    renderUpcoming(); // Re-render
                }
            }
        }
    };

    renderUpcoming();

    // --- Countdown dinámico a la próxima misión ---
    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMins = document.getElementById('cd-mins');
    const cdSecs = document.getElementById('cd-secs');
    const cdName = document.getElementById('countdown-mission-name');
    const cdTimer = document.getElementById('countdown-timer');
    const cdInfo = document.getElementById('countdown-info');
    const cdEmpty = document.getElementById('countdown-empty');

    let countdownTarget = null; // { name, launchDate }
    let countdownInterval = null;

    function findNextMission() {
        const missions = window.MissionService ? window.MissionService.getAllMissions() : [];
        const now = Date.now();
        let closest = null;

        missions.forEach(m => {
            // Solo misiones programadas o confirmadas
            const status = m.status || 'programado';
            if (status !== 'programado' && status !== 'confirmado') return;

            // Buscar en los lanzamientos de la misión
            const launches = m.launches || [];
            launches.forEach(l => {
                if (!l.launchDate) return;
                const dt = new Date(l.launchDate).getTime();
                if (dt > now && (!closest || dt < closest.time)) {
                    closest = { name: m.name || 'Misión', time: dt };
                }
            });

            // Fallback: launchDate directa en la misión (estructura legacy)
            if (m.launchDate) {
                const dt = new Date(m.launchDate).getTime();
                if (dt > now && (!closest || dt < closest.time)) {
                    closest = { name: m.name || 'Misión', time: dt };
                }
            }
        });

        return closest;
    }

    function updateCountdown() {
        if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

        if (!countdownTarget) {
            // Sin misión próxima — mostrar fallback
            if (cdTimer) cdTimer.style.display = 'none';
            if (cdInfo) cdInfo.style.display = 'none';
            if (cdEmpty) cdEmpty.style.display = 'block';
            return;
        }

        // Asegurar que el timer esté visible
        if (cdTimer) cdTimer.style.display = '';
        if (cdInfo) cdInfo.style.display = '';
        if (cdEmpty) cdEmpty.style.display = 'none';

        const diff = countdownTarget.time - Date.now();

        if (diff <= 0) {
            cdDays.textContent = '0';
            cdHours.textContent = '0';
            cdMins.textContent = '0';
            cdSecs.textContent = '0';
            return;
        }

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        cdDays.textContent = days;
        cdHours.textContent = hours;
        cdMins.textContent = mins;
        cdSecs.textContent = secs;
    }

    function refreshCountdown() {
        countdownTarget = findNextMission();
        if (cdName && countdownTarget) {
            cdName.textContent = countdownTarget.name;
        }
        updateCountdown();
    }

    // Iniciar countdown
    refreshCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);

    // Suscribirse a cambios de datos para mantener la tabla y el countdown sincronizados
    let unsubscribe = null;
    if (window.MissionService && window.MissionService.subscribe) {
        unsubscribe = window.MissionService.subscribe(() => {
            renderUpcoming();
            refreshCountdown();
        });
    }

    // Limpiar la suscripción e intervalo cuando el contenedor sea eliminado del DOM
    if (tbody) {
        const observer = new MutationObserver(() => {
            if (!document.contains(tbody)) {
                if (unsubscribe) unsubscribe();
                if (countdownInterval) clearInterval(countdownInterval);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // --- Hover Charts (Chart.js) ---
    initHoverCharts();
}

function initHoverCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded — hover charts disabled');
        return;
    }

    const chartInstances = {};

    // --- Lanzamientos pendientes (Bar chart — missions per vehicle) ---
    const launchWrapper = document.getElementById('card-launches');
    if (launchWrapper) {
        launchWrapper.addEventListener('mouseenter', function handler() {
            if (chartInstances.launches) return;
            const ctx = document.getElementById('chart-launches');
            if (!ctx) return;

            // Build vehicle counts from real missions (iterate launches inside each mission)
            const missions = window.MissionService ? window.MissionService.getAllMissions() : [];
            const counts = { 'Starship': 0, 'Falcon 9': 0, 'Falcon Heavy': 0 };

            missions.forEach(m => {
                const launches = m.launches || [];
                launches.forEach(l => {
                    if (l.ship === 'starship' || l.booster === 'superheavy') {
                        counts['Starship']++;
                    } else if (l.booster === 'falconheavy') {
                        counts['Falcon Heavy']++;
                    } else {
                        counts['Falcon 9']++;
                    }
                });
            });

            chartInstances.launches = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        label: 'Misiones',
                        data: Object.values(counts),
                        backgroundColor: [
                            'rgba(52, 152, 219, 0.75)',
                            'rgba(46, 204, 113, 0.75)',
                            'rgba(241, 196, 15, 0.75)'
                        ],
                        borderColor: [
                            '#3498db',
                            '#2ecc71',
                            '#f1c40f'
                        ],
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: barLineOptions('Misiones por vehículo')
            });
        });
    }

    // --- Pads (Doughnut chart — wired to displayed value) ---
    const padsWrapper = document.getElementById('card-pads');
    if (padsWrapper) {
        padsWrapper.addEventListener('mouseenter', function handler() {
            if (chartInstances.pads) return;
            const ctx = document.getElementById('chart-pads');
            if (!ctx) return;

            // Read the displayed value (e.g. "2/4") from the card
            const padsCard = padsWrapper.querySelector('.card-value');
            let occupied = 2, total = 4;
            if (padsCard) {
                const parts = padsCard.textContent.trim().split('/');
                if (parts.length === 2) {
                    occupied = parseInt(parts[0], 10) || 0;
                    total = parseInt(parts[1], 10) || 4;
                }
            }
            const available = total - occupied;

            chartInstances.pads = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Ocupados', 'Disponibles'],
                    datasets: [{
                        data: [occupied, available],
                        backgroundColor: [
                            'rgba(231, 76, 60, 0.8)',
                            'rgba(46, 204, 113, 0.8)'
                        ],
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: { color: '#ccc', font: { size: 11 }, padding: 8 }
                        },
                        title: {
                            display: true,
                            text: 'Estado de Pads',
                            color: '#fff',
                            font: { size: 13, weight: 400 },
                            padding: { bottom: 6 }
                        }
                    }
                }
            });
        });
    }

    // --- Tasa de Éxito (Pie chart — wired to displayed percentage) ---
    const successWrapper = document.getElementById('card-success');
    if (successWrapper) {
        successWrapper.addEventListener('mouseenter', function handler() {
            if (chartInstances.success) return;
            const ctx = document.getElementById('chart-success');
            if (!ctx) return;

            // Read displayed percentage (e.g. "98%") from the card
            const successCard = successWrapper.querySelector('.card-value');
            let successRate = 98;
            if (successCard) {
                const parsed = parseInt(successCard.textContent, 10);
                if (!isNaN(parsed)) successRate = parsed;
            }
            const failRate = 100 - successRate;

            chartInstances.success = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Éxito', 'Fallos'],
                    datasets: [{
                        data: [successRate, failRate],
                        backgroundColor: [
                            'rgba(46, 204, 113, 0.85)',
                            'rgba(231, 76, 60, 0.85)'
                        ],
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: { color: '#ccc', font: { size: 11 }, padding: 8 }
                        },
                        title: {
                            display: true,
                            text: 'Tasa de Éxito',
                            color: '#fff',
                            font: { size: 13, weight: 400 },
                            padding: { bottom: 6 }
                        }
                    }
                }
            });
        });
    }
}

/** Shared chart options for bar charts */
function barLineOptions(titleText) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: titleText,
                color: '#fff',
                font: { size: 13, weight: 400 },
                padding: { bottom: 6 }
            }
        },
        scales: {
            x: {
                ticks: { color: '#aaa', font: { size: 10 } },
                grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#aaa',
                    font: { size: 10 },
                    stepSize: 1
                },
                grid: { color: 'rgba(255,255,255,0.08)' }
            }
        }
    };
}

// Exponer globalmente
window.initPanelPage = initPanelPage;

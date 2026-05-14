function initPanelPage() {
    console.log("Inicializando página de Panel");
    const tbody = document.getElementById('upcoming-missions-list');

    if (!tbody) {
        console.warn("Lista de misiones próximas no encontrada");
        return;
    }

    // Ocultar columna de acciones para viewers
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const isViewer = userData.role === 'viewer';
    if (isViewer) {
        const actionsHeader = document.querySelector('.program-section thead th.actions-cell');
        if (actionsHeader) actionsHeader.style.display = 'none';
    }

    function showLoadingRow() {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: #888;">Cargando misiones...</td></tr>';
    }

    function showErrorRow(msg) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #ff6b6b;">${msg}</td></tr>`;
    }

    async function renderUpcoming() {
        if (!window.MissionService) {
            showErrorRow('Servicio de misiones no disponible.');
            return;
        }

        showLoadingRow();
        const missions = await window.MissionService.getAllMissions();

        if (window.MissionService.lastError) {
            showErrorRow(window.MissionService.lastError);
            return;
        }

        const countEl = document.getElementById('pending-missions-count');
        if (countEl) countEl.textContent = missions.length;

        missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const top3 = missions.slice(0, 3);

        tbody.innerHTML = '';

        if (top3.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: #888;">No hay misiones próximas.</td></tr>';
            return;
        }

        top3.forEach(mission => {
            const tr = document.createElement('tr');

            const firstLaunch = (mission.launches && mission.launches[0]) || {};
            const dateObj = new Date(firstLaunch.launchDate || mission.launchDate || mission.createdAt);
            const dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
            const isPast = !isNaN(dateObj.getTime()) && dateObj.getTime() < Date.now();
            const shell = firstLaunch.shell || mission.shell || '';
            const programLabel = (mission.program || '').toLowerCase() === 'starlink' && shell
                ? `Starlink - ${shell}`
                : (mission.program || '-');

            const currentStatus = mission.status || 'programado';
            const statusClassMap = {
                'programado': 'badge-scheduled',
                'confirmado': 'badge-confirmed',
                'hold': 'badge-hold',
                'cancelado': 'badge-cancelled'
            };
            const currentClass = statusClassMap[currentStatus] || 'badge-scheduled';

            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const isViewer = userData.role === 'viewer';

            const statusCell = isPast
                ? `<span class="badge badge-launched" data-id="${mission.id}">Lanzado</span>`
                : `<select class="badge badge-select ${currentClass}" data-id="${mission.id}" ${isViewer ? 'disabled' : ''}>
                        <option value="programado" ${currentStatus === 'programado' ? 'selected' : ''}>Programado</option>
                        <option value="confirmado" ${currentStatus === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                        <option value="hold"       ${currentStatus === 'hold' ? 'selected' : ''}>Hold</option>
                        <option value="cancelado"  ${currentStatus === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>`;

            tr.innerHTML = `
                <td>${mission.name || 'Misión'}</td>
                <td><span class="badge" style="background: rgba(255,255,255,0.1); color: #ccc;">${mission.entidad?.name || '-'}</span></td>
                <td>${programLabel}</td>
                <td>${dateStr}</td>
                <td>${statusCell}</td>
                ${isViewer ? '' : `
                <td class="actions-cell">
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" data-id="${mission.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Editar
                        </button>
                        <button class="btn-action btn-delete" data-id="${mission.id}">
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

    tbody.addEventListener('change', async function (e) {
        if (e.target.classList.contains('badge-select')) {
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
            if (id) {
                localStorage.setItem('editMissionId', id);
                window.router.navigateTo('mision');
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
                    renderUpcoming();
                } else {
                    const msg = window.MissionService.lastError || 'No se pudo eliminar la misión.';
                    if (window.showPopup) window.showPopup('Error', msg, 'error');
                    else alert(msg);
                }
            }
        }
    };

    renderUpcoming();

    // --- Countdown ---
    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMins = document.getElementById('cd-mins');
    const cdSecs = document.getElementById('cd-secs');
    const cdName = document.getElementById('countdown-mission-name');
    const cdTimer = document.getElementById('countdown-timer');
    const cdInfo = document.getElementById('countdown-info');
    const cdEmpty = document.getElementById('countdown-empty');

    let countdownTarget = null;
    let countdownInterval = null;
    let countdownLoaded = false;

    function findNextMission(missions) {
        const now = Date.now();
        let closest = null;

        missions.forEach(m => {
            const status = m.status || 'programado';
            if (status !== 'programado' && status !== 'confirmado') return;

            const launches = m.launches || [];
            launches.forEach(l => {
                if (!l.launchDate) return;
                const dt = new Date(l.launchDate).getTime();
                if (dt > now && (!closest || dt < closest.time)) {
                    closest = { name: m.name || 'Misión', time: dt, id: m.id, port: l.port || m.port || 'starbase' };
                }
            });

            if (m.launchDate) {
                const dt = new Date(m.launchDate).getTime();
                if (dt > now && (!closest || dt < closest.time)) {
                    closest = { name: m.name || 'Misión', time: dt, id: m.id, port: m.port || 'starbase' };
                }
            }
        });

        return closest;
    }

    function updateCountdown() {
        if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

        if (!countdownTarget) {
            if (!countdownLoaded) {
                if (cdTimer) cdTimer.style.display = 'none';
                if (cdInfo) cdInfo.style.display = 'none';
                if (cdEmpty) {
                    cdEmpty.style.display = 'block';
                    cdEmpty.textContent = 'Cargando próxima misión...';
                }
                return;
            }
            if (cdTimer) cdTimer.style.display = 'none';
            if (cdInfo) cdInfo.style.display = 'none';
            if (cdEmpty) {
                cdEmpty.style.display = 'block';
                cdEmpty.textContent = 'Sin misiones próximas programadas';
            }
            return;
        }

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
        cdHours.textContent = String(hours).padStart(2, '0');
        cdMins.textContent = String(mins).padStart(2, '0');
        cdSecs.textContent = String(secs).padStart(2, '0');
    }

    async function refreshCountdown() {
        if (!window.MissionService) return;
        const missions = await window.MissionService.getAllMissions();
        countdownTarget = findNextMission(missions);
        countdownLoaded = true;
        if (cdName && countdownTarget) cdName.textContent = countdownTarget.name;
        updateCountdown();

        if (countdownTarget && countdownTarget.id && typeof fetchWeather === 'function') {
            fetchWeather(countdownTarget.port, countdownTarget.id, () => {
                renderUpcoming();
            });
        }
    }

    refreshCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);

    let unsubscribe = null;
    if (window.MissionService && window.MissionService.subscribe) {
        unsubscribe = window.MissionService.subscribe(() => {
            renderUpcoming();
            refreshCountdown();
        });
    }

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

    initHoverCharts();
}

function initHoverCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded — hover charts disabled');
        return;
    }

    const chartInstances = {};

    const launchWrapper = document.getElementById('card-launches');
    if (launchWrapper) {
        launchWrapper.addEventListener('mouseenter', async function handler() {
            if (chartInstances.launches) return;
            const ctx = document.getElementById('chart-launches');
            if (!ctx) return;

            const missions = window.MissionService ? await window.MissionService.getAllMissions() : [];
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

    const padsWrapper = document.getElementById('card-pads');
    if (padsWrapper) {
        padsWrapper.addEventListener('mouseenter', function handler() {
            if (chartInstances.pads) return;
            const ctx = document.getElementById('chart-pads');
            if (!ctx) return;

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

    const successWrapper = document.getElementById('card-success');
    if (successWrapper) {
        successWrapper.addEventListener('mouseenter', function handler() {
            if (chartInstances.success) return;
            const ctx = document.getElementById('chart-success');
            if (!ctx) return;

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

async function fetchWeather(port = 'starbase', missionId = null, rerenderCallback = null) {
    try {
        const portCities = {
            'starbase': 'Starbase, Texas',
            'cape': 'Cape Canaveral',
            'vandenberg': 'Vandenberg Space Force Base',
            'kourou': 'Kourou',
            'azores': 'Azores'
        };

        const cityQuery = portCities[port] || 'Starbase, Texas';

        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityQuery)}&limit=1`;
        const geoRes = await fetch(geoUrl, {
            headers: { 'Accept-Language': 'es' }
        });

        if (!geoRes.ok) throw new Error("Geocoding API error");
        const geoData = await geoRes.json();

        let lat = 25.9973;
        let lon = -97.1555;

        if (geoData && geoData.length > 0) {
            lat = geoData[0].lat;
            lon = geoData[0].lon;
        } else {
            console.warn(`City not found: ${cityQuery}. Using default coordinates.`);
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather API error");
        const data = await response.json();

        const current = data.current;
        const temp = Math.round(current.temperature_2m);
        const wind = Math.round(current.wind_speed_10m);
        const precip = current.precipitation;
        const code = current.weather_code;

        const windEl = document.getElementById('weather-wind');
        const tempEl = document.getElementById('weather-temp');
        const precipEl = document.getElementById('weather-precip');
        const titleEl = document.getElementById('weather-title');
        const viabilityEl = document.getElementById('weather-viability');
        const portEl = document.getElementById('weather-port');

        if (windEl) windEl.textContent = `${wind} km/h`;
        if (tempEl) tempEl.textContent = `${temp} °C`;
        if (precipEl) precipEl.textContent = `${precip} mm`;

        let weatherTitle = 'Pronóstico';
        let viabilityText = '--';
        let viabilityClass = '';
        let missionStatus = null;
        let weatherIconSrc = 'img/ic/sunic.png';

        if (code === 0) {
            weatherTitle = 'Despejado';
            viabilityText = 'Go';
            viabilityClass = 'viability-go';
            missionStatus = 'confirmado';
            weatherIconSrc = 'img/ic/sunic.png';
        } else if ([1, 2, 3, 45, 48].includes(code)) {
            weatherTitle = 'Nublado';
            viabilityText = 'Hold';
            viabilityClass = 'viability-hold';
            missionStatus = 'hold';
            weatherIconSrc = 'img/ic/cloudic.png';
        } else if (code >= 51) {
            weatherTitle = 'Precipitaciones';
            viabilityText = 'Cancelado';
            viabilityClass = 'viability-cancel';
            missionStatus = 'cancelado';
            weatherIconSrc = 'img/ic/rainic.png';
        }

        if (titleEl) titleEl.textContent = weatherTitle;

        const portLabels = {
            'starbase': 'Starbase',
            'cape': 'Cape Canaveral',
            'vandenberg': 'Vandenberg',
            'kourou': 'Kourou',
            'azores': 'Azores'
        };
        const portLabel = portLabels[port] || (port.charAt(0).toUpperCase() + port.slice(1));
        if (portEl) portEl.textContent = portLabel;

        const weatherIconEl = document.getElementById('weather-icon');
        if (weatherIconEl) weatherIconEl.src = weatherIconSrc;

        const warningPill = document.getElementById('weatherWarningPill');
        if (warningPill) {
            warningPill.style.display = code !== 0 ? 'block' : 'none';
        }

        if (viabilityEl) {
            viabilityEl.textContent = viabilityText;
            viabilityEl.className = 'viability-badge ' + viabilityClass;
        }

        // Auto-update solo si la misión sigue en 'programado'
        if (missionStatus && missionId && window.MissionService) {
            const mission = await window.MissionService.getMissionById(missionId);
            const currentStatus = mission?.status || 'programado';

            if (mission && currentStatus === 'programado' && currentStatus !== missionStatus) {
                const ok = await window.MissionService.updateStatus(missionId, missionStatus);
                if (ok && rerenderCallback) rerenderCallback();
            }
        }
    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

window.initPanelPage = initPanelPage;

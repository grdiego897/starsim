
async function initMisionPage() {
    // --- Capacities & Mass Calculation ---
    const CAPACITIES = {
        'falcon9': { 'leo': 22.8, 'haven': 22.8, 'axiom': 22.8, 'orbital-reef': 22.8 },
        'falconheavy': { 'leo': 63.8, 'haven': 63.8, 'axiom': 63.8, 'orbital-reef': 63.8 },
        'superheavy': {
            'leo': 150, 'haven': 150, 'axiom': 150, 'orbital-reef': 150,
            'gateway': 50, 'luna': 50,
            'terminus': 150
        }
    };

    function getMissionCapacity(booster, dest) {
        if (CAPACITIES[booster] && CAPACITIES[booster][dest] !== undefined) {
            return CAPACITIES[booster][dest];
        }
        return 0;
    }

    function getTotalMass() {
        const cargoStr = localStorage.getItem('cargoItems');
        if (!cargoStr) return 0;
        try {
            const items = JSON.parse(cargoStr);
            let total = 0;
            items.forEach(i => {
                total += (parseInt(i.qty) || 0) * (parseFloat(i.mass) || 0);
            });
            return total;
        } catch (e) {
            return 0;
        }
    }

    function updateCargoMass() {
        const massInput = document.getElementById('cargo-mass-input');
        if (massInput) {
            const total = getTotalMass();
            massInput.value = `${total} t`;
        }
    }

    // --- Image Logic ---
    const shipSelect = document.getElementById('ship-select');
    const boosterSelect = document.getElementById('booster-select');
    const vehicleImg = document.getElementById('vehicle-img');

    const destSelect = document.getElementById('destination-select');
    const landingIdSelect = document.getElementById('landing-id-select');
    const destImg = document.getElementById('destination-img');

    const vehicleMap = {
        'starship': 'img/vehicles/starshiprender.png',
        'dragon': 'img/vehicles/falcon9.png',
        'falcon-fairing': 'img/vehicles/falconheavy.png',
        'superheavy': 'img/vehicles/starshiprender.png',
        'falcon9': 'img/vehicles/falcon9.png',
        'falconheavy': 'img/vehicles/falconheavy.png'
    };

    const destMap = {
        'leo': 'img/destination/leo.png',
        'haven': 'img/destination/haven.png',
        'axiom': 'img/destination/axiom.png',
        'orbital-reef': 'img/destination/orbital-reef.png',
        'gateway': 'img/destination/gateway.png',
        'luna': 'img/destination/luna.png',
        'terminus': 'img/destination/terminus.png',
    };

    function updateVehicle() {
        if (!shipSelect || !boosterSelect || !vehicleImg) return;
        const ship = shipSelect.value;
        const booster = boosterSelect.value;
        if (ship === 'starship' || booster === 'superheavy') {
            vehicleImg.src = vehicleMap['starship'];
        } else if (booster === 'falconheavy') {
            vehicleImg.src = vehicleMap['falconheavy'];
        } else {
            vehicleImg.src = vehicleMap['falcon9'];
        }
    }

    function updateDestination() {
        if (!destSelect || !destImg) return;
        const destVal = destSelect.value;
        if (destVal === 'leo') {
            let selectedImg = 'img/destination/leo.png';
            if (landingIdSelect) {
                const landingVal = landingIdSelect.value;
                const validDroneships = ['ocisly', 'jrti', 'ytml', 'asog'];
                if (validDroneships.includes(landingVal)) {
                    selectedImg = `img/destination/${landingVal}.png`;
                }
            }
            destImg.src = selectedImg;
        } else {
            if (destMap[destVal]) destImg.src = destMap[destVal];
        }
    }

    if (shipSelect && boosterSelect) {
        shipSelect.addEventListener('change', updateVehicle);
        boosterSelect.addEventListener('change', updateVehicle);
        updateVehicle();
    }

    if (destSelect) {
        destSelect.addEventListener('change', updateDestination);
        if (landingIdSelect) landingIdSelect.addEventListener('change', updateDestination);
        updateDestination();
    }

    // --- Map Logic ---
    const portSelect = document.getElementById('port-select');
    const mapIframe = document.getElementById('map-iframe');

    const mapUrls = {
        'starbase': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14831.0227489655!2d-97.19523020151937!3d25.989574683826845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x866fb1632384e2d5%3A0xa8d0c7f6e909dc99!2sStarbase%2C%20TX%2078521%2C%20USA!5e1!3m2!1sen!2ses!4v1765238920803!5m2!1sen!2ses',
        'cape': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d276461.93649158103!2d-80.8547461299503!3d28.359112144778454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e0a5ab39504c9b%3A0xbb0bb0f57a55d19e!2sCape%20Canaveral%2C%20FL%2032920%2C%20USA!5e1!3m2!1sen!2ses!4v1765239198537!5m2!1sen!2ses',
        'vandenberg': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52250.60942475514!2d-120.62246497216124!3d34.7508491873727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80ec187640266049%3A0x367e9b086307374b!2sVandenberg%20Space%20Force%20Base!5e1!3m2!1sen!2sus!4v1733702500000!5m2!1sen!2sus',
        'kourou': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63654.58287652755!2d-52.8021486790757!3d5.197960782352163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8d123e7208d7c07b%3A0xf54ec2a66e44b826!2sGuiana%20Space%20Centre!5e1!3m2!1sen!2sus!4v1733702500000!5m2!1sen!2sus',
        'azores': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4912583.663972047!2d-26.469947018335617!3d37.70125852088543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xb67910ee97539cf%3A0x87d46041de4ed19e!2sAtlantic%20Spaceport%20Consortium!5e1!3m2!1sen!2ses!4v1765239451252!5m2!1sen!2ses'
    };

    if (portSelect && mapIframe) {
        portSelect.addEventListener('change', () => {
            const val = portSelect.value;
            if (mapUrls[val]) mapIframe.src = mapUrls[val];
        });
    }

    // --- Mission Input Logic ---
    const missionNameInput = document.getElementById('mission-name-input');
    const programInput = document.getElementById('program-select');
    const shellWrapper = document.getElementById('shell-wrapper');
    const shellSelect = document.getElementById('shell-select');

    function updateShellVisibility() {
        if (!shellWrapper || !programInput) return;
        const isStarlink = (programInput.value || '').trim().toLowerCase() === 'starlink';
        shellWrapper.style.display = isStarlink ? 'flex' : 'none';
    }
    if (programInput) {
        programInput.addEventListener('input', updateShellVisibility);
        programInput.addEventListener('change', updateShellVisibility);
        programInput.addEventListener('blur', updateShellVisibility);
    }
    updateShellVisibility();

    async function loadPrograms() {
        if (!window.MissionService) return;
        const missions = await window.MissionService.getAllMissions();
        const programs = Array.from(new Set(missions.map(m => m.program).filter(p => p)));
        
        const input = document.getElementById('program-select');
        const list = document.getElementById('program-autocomplete-list');
        if (!input || !list) return;

        function renderList(filterText = '') {
            list.innerHTML = '';
            const filtered = programs.filter(p => p.toLowerCase().includes(filterText.toLowerCase()));
            
            if (filtered.length === 0) {
                list.style.display = 'none';
                return;
            }

            filtered.forEach(p => {
                const li = document.createElement('li');
                li.textContent = p;
                li.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    input.value = p;
                    list.style.display = 'none';
                    updateShellVisibility();
                });
                list.appendChild(li);
            });
            list.style.display = 'block';
        }

        input.addEventListener('focus', () => renderList(input.value));
        input.addEventListener('input', () => renderList(input.value));
        input.addEventListener('blur', () => {
            list.style.display = 'none';
        });
    }
    loadPrograms();

    // --- Edit Mode ---
    const editMissionId = localStorage.getItem('editMissionId');
    const editLaunchId = localStorage.getItem('editLaunchId');
    let isEditing = false;
    let editingMission = null;
    let editingLaunch = null;

    if (editMissionId && window.MissionService) {
        editingMission = await window.MissionService.getMissionById(editMissionId);
        if (editingMission) {
            isEditing = true;

            if (missionNameInput) missionNameInput.value = editingMission.name || '';
            if (programInput) programInput.value = editingMission.program || '';
            updateShellVisibility();

            if (editLaunchId && editingMission.launches) {
                editingLaunch = editingMission.launches.find(l => l.id === editLaunchId);
            }
            if (!editingLaunch && editingMission.launches && editingMission.launches.length > 0) {
                editingLaunch = editingMission.launches[0];
            }

            if (editingLaunch) {
                const setVal = (id, val) => {
                    const el = document.getElementById(id);
                    if (el) el.value = val || '';
                };

                setVal('destination-select', editingLaunch.destination);
                setVal('ship-select', editingLaunch.ship);
                setVal('booster-select', editingLaunch.booster);
                setVal('cargo-type-select', editingLaunch.cargoType);
                setVal('port-select', editingLaunch.port);
                setVal('launch-date-input', editingLaunch.launchDate);
                setVal('landing-type-select', editingLaunch.landingType);
                setVal('landing-id-select', editingLaunch.landingId);
                const shellVal = editingLaunch.shell || editingMission.shell || '';
                if (shellSelect && shellVal) shellSelect.value = shellVal;

                if (editingLaunch.advancedConfig) {
                    const adv = editingLaunch.advancedConfig;
                    localStorage.setItem('objectives-main', adv.objectivesMain || '');
                    localStorage.setItem('objectives-secondary', adv.objectivesSecondary || '');
                    localStorage.setItem('crew-input', adv.crew || '');
                    localStorage.setItem('cargoItems', JSON.stringify(adv.cargo || []));
                } else {
                    localStorage.removeItem('objectives-main');
                    localStorage.removeItem('objectives-secondary');
                    localStorage.removeItem('crew-input');
                    localStorage.removeItem('cargoItems');
                }

                updateVehicle();
                updateDestination();

                if (portSelect && mapUrls[editingLaunch.port] && mapIframe) {
                    mapIframe.src = mapUrls[editingLaunch.port];
                }
            }
        } else if (window.MissionService.lastError) {
            // No se pudo cargar la misión a editar
            const msg = `No se pudo cargar la misión a editar: ${window.MissionService.lastError}`;
            if (window.showPopup) window.showPopup('Error', msg, 'error');
            else alert(msg);
        }
    }

    // --- Borrador local de nueva misión (solo formulario, no persistencia real) ---
    const DRAFT_PREFIX = 'misionDraft_';

    const misionDraftFields = [
        'mission-name-input',
        'program-select',
        'destination-select',
        'ship-select',
        'booster-select',
        'cargo-type-select',
        'port-select',
        'launch-date-input',
        'landing-type-select',
        'landing-id-select',
        'shell-select'
    ];

    function saveMisionDraft() {
        misionDraftFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) localStorage.setItem(DRAFT_PREFIX + id, el.value);
        });
    }

    function loadMisionDraft() {
        let hasDraft = false;
        misionDraftFields.forEach(id => {
            const saved = localStorage.getItem(DRAFT_PREFIX + id);
            if (saved !== null) {
                const el = document.getElementById(id);
                if (el) {
                    el.value = saved;
                    hasDraft = true;
                }
            }
        });
        return hasDraft;
    }

    function clearMisionDraft() {
        misionDraftFields.forEach(id => localStorage.removeItem(DRAFT_PREFIX + id));
    }

    if (!isEditing) {
        const restored = loadMisionDraft();
        if (restored) {
            updateVehicle();
            updateDestination();
            updateShellVisibility();
            const restoredPort = document.getElementById('port-select')?.value;
            if (restoredPort && mapUrls[restoredPort] && mapIframe) {
                mapIframe.src = mapUrls[restoredPort];
            }
        }
    }

    updateCargoMass();

    // --- Advanced Button ---
    const btnAdvanced = document.getElementById('btn-advanced');
    if (btnAdvanced) {
        btnAdvanced.addEventListener('click', () => {
            saveMisionDraft();
            if (vehicleImg) {
                localStorage.setItem('selectedVehicleSrc', vehicleImg.src);
            }
            window.router.navigateTo('configAvanzada');
        });
    }

    // --- Launch Button (Save) ---
    const btnLaunch = document.querySelector('.launch-button');
    if (btnLaunch) {
        btnLaunch.addEventListener('click', async () => {
            // Evitar doble envío
            if (btnLaunch.disabled) return;

            const launchData = {
                destination: document.getElementById('destination-select')?.value,
                ship: document.getElementById('ship-select')?.value,
                booster: document.getElementById('booster-select')?.value,
                cargoType: document.getElementById('cargo-type-select')?.value,
                cargoMass: document.getElementById('cargo-mass-input')?.value,
                port: document.getElementById('port-select')?.value,
                launchDate: document.getElementById('launch-date-input')?.value,
                landingType: document.getElementById('landing-type-select')?.value,
                landingId: document.getElementById('landing-id-select')?.value,
                shell: ((programInput?.value || '').trim().toLowerCase() === 'starlink')
                    ? (shellSelect?.value || null)
                    : null,
                advancedConfig: {
                    objectivesMain: localStorage.getItem('objectives-main'),
                    objectivesSecondary: localStorage.getItem('objectives-secondary'),
                    crew: localStorage.getItem('crew-input'),
                    cargo: JSON.parse(localStorage.getItem('cargoItems') || '[]')
                }
            };

            const boosterVal = launchData.booster;
            const destVal = launchData.destination;
            const totalMassNum = getTotalMass();
            const capacity = getMissionCapacity(boosterVal, destVal);

            if (capacity === 0) {
                const vehName = boosterVal === 'superheavy' ? 'Starship' : (boosterVal === 'falcon9' ? 'Falcon 9' : 'Falcon Heavy');
                const msg = `El vehículo seleccionado (${vehName}) no tiene capacidad para viajar al destino elegido.`;
                if (window.showPopup) window.showPopup('Misión Bloqueada', msg, 'error'); else alert(msg);
                return;
            }

            if (totalMassNum > capacity) {
                const vehName = boosterVal === 'superheavy' ? 'Starship' : (boosterVal === 'falcon9' ? 'Falcon 9' : 'Falcon Heavy');
                const msg = `La masa total (${totalMassNum} t) supera la capacidad máxima de ${vehName} para este destino (${capacity} t).`;
                if (window.showPopup) window.showPopup('Misión Bloqueada', msg, 'error'); else alert(msg);
                return;
            }

            const requiredFields = [
                { val: launchData.launchDate, name: 'Fecha de Lanzamiento' }
            ];

            if (!isEditing) {
                const missionName = missionNameInput?.value?.trim();
                requiredFields.unshift({ val: missionName || '', name: 'Nombre de Misión' });
            }

            const missingFields = requiredFields
                .filter(field => !field.val || !String(field.val).trim())
                .map(field => field.name);

            if (missingFields.length > 0) {
                const errorList = missingFields.map(name => `• ${name}`).join('\n');
                const message = `Por favor completa los siguientes campos:\n\n${errorList}`;
                if (window.showPopup) window.showPopup('Campos Incompletos', message, 'error');
                else alert(message);
                return;
            }

            if (!window.MissionService) {
                console.error('MissionService no disponible');
                alert('Error del sistema: Servicio no disponible');
                return;
            }

            btnLaunch.disabled = true;
            // No reemplazamos el contenido para mantener el icono
            // const originalBtnText = btnLaunch.textContent;
            // btnLaunch.textContent = 'Guardando...';

            let result = false;

            try {
                if (isEditing && editingMission) {
                    const payload = {
                        id: editingMission.id,
                        name: missionNameInput?.value?.trim() || editingMission.name,
                        program: programInput?.value?.trim() || '',
                        status: editingMission.status || 'programado',
                        launches: [launchData]
                    };
                    result = await window.MissionService.updateMission(payload);
                    if (result === true) {
                        localStorage.removeItem('editMissionId');
                        localStorage.removeItem('editLaunchId');
                    }
                } else {
                    const missionData = {
                        name: missionNameInput?.value?.trim(),
                        program: programInput?.value?.trim() || '',
                        launches: [launchData]
                    };
                    result = await window.MissionService.saveMission(missionData);
                    if (result === true) {
                        clearMisionDraft();
                    }
                }
            } finally {
                btnLaunch.disabled = false;
                // No es necesario restaurar el texto ya que no lo cambiamos
            }

            if (result === true) {
                const action = isEditing ? 'Actualizado' : 'Creado';
                if (window.showPopup) {
                    window.showPopup('¡Éxito!', `Lanzamiento ${action} Correctamente`, 'success', () => {
                        window.router.navigateTo('program');
                    });
                } else {
                    alert(`Lanzamiento ${action} Correctamente`);
                    window.router.navigateTo('program');
                }
            } else if (result === 'duplicate') {
                const msg = 'Ya existe una misión con ese nombre. Elige otro.';
                if (window.showPopup) window.showPopup('Nombre duplicado', msg, 'error');
                else alert(msg);
            } else {
                const msg = window.MissionService.lastError || 'No se pudo guardar el lanzamiento.';
                if (window.showPopup) window.showPopup('Error', msg, 'error');
                else alert(msg);
            }
        });
    }
}

window.initMisionPage = initMisionPage;

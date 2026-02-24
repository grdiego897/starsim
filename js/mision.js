
function initMisionPage() {
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
        'leo': 'img/destination/ocisly.png',
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
            let selectedImg = 'img/destination/ocisly.png';
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

<<<<<<< HEAD
    // Escuchadores de eventos
=======
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
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

    // --- Mission Selector Logic ---
    const missionSelect = document.getElementById('mission-select');
    const newMissionFields = document.getElementById('new-mission-fields');
    const missionNameInput = document.getElementById('mission-name-input');
    const programInput = document.getElementById('program-select');

    function populateMissionSelector() {
        if (!missionSelect) return;
        const missions = window.MissionService ? window.MissionService.getAllMissions() : [];

        // Clear all options except the first "Nueva misión"
        missionSelect.innerHTML = '<option value="__new__">+ Nueva misión...</option>';

        missions.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name || 'Misión sin nombre';
            missionSelect.appendChild(opt);
        });
    }

    function toggleNewMissionFields() {
        if (!missionSelect || !newMissionFields) return;
        if (missionSelect.value === '__new__') {
            newMissionFields.classList.add('visible');
            if (programInput) programInput.value = '';
        } else {
            newMissionFields.classList.remove('visible');
            // When selecting existing mission, fill programa from mission data
            const mission = window.MissionService ? window.MissionService.getMissionById(missionSelect.value) : null;
            if (mission && programInput) {
                programInput.value = mission.program || '';
            }
        }
    }

    if (missionSelect) {
        missionSelect.addEventListener('change', toggleNewMissionFields);
    }

    populateMissionSelector();

<<<<<<< HEAD
    // Verificar modo de edición
=======
    // --- Edit Mode ---
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
    const editMissionId = localStorage.getItem('editMissionId');
    const editLaunchId = localStorage.getItem('editLaunchId');
    let isEditing = false;
    let editingMission = null;
    let editingLaunch = null;

    if (editMissionId && window.MissionService) {
        editingMission = window.MissionService.getMissionById(editMissionId);
        if (editingMission) {
            isEditing = true;
<<<<<<< HEAD
            console.log("Editando misión:", missionToEdit);

            // Rellenar formulario
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val || '';
            };

            setVal('mission-name-input', missionToEdit.name);
            setVal('program-select', missionToEdit.program);
            setVal('destination-select', missionToEdit.destination);
            setVal('ship-select', missionToEdit.ship);
            setVal('booster-select', missionToEdit.booster);
            setVal('cargo-type-select', missionToEdit.cargoType);
            setVal('cargo-mass-input', missionToEdit.cargoMass);
            setVal('port-select', missionToEdit.port);
            setVal('launch-date-input', missionToEdit.launchDate);
            setVal('landing-type-select', missionToEdit.landingType);
            setVal('landing-id-select', missionToEdit.landingId);

            // Hidratar borradores de configuración avanzada
            if (missionToEdit.advancedConfig) {
                const adv = missionToEdit.advancedConfig;
                localStorage.setItem('objectives-main', adv.objectivesMain || '');
                localStorage.setItem('objectives-secondary', adv.objectivesSecondary || '');
                localStorage.setItem('duration-input', adv.duration || '');
                localStorage.setItem('crew-input', adv.crew || '');
                localStorage.setItem('cargoItems', JSON.stringify(adv.cargo || []));
            } else {
                // Limpiar si no hay ninguno (¿o mantener borrador existente? No, editar implica sobrescribir borrador con estado de misión)
                // Pero limpiar es más seguro para evitar mezclar borradores anteriores.
                localStorage.removeItem('objectives-main');
                localStorage.removeItem('objectives-secondary');
                localStorage.removeItem('duration-input');
                localStorage.removeItem('crew-input');
                localStorage.removeItem('cargoItems');
            }

            // Activar actualizaciones de imágenes
            updateVehicle();
            updateDestination();
=======

            // Select the mission in the dropdown
            if (missionSelect) {
                missionSelect.value = editMissionId;
                toggleNewMissionFields();
            }
            if (programInput) programInput.value = editingMission.program || '';

            // Find the specific launch to edit
            if (editLaunchId && editingMission.launches) {
                editingLaunch = editingMission.launches.find(l => l.id === editLaunchId);
            }
            // Fallback: edit the first launch if no specific launch ID
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
                setVal('cargo-mass-input', editingLaunch.cargoMass);
                setVal('port-select', editingLaunch.port);
                setVal('launch-date-input', editingLaunch.launchDate);
                setVal('landing-type-select', editingLaunch.landingType);
                setVal('landing-id-select', editingLaunch.landingId);

                // Hydrate Advanced Config
                if (editingLaunch.advancedConfig) {
                    const adv = editingLaunch.advancedConfig;
                    localStorage.setItem('objectives-main', adv.objectivesMain || '');
                    localStorage.setItem('objectives-secondary', adv.objectivesSecondary || '');
                    localStorage.setItem('duration-input', adv.duration || '');
                    localStorage.setItem('crew-input', adv.crew || '');
                    localStorage.setItem('cargoItems', JSON.stringify(adv.cargo || []));
                } else {
                    localStorage.removeItem('objectives-main');
                    localStorage.removeItem('objectives-secondary');
                    localStorage.removeItem('duration-input');
                    localStorage.removeItem('crew-input');
                    localStorage.removeItem('cargoItems');
                }

                updateVehicle();
                updateDestination();

                if (portSelect && mapUrls[editingLaunch.port] && mapIframe) {
                    mapIframe.src = mapUrls[editingLaunch.port];
                }
            }
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
        }
    }

    // If not editing, show new mission fields by default
    if (!isEditing) {
        toggleNewMissionFields();
    }
    // If not editing, show new mission fields by default
    if (!isEditing) {
        toggleNewMissionFields();
    }

    // --- Advanced Button ---
    const btnAdvanced = document.getElementById('btn-advanced');
    if (btnAdvanced) {
        btnAdvanced.addEventListener('click', () => {
            if (vehicleImg) {
                localStorage.setItem('selectedVehicleSrc', vehicleImg.src);
            }
            window.router.navigateTo('configAvanzada');
        });
    }

    // --- Launch Button (Save) ---
    const btnLaunch = document.querySelector('.launch-button');
    if (btnLaunch) {
<<<<<<< HEAD
        // ¿Actualizar texto/icono del botón si está editando?
        // El usuario pidió "Crea la función editar... con la interfaz mision.html"
        // Podría querer cambiar la retroalimentación visual.
        if (isEditing) {
            // Opcional: ¿Cambiar estilo del botón o añadir indicador?
            // Manteniendo simple como "Lanzar" (Lanzar/Actualizar).
        }

=======
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
        btnLaunch.addEventListener('click', () => {
            // Build launch data from form
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
<<<<<<< HEAD
                createdAt: isEditing ? undefined : new Date().toISOString(), // Preservar fecha original si se edita manejado en servicio

                // Capturar configuración avanzada desde borradores
=======
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
                advancedConfig: {
                    objectivesMain: localStorage.getItem('objectives-main'),
                    objectivesSecondary: localStorage.getItem('objectives-secondary'),
                    duration: localStorage.getItem('duration-input'),
                    crew: localStorage.getItem('crew-input'),
                    cargo: JSON.parse(localStorage.getItem('cargoItems') || '[]')
                }
            };

<<<<<<< HEAD
            console.log("Guardando datos de misión:", missionData);

            // Validar campos requeridos
=======
            // Validate
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
            const requiredFields = [
                { val: launchData.launchDate, name: 'Fecha de Lanzamiento' },
                { val: launchData.cargoMass, name: 'Masa de Carga' }
            ];

            const isNewMission = missionSelect && missionSelect.value === '__new__';
            if (isNewMission) {
                const missionName = missionNameInput?.value?.trim();
                if (!missionName) {
                    requiredFields.unshift({ val: '', name: 'Nombre de Misión' });
                }
            }

            for (const field of requiredFields) {
                if (!field.val || !String(field.val).trim()) {
                    if (window.showPopup) {
                        window.showPopup('Campo Incompleto', `Por favor completa el campo: ${field.name}`, 'error');
                    } else {
                        alert(`Por favor completa el campo: ${field.name}`);
                    }
<<<<<<< HEAD
                    return; // Detener ejecución
                }
            }

            // Guardar
            if (window.MissionService) {
                let success;
                if (isEditing) {
                    missionData.id = editMissionId; // Asegurar que se pase el ID
                    success = window.MissionService.updateMission(missionData);
                    if (success) {
                        localStorage.removeItem('editMissionId'); // Limpiar modo de edición
                    }
                } else {
                    success = window.MissionService.saveMission(missionData);
                }

                if (success) {
                    const action = isEditing ? 'Actualizada' : 'Creada';
                    if (window.showPopup) {
                        window.showPopup('¡Éxito!', `Misión ${action} Correctamente`, 'success', () => {
                            window.router.navigateTo('program');
                        });
                    } else {
                        alert(`Misión ${action} Correctamente`);
                        window.router.navigateTo('program');
                    }
                } else {
                    if (window.showPopup) {
                        window.showPopup('Error', 'No se pudo guardar la misión', 'error');
                    } else {
                        alert('Error al guardar la misión');
                    }
                }

            } else {
=======
                    return;
                }
            }

            if (!window.MissionService) {
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
                console.error('MissionService no disponible');
                alert('Error del sistema: Servicio no disponible');
                return;
            }

            let success = false;

            if (isEditing && editingLaunch) {
                // Update existing launch
                launchData.id = editingLaunch.id;
                launchData.createdAt = editingLaunch.createdAt;
                success = window.MissionService.updateLaunch(editMissionId, launchData);
                if (success) {
                    localStorage.removeItem('editMissionId');
                    localStorage.removeItem('editLaunchId');
                }
            } else if (isNewMission) {
                // Create new mission with this launch
                const missionData = {
                    name: missionNameInput?.value?.trim() || 'Sin Nombre',
                    program: programInput?.value?.trim() || '',
                    launches: [launchData]
                };
                success = window.MissionService.saveMission(missionData);
            } else {
                // Add launch to existing mission
                const selectedMissionId = missionSelect?.value;
                if (selectedMissionId) {
                    success = window.MissionService.addLaunchToMission(selectedMissionId, launchData);
                }
            }

            if (success) {
                const action = isEditing ? 'Actualizado' : 'Creado';
                if (window.showPopup) {
                    window.showPopup('¡Éxito!', `Lanzamiento ${action} Correctamente`, 'success', () => {
                        window.router.navigateTo('program');
                    });
                } else {
                    alert(`Lanzamiento ${action} Correctamente`);
                    window.router.navigateTo('program');
                }
            } else {
                if (window.showPopup) {
                    window.showPopup('Error', 'No se pudo guardar el lanzamiento', 'error');
                } else {
                    alert('Error al guardar el lanzamiento');
                }
            }
        });
    }
}

// Expose globally
window.initMisionPage = initMisionPage;


function initMisionPage() {
    // Lógica de imagen dinámica
    const shipSelect = document.getElementById('ship-select');
    const boosterSelect = document.getElementById('booster-select');
    const vehicleImg = document.getElementById('vehicle-img');

    const destSelect = document.getElementById('destination-select');
    const landingIdSelect = document.getElementById('landing-id-select');
    const destImg = document.getElementById('destination-img');

    // Mapeo de opciones a imágenes
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

    // Actualizar imagen del vehículo
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

    // Actualizar imagen de destino
    function updateDestination() {
        if (!destSelect || !destImg) return;

        const destVal = destSelect.value;

        if (destVal === 'leo') {
            // Por defecto para LEO 
            let selectedImg = 'img/destination/ocisly.png';

            if (landingIdSelect) {
                const landingVal = landingIdSelect.value;
                // Verificar si el ID de aterrizaje es un droneship conocido
                const validDroneships = ['ocisly', 'jrti', 'ytml', 'asog'];
                if (validDroneships.includes(landingVal)) {
                    selectedImg = `img/destination/${landingVal}.png`;
                }
            }
            destImg.src = selectedImg;
        } else {
            if (destMap[destVal]) {
                destImg.src = destMap[destVal];
            }
        }
    }

    // Escuchadores de eventos
    if (shipSelect && boosterSelect) {
        shipSelect.addEventListener('change', updateVehicle);
        boosterSelect.addEventListener('change', updateVehicle);
        updateVehicle();
    }

    if (destSelect) {
        destSelect.addEventListener('change', updateDestination);
        if (landingIdSelect) {
            landingIdSelect.addEventListener('change', updateDestination);
        }
        updateDestination();
    }

    // Lógica dinámica del mapa
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
            if (mapUrls[val]) {
                mapIframe.src = mapUrls[val];
            }
        });
    }

    // Persistencia de estado
    const fields = [
        'mission-name-input', 'program-select', 'destination-select',
        'ship-select', 'booster-select', 'cargo-type-select',
        'cargo-mass-input', 'port-select', 'launch-date-input',
        'landing-type-select', 'landing-id-select'
    ];

    function loadState() {
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const val = localStorage.getItem(id);
                if (val !== null) el.value = val;
            }
        });

        updateVehicle();
        updateDestination();

        if (portSelect && mapUrls[portSelect.value] && mapIframe) {
            mapIframe.src = mapUrls[portSelect.value];
        }
    }

    function setupPersistence() {
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const save = () => localStorage.setItem(id, el.value);
                el.addEventListener('input', save);
                el.addEventListener('change', save);
            }
        });
    }

    setupPersistence();
    loadState();

    // Verificar modo de edición
    const editMissionId = localStorage.getItem('editMissionId');
    let isEditing = false;

    if (editMissionId && window.MissionService) {
        const missionToEdit = window.MissionService.getMissionById(editMissionId);
        if (missionToEdit) {
            isEditing = true;
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
        }
    }

    // Listener para botón Avanzada (SPA Navigation + Save State)
    const btnAdvanced = document.getElementById('btn-advanced');
    if (btnAdvanced) {
        btnAdvanced.addEventListener('click', () => {
            if (vehicleImg) {
                localStorage.setItem('selectedVehicleSrc', vehicleImg.src);
            }
            window.router.navigateTo('configAvanzada');
        });
    }

    // Listener para botón LANZAR (Guardar Misión)
    const btnLaunch = document.querySelector('.launch-button');
    if (btnLaunch) {
        // ¿Actualizar texto/icono del botón si está editando?
        // El usuario pidió "Crea la función editar... con la interfaz mision.html"
        // Podría querer cambiar la retroalimentación visual.
        if (isEditing) {
            // Opcional: ¿Cambiar estilo del botón o añadir indicador?
            // Manteniendo simple como "Lanzar" (Lanzar/Actualizar).
        }

        btnLaunch.addEventListener('click', () => {
            // Recopilar datos
            const missionData = {
                name: document.getElementById('mission-name-input')?.value || 'Sin Nombre',
                program: document.getElementById('program-select')?.value,
                destination: document.getElementById('destination-select')?.value,
                ship: document.getElementById('ship-select')?.value,
                booster: document.getElementById('booster-select')?.value,
                cargoType: document.getElementById('cargo-type-select')?.value,
                cargoMass: document.getElementById('cargo-mass-input')?.value,
                port: document.getElementById('port-select')?.value,
                launchDate: document.getElementById('launch-date-input')?.value,
                landingType: document.getElementById('landing-type-select')?.value,
                landingId: document.getElementById('landing-id-select')?.value,
                createdAt: isEditing ? undefined : new Date().toISOString(), // Preservar fecha original si se edita manejado en servicio

                // Capturar configuración avanzada desde borradores
                advancedConfig: {
                    objectivesMain: localStorage.getItem('objectives-main'),
                    objectivesSecondary: localStorage.getItem('objectives-secondary'),
                    duration: localStorage.getItem('duration-input'),
                    crew: localStorage.getItem('crew-input'),
                    cargo: JSON.parse(localStorage.getItem('cargoItems') || '[]')
                }
            };

            console.log("Guardando datos de misión:", missionData);

            // Validar campos requeridos
            const requiredFields = [
                { val: missionData.name, name: 'Nombre de la Misión' },
                { val: missionData.launchDate, name: 'Fecha de Lanzamiento' },
                { val: missionData.cargoMass, name: 'Masa de Carga' }
            ];

            for (const field of requiredFields) {
                if (!field.val || !field.val.trim()) {
                    if (window.showPopup) {
                        window.showPopup('Campo Incompleto', `Por favor completa el campo: ${field.name}`, 'error');
                    } else {
                        alert(`Por favor completa el campo: ${field.name}`);
                    }
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
                console.error('MissionService no disponible');
                alert('Error del sistema: Servicio no disponible');
            }
        });
    }
}

// Exponer la función globalmente para el router
window.initMisionPage = initMisionPage;

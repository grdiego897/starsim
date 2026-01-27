document.addEventListener('DOMContentLoaded', () => {

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
                // mechazilla excluido porque no tiene imagen, por defecto ocisly
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

    // Listeners
    if (shipSelect && boosterSelect) {
        shipSelect.addEventListener('change', updateVehicle);
        boosterSelect.addEventListener('change', updateVehicle);
        // Inicializar
        updateVehicle();
    }

    if (destSelect) {
        destSelect.addEventListener('change', updateDestination);
        if (landingIdSelect) {
            landingIdSelect.addEventListener('change', updateDestination);
        }
        // Inicializar
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

    // Lógica de persistencia de estado
    const fields = [
        'mission-name-input', 'program-select', 'destination-select',
        'ship-select', 'booster-select', 'cargo-type-select',
        'cargo-mass-input', 'port-select', 'launch-site-select',
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

        // Actualizar visuales basado en estado cargado
        updateVehicle();
        updateDestination();

        // Actualizar mapa manualmente ya que asignar valor no dispara evento change
        if (portSelect && mapUrls[portSelect.value] && mapIframe) {
            mapIframe.src = mapUrls[portSelect.value];
        }
    }

    function setupPersistence() {
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    localStorage.setItem(id, el.value);
                });
                el.addEventListener('change', () => {
                    localStorage.setItem(id, el.value);
                });
            }
        });
    }

    setupPersistence();
    loadState();
});

function goToAdvanced() {
    const vehicleImg = document.getElementById('vehicle-img');
    if (vehicleImg) {
        localStorage.setItem('selectedVehicleSrc', vehicleImg.src);
    }
    window.location.href = 'configAvanzada.html';
}

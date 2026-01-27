document.addEventListener('DOMContentLoaded', () => {
    // 0. Persistencia de campos generales

    const fields = ['objectives-main', 'objectives-secondary', 'duration-input', 'crew-input'];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Cargar
            const val = localStorage.getItem(id);
            if (val !== null) el.value = val;

            // Guardar
            el.addEventListener('input', () => localStorage.setItem(id, el.value));
        }
    });

    // 1. Lógica del blueprint
    const vehicleImg = document.getElementById('vehicle-blueprint');
    const storedSrc = localStorage.getItem('selectedVehicleSrc');

    if (vehicleImg) {
        if (storedSrc) {
            // Verificar nombre de archivo para mapear al blueprint
            // starshiprender.png -> starshipbp.png
            // falcon9.png / falconheavy.png -> falconbp.png

            if (storedSrc.includes('starshiprender') || storedSrc.includes('superheavy')) {
                vehicleImg.src = 'img/blueprint/starshipbp.png';
            } else if (storedSrc.includes('falcon')) {
                vehicleImg.src = 'img/blueprint/falconbp.png';
            } else {
                // Alternativa por defecto
                vehicleImg.src = 'img/blueprint/starshipbp.png';
            }
        } else {
            // Por defecto si no hay selección (ej. carga directa)
            vehicleImg.src = 'img/blueprint/starshipbp.png';
        }
    }

    // 2. Lógica de carga
    const cargoList = document.getElementById('cargo-list');
    const totalObjectsEl = document.getElementById('total-objects');
    const addBtn = document.getElementById('add-cargo-btn');

    // Cargar carga desde almacenamiento o vacío
    const storedCargo = localStorage.getItem('cargoItems');
    let cargoItems = storedCargo ? JSON.parse(storedCargo) : [];

    function saveCargo() {
        localStorage.setItem('cargoItems', JSON.stringify(cargoItems));
    }

    function updateTotals() {
        if (!totalObjectsEl) return;

        let totalQty = 0;
        cargoItems.forEach(item => {
            const q = parseInt(item.qty);
            if (!isNaN(q)) {
                totalQty += q;
            }
        });
        totalObjectsEl.textContent = totalQty;
    }

    function renderCargo() {
        if (!cargoList) return;
        cargoList.innerHTML = '';

        cargoItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'cargo-item';

            // Input de nombre
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'item-name-input';
            nameInput.value = item.name;
            nameInput.placeholder = "Nombre del objeto";

            nameInput.addEventListener('input', (e) => {
                item.name = e.target.value;
                saveCargo();
            });

            // Input de cantidad
            const qtyInput = document.createElement('input');
            qtyInput.type = 'number';
            qtyInput.className = 'item-qty-input';
            qtyInput.value = item.qty;
            qtyInput.min = '1';

            qtyInput.addEventListener('input', (e) => {
                item.qty = e.target.value;
                updateTotals();
                saveCargo();
            });

            li.appendChild(nameInput);
            li.appendChild(qtyInput);
            cargoList.appendChild(li);
        });

        updateTotals();
        saveCargo();
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            // Agregar item vacío
            cargoItems.push({ name: '', qty: 1 });
            renderCargo();
        });
    }

    // Renderizado inicial
    renderCargo();
});

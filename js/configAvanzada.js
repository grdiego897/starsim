
function initConfigAvanzadaPage() {
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
            if (storedSrc.includes('starshiprender') || storedSrc.includes('superheavy')) {
                vehicleImg.src = 'img/blueprint/starshipbp.png';
            } else if (storedSrc.includes('falcon')) {
                vehicleImg.src = 'img/blueprint/falconbp.png';
            } else {
                vehicleImg.src = 'img/blueprint/starshipbp.png';
            }
        } else {
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
        let totalMass = 0;
        cargoItems.forEach(item => {
            const q = parseInt(item.qty) || 0;
            const m = parseFloat(item.mass) || 0;
            totalQty += q;
            totalMass += (q * m);
        });

        totalObjectsEl.textContent = totalQty;
        const totalMassEl = document.getElementById('total-mass');
        if (totalMassEl) {
            totalMassEl.textContent = totalMass.toLocaleString() + ' t';
        }
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

            // Separador 1
            const sep1 = document.createElement('span');
            sep1.className = 'item-separator';
            sep1.textContent = '|';

            // Contenedor de masa
            const massContainer = document.createElement('div');
            massContainer.className = 'item-mass-container';

            const massInput = document.createElement('input');
            massInput.type = 'number';
            massInput.className = 'item-mass-input';
            massInput.value = item.mass || 0;
            massInput.min = '0';

            const massUnit = document.createElement('span');
            massUnit.className = 'item-unit';
            massUnit.textContent = 't';

            massInput.addEventListener('input', (e) => {
                item.mass = e.target.value;
                updateTotals();
                saveCargo();
            });

            massContainer.appendChild(massInput);
            massContainer.appendChild(massUnit);

            // Separador 2
            const sep2 = document.createElement('span');
            sep2.className = 'item-separator';
            sep2.textContent = '|';

            // Contenedor de cantidad
            const qtyContainer = document.createElement('div');
            qtyContainer.className = 'item-qty-container';

            const qtyInput = document.createElement('input');
            qtyInput.type = 'number';
            qtyInput.className = 'item-qty-input';
            qtyInput.value = item.qty;
            qtyInput.min = '1';

            const qtyUnit = document.createElement('span');
            qtyUnit.className = 'item-unit';
            qtyUnit.textContent = 'Uds';

            qtyInput.addEventListener('input', (e) => {
                item.qty = e.target.value;
                updateTotals();
                saveCargo();
            });

            qtyContainer.appendChild(qtyInput);
            qtyContainer.appendChild(qtyUnit);

            // Botón de eliminar
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-item-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.title = "Eliminar objeto";
            deleteBtn.addEventListener('click', () => {
                cargoItems.splice(index, 1);
                renderCargo();
            });

            li.appendChild(nameInput);
            li.appendChild(sep1);
            li.appendChild(massContainer);
            li.appendChild(sep2);
            li.appendChild(qtyContainer);
            li.appendChild(deleteBtn);
            cargoList.appendChild(li);
        });

        updateTotals();
        saveCargo();
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            cargoItems.push({ name: '', qty: 1, mass: 0 });
            renderCargo();
        });
    }

    // Renderizado inicial
    renderCargo();
}

// Exponer la función globalmente para el router
window.initConfigAvanzadaPage = initConfigAvanzadaPage;

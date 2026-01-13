document.addEventListener('DOMContentLoaded', () => {
    // 0. General Field Persistence

    const fields = ['objectives-main', 'objectives-secondary', 'duration-input', 'crew-input'];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Load
            const val = localStorage.getItem(id);
            if (val !== null) el.value = val;

            // Save
            el.addEventListener('input', () => localStorage.setItem(id, el.value));
        }
    });

    // 1. Blueprint Logic
    const vehicleImg = document.getElementById('vehicle-blueprint');
    const storedSrc = localStorage.getItem('selectedVehicleSrc');

    if (vehicleImg) {
        if (storedSrc) {
            // Check filename to map to blueprint
            // starshiprender.png -> starshipbp.png
            // falcon9.png / falconheavy.png -> falconbp.png

            if (storedSrc.includes('starshiprender') || storedSrc.includes('superheavy')) {
                vehicleImg.src = 'img/blueprint/starshipbp.png';
            } else if (storedSrc.includes('falcon')) {
                vehicleImg.src = 'img/blueprint/falconbp.png';
            } else {
                // Default fallback
                vehicleImg.src = 'img/blueprint/starshipbp.png';
            }
        } else {
            // Default if no selection (e.g. direct load)
            vehicleImg.src = 'img/blueprint/starshipbp.png';
        }
    }

    // 2. Cargo Logic
    const cargoList = document.getElementById('cargo-list');
    const totalObjectsEl = document.getElementById('total-objects');
    const addBtn = document.getElementById('add-cargo-btn');

    // Load Cargo from Storage or empty
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

            // Name Input
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'item-name-input';
            nameInput.value = item.name;
            nameInput.placeholder = "Nombre del objeto";

            nameInput.addEventListener('input', (e) => {
                item.name = e.target.value;
                saveCargo();
            });

            // Quantity Input
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
            // Add blank item
            cargoItems.push({ name: '', qty: 1 });
            renderCargo();
        });
    }

    // Initial Render
    renderCargo();
});

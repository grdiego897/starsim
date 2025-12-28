function loadSidebar() {
    fetch('components/aside.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
            // Initialize logic AFTER injecting the HTML
            initSidebarLogic();
        });
}

function initSidebarLogic() {
    // 1. Grok Form Logic
    const grokForm = document.getElementById('grokSearchForm');
    if (grokForm) {
        grokForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const input = document.querySelector('.grok-input').value;
            const formattedText = input.trim().replace(/\s+/g, '+');
            window.open("https://grok.com/?q=" + formattedText);
        });
    }

    // 2. Sidebar Toggle Logic
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('toggleSidebar');
    if (sidebar && toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // 3. Grok Popup Logic
    const grokTrigger = document.getElementById('grokTrigger');
    const grokPopup = document.getElementById('grokPopup');
    if (grokTrigger && grokPopup) {
        grokTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            grokPopup.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!grokPopup.contains(e.target) && !grokTrigger.contains(e.target)) {
                grokPopup.classList.remove('active');
            }
        });
    }
}

// Start the process
loadSidebar();
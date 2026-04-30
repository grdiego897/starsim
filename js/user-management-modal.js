/**
 * User Management Modal Logic (Static Version)
 */
const UserManagementModal = {
    modal: null,
    isLoaded: false,

    async init() {
        if (this.isLoaded) return;

        try {
            const response = await fetch('components/user-management-modal.html');
            const html = await response.text();

            // Inyectar al final del body
            const div = document.createElement('div');
            div.innerHTML = html;
            document.body.appendChild(div);

            this.modal = document.getElementById('userManagementModal');
            this.setupEventListeners();
            this.isLoaded = true;
        } catch (err) {
            console.error('Error loading User Management Modal:', err);
        }
    },

    setupEventListeners() {
        const closeBtn = document.getElementById('closeModalBtn');
        const tabProfile = document.getElementById('tab-profile');
        const tabUsers = document.getElementById('tab-users');

        if (closeBtn) closeBtn.onclick = () => this.close();
        if (this.modal) {
            this.modal.onmousedown = (e) => {
                if (e.target === this.modal) this.close();
            };
        }

        if (tabProfile) tabProfile.onclick = () => this.switchTab('profile');
        if (tabUsers) tabUsers.onclick = () => this.switchTab('users');

        // Escuchar evento para abrir
        window.addEventListener('openConfigModal', () => this.open());
    },

    open() {
        if (!this.modal) return;

        // Verificar rol para mostrar/ocultar tab de usuarios
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const tabUsers = document.getElementById('tab-users');
        if (tabUsers) {
            if (user.role === 'Admin') {
                tabUsers.classList.remove('hidden');
            } else {
                tabUsers.classList.add('hidden');
            }
        }

        this.modal.classList.remove('hidden');
        setTimeout(() => this.modal.classList.add('opacity-100'), 10);
        document.body.style.overflow = 'hidden';
        this.switchTab('profile');
    },

    close() {
        if (!this.modal) return;
        this.modal.classList.remove('opacity-100');
        setTimeout(() => {
            this.modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    },

    switchTab(tab) {
        const contentArea = document.getElementById('modalContentArea');
        const tabProfile = document.getElementById('tab-profile');
        const tabUsers = document.getElementById('tab-users');

        // Estilos de tabs
        const activeClass = ['bg-[#2d2d2d]', 'text-white'];
        const inactiveClass = ['text-gray-400', 'hover:bg-[#1f1f1f]', 'hover:text-white'];

        [tabProfile, tabUsers].forEach(t => {
            if (!t) return;
            t.classList.remove(...activeClass, ...inactiveClass);
            t.classList.add(...inactiveClass);
        });

        if (tab === 'profile') {
            tabProfile?.classList.remove(...inactiveClass);
            tabProfile?.classList.add(...activeClass);
            this.renderProfile();
        } else if (tab === 'users') {
            tabUsers?.classList.remove(...inactiveClass);
            tabUsers?.classList.add(...activeClass);
            this.renderUsersTable();
        }
    },

    renderProfile() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const contentArea = document.getElementById('modalContentArea');

        contentArea.innerHTML = `
            <div class="h-full flex flex-col fade-in">
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-white mb-1">Cuenta</h3>
                    <p class="text-sm text-gray-400">Gestiona la configuración y preferencias de tu cuenta.</p>
                </div>

                <div class="space-y-6 max-w-2xl">
                    <div class="flex items-center justify-between group">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
                                <img src="img/avatar.jpg" alt="Avatar" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <h4 class="text-base font-semibold text-white">${user.username || 'Usuario'}</h4>
                                <p class="text-sm text-gray-400">${user.entidad || 'Sin entidad'}</p>
                            </div>
                        </div>
                        <button class="px-5 py-1.5 rounded-full border border-gray-700 text-sm font-medium text-white hover:bg-[#2d2d2d] transition-all">
                            Gestionar
                        </button>
                    </div>

                    <div class="space-y-1">
                        <div class="flex items-center justify-between py-4 border-b border-gray-800/50 group">
                            <div class="flex items-center gap-4">
                                <div class="w-6 flex justify-center text-gray-400">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                <span class="text-sm font-medium text-gray-200">Nombre de usuario</span>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class="text-sm text-gray-500">${user.username || ''}</span>
                                <button class="px-4 py-1.5 rounded-full border border-gray-700 text-sm font-medium text-white hover:bg-[#2d2d2d] transition-colors">
                                    Cambiar
                                </button>
                            </div>
                        </div>

                        <div class="flex items-center justify-between py-4 border-b border-gray-800/50 group">
                            <div class="flex items-center gap-4">
                                <div class="w-6 flex justify-center text-gray-400">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                </div>
                                <span class="text-sm font-medium text-gray-200">Contraseña</span>
                            </div>
                            <button class="px-4 py-1.5 rounded-full border border-gray-700 text-sm font-medium text-white hover:bg-[#2d2d2d] transition-colors">
                                Actualizar
                            </button>
                        </div>
                        
                        <div class="flex items-center justify-between py-4 group">
                            <div class="flex items-center gap-4">
                                <div class="w-6 flex justify-center text-gray-400">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                </div>
                                <span class="text-sm font-medium text-gray-200">Rol de usuario</span>
                            </div>
                            <span class="text-sm text-gray-500">${user.role || 'Viewer'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="mt-auto pt-8 border-t border-gray-800/30">
                    <p class="text-[10px] uppercase tracking-widest text-gray-600 font-bold">StarSim ID: ${user.id || 'N/A'}</p>
                </div>
            </div>
        `;
    },

    async renderUsersTable() {
        const contentArea = document.getElementById('modalContentArea');
        contentArea.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500">Cargando usuarios...</div>`;

        // Simular carga o fetch real
        try {
            const token = localStorage.getItem('api_token');
            const response = await fetch('http://127.0.0.1/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const users = await response.json();

            contentArea.innerHTML = `
                <div class="h-full flex flex-col fade-in">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-white">Usuarios registrados</h3>
                        <button class="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                            + Crear nuevo
                        </button>
                    </div>
                    <div class="overflow-y-auto pr-2">
                        <table class="w-full text-left text-sm">
                            <thead class="text-gray-500 border-b border-gray-800">
                                <tr>
                                    <th class="pb-3 font-medium">Username</th>
                                    <th class="pb-3 font-medium">Entidad</th>
                                    <th class="pb-3 font-medium">Rol</th>
                                    <th class="pb-3 font-medium text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-800/50">
                                ${users.map(u => `
                                    <tr class="group">
                                        <td class="py-4 text-white font-medium">${u.username}</td>
                                        <td class="py-4 text-gray-400">${u.entidad || '-'}</td>
                                        <td class="py-4">
                                            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                                                ${u.role}
                                            </span>
                                        </td>
                                        <td class="py-4 text-right">
                                            <button class="text-gray-500 hover:text-red-500 transition-colors p-1">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (err) {
            contentArea.innerHTML = `<div class="flex items-center justify-center h-full text-red-500">Error al cargar usuarios.</div>`;
        }
    }
};

// Auto-inicializar
UserManagementModal.init();

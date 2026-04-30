/**
 * User Management Script
 * Contiene la lógica del frontend para gestionar el modal de configuración,
 * perfiles de usuario y gestión de usuarios por el administrador.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const modal = document.getElementById('userManagementModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    // Tabs
    const tabProfile = document.getElementById('tab-profile');
    const tabUsers = document.getElementById('tab-users');
    
    // Contenidos
    const contentProfile = document.getElementById('content-profile');
    const contentUsers = document.getElementById('content-users');
    const contentCreateUser = document.getElementById('content-create-user');
    
    // Botones de navegación interna
    const btnShowCreateUser = document.getElementById('btnShowCreateUser');
    const btnBackToUsers = document.getElementById('btnBackToUsers');

    // Formularios
    const profileForm = document.getElementById('profileForm');
    const createUserForm = document.getElementById('createUserForm');
    
    // Tabla
    const usersTableBody = document.getElementById('usersTableBody');
    const emptyUsersRow = document.getElementById('emptyUsersRow');

    // Integración con el Header
    // Buscamos el elemento "Configuración" en el dropdown del header (debes añadirlo al html del header)
    const btnOpenConfigFromHeader = document.getElementById('configuracionBtn');
    if(btnOpenConfigFromHeader) {
        btnOpenConfigFromHeader.addEventListener('click', () => {
            openModal();
            // Cerrar el dropdown del header si es necesario
            const profileDropdown = document.getElementById('profileDropdown');
            if(profileDropdown) profileDropdown.classList.remove('show');
        });
    }

    // === GESTIÓN DEL MODAL ===
    function openModal() {
        if (!modal) return;
        modal.classList.remove('hidden');
        // Para animación de entrada
        setTimeout(() => modal.classList.add('opacity-100'), 10);
        document.body.style.overflow = 'hidden'; // Prevenir scroll
        switchTab('profile'); // Por defecto abre en perfil
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('opacity-100');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300); // Coincide con transition duration
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('mousedown', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Escuchar evento personalizado por si se dispara desde otro JS
    window.addEventListener('openUserManagement', openModal);

    // === GESTIÓN DE TABS ===
    function switchTab(tabName) {
        // Ocultar todos
        [contentProfile, contentUsers, contentCreateUser].forEach(el => el && el.classList.add('hidden'));

        // Resetear estilos tabs
        const activeClasses = ['bg-blue-600/20', 'text-blue-400', 'border-blue-500/30'];
        const inactiveClasses = ['text-gray-400', 'hover:bg-gray-800', 'hover:text-white', 'border-transparent'];

        [tabProfile, tabUsers].forEach(tab => {
            if (!tab) return;
            tab.classList.remove(...activeClasses);
            tab.classList.add(...inactiveClasses);
        });

        // Activar la seleccionada
        if (tabName === 'profile' && contentProfile) {
            contentProfile.classList.remove('hidden');
            if (tabProfile) {
                tabProfile.classList.remove(...inactiveClasses);
                tabProfile.classList.add(...activeClasses);
            }
        } else if (tabName === 'users' && contentUsers) {
            contentUsers.classList.remove('hidden');
            if (tabUsers) {
                tabUsers.classList.remove(...inactiveClasses);
                tabUsers.classList.add(...activeClasses);
            }
            fetchUsers(); // Actualizar la lista
        } else if (tabName === 'create-user' && contentCreateUser) {
            contentCreateUser.classList.remove('hidden');
            if (tabUsers) {
                tabUsers.classList.remove(...inactiveClasses);
                tabUsers.classList.add(...activeClasses);
            }
            createUserForm?.reset(); // Limpiar el formulario
        }
    }

    if (tabProfile) tabProfile.addEventListener('click', () => switchTab('profile'));
    if (tabUsers) tabUsers.addEventListener('click', () => switchTab('users'));
    if (btnShowCreateUser) btnShowCreateUser.addEventListener('click', () => switchTab('create-user'));
    if (btnBackToUsers) btnBackToUsers.addEventListener('click', () => switchTab('users'));


    // === FORMULARIOS Y API ===
    const token = localStorage.getItem('api_token') || '';

    // Manejar actualización de perfil
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('profilePassword').value;
            const confirm = document.getElementById('profilePasswordConfirm').value;

            if (password && password !== confirm) {
                showToast('Las contraseñas no coinciden', 'error');
                return;
            }

            const btn = document.getElementById('btnSaveProfile');
            setLoading(btn, true);

            try {
                // Modificar esta URL según tu backend Laravel
                const response = await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        username: document.getElementById('profileUsername').value,
                        password: password || undefined,
                        password_confirmation: confirm || undefined
                    })
                });

                if (response.ok) {
                    showToast('Perfil actualizado correctamente', 'success');
                    profileForm.reset();
                } else {
                    const data = await response.json();
                    showToast(data.message || 'Error al actualizar perfil', 'error');
                }
            } catch (error) {
                showToast('Error de conexión', 'error');
            } finally {
                setLoading(btn, false);
            }
        });
    }

    // Manejar creación de usuarios (Admin)
    if (createUserForm) {
        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('newPassword').value;
            const confirm = document.getElementById('newPasswordConfirm').value;

            if (password !== confirm) {
                showToast('Las contraseñas no coinciden', 'error');
                return;
            }

            const btn = document.getElementById('btnSubmitCreateUser');
            setLoading(btn, true);

            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        username: document.getElementById('newUsername').value,
                        entidad: document.getElementById('newEntity').value,
                        role: document.getElementById('newRole').value,
                        password: password,
                        password_confirmation: confirm
                    })
                });

                if (response.ok) {
                    showToast('Usuario creado exitosamente', 'success');
                    switchTab('users'); // Volver a la lista
                } else {
                    const data = await response.json();
                    showToast(data.message || 'Error al crear usuario', 'error');
                }
            } catch (error) {
                showToast('Error de conexión', 'error');
            } finally {
                setLoading(btn, false);
            }
        });
    }

    // Obtener y renderizar lista de usuarios (Admin)
    async function fetchUsers() {
        if (!usersTableBody) return;
        
        usersTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">Cargando usuarios...</td></tr>`;

        try {
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const users = await response.json();
                renderUsersTable(users);
            } else {
                usersTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-red-500">Error al cargar usuarios</td></tr>`;
            }
        } catch (error) {
            usersTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-red-500">Error de conexión</td></tr>`;
        }
    }

    function renderUsersTable(users) {
        if (!users || users.length === 0) {
            usersTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">No hay usuarios registrados.</td></tr>`;
            return;
        }

        // Obtener usuario actual del localStorage si está guardado para no mostrar botón de eliminar en sí mismo
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        usersTableBody.innerHTML = users.map(user => {
            const roleClass = user.role === 'Admin' ? 'bg-purple-900/30 text-purple-400 border-purple-800/50' : 
                              (user.role === 'Operator' ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-gray-800 text-gray-300 border-gray-700');
            
            const hideDelete = currentUser.id === user.id ? 'hidden' : '';

            return `
                <tr class="hover:bg-[#1a1c23] transition-colors group border-b border-gray-800">
                    <td class="px-6 py-4 font-medium text-gray-200">${user.username}</td>
                    <td class="px-6 py-4 text-gray-400">${user.entidad || '-'}</td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleClass}">
                            ${user.role}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button class="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 delete-user-btn ${hideDelete}" 
                                data-id="${user.id}" data-username="${user.username}">
                            <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Añadir listeners para los botones de eliminar
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const username = btn.getAttribute('data-username');
                confirmDeleteUser(id, username);
            });
        });
    }

    async function confirmDeleteUser(id, username) {
        if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) {
            try {
                const response = await fetch(`/api/users/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    showToast('Usuario eliminado', 'success');
                    fetchUsers(); // Recargar tabla
                } else {
                    showToast('Error al eliminar usuario', 'error');
                }
            } catch (error) {
                showToast('Error de conexión', 'error');
            }
        }
    }

    // === UTILS ===
    function setLoading(btn, isLoading) {
        if (!btn) return;
        const text = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.spinner');
        if (isLoading) {
            btn.disabled = true;
            btn.classList.add('opacity-70', 'cursor-not-allowed');
            text?.classList.add('hidden');
            spinner?.classList.remove('hidden');
        } else {
            btn.disabled = false;
            btn.classList.remove('opacity-70', 'cursor-not-allowed');
            text?.classList.remove('hidden');
            spinner?.classList.add('hidden');
        }
    }

    // Sistema de Toasts sencillo
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-900/80 border-green-500' : 'bg-red-900/80 border-red-500';
        const icon = type === 'success' 
            ? '<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
            : '<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';

        toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transform transition-all duration-300 translate-x-10 opacity-0 ${bgColor} backdrop-blur-sm text-white max-w-sm w-full`;
        toast.innerHTML = `
            ${icon}
            <span class="text-sm font-medium">${message}</span>
        `;

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-10', 'opacity-0');
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-10');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});

/**
 * Modal de Configuración
 * - "Mi Perfil": cualquier usuario autenticado modifica nombre, email, contraseña.
 * - "Usuarios" (sólo admin): listar, crear, editar in-line y eliminar usuarios.
 *
 * Expone:
 *   window.openConfigModal()
 */

(function () {
    const API_BASE = 'http://127.0.0.1/api';
    const ROLE_LABELS = { admin: 'Admin', operator: 'Operator', viewer: 'Viewer' };

    let overlayEl = null;
    let panelEl = null;
    let currentUser = null;       // copia ligera de localStorage.user

    // ────────────────────────────────────────────────────────────────────
    //  Carga del componente HTML
    // ────────────────────────────────────────────────────────────────────

    function loadConfigModal() {
        // Evitar doble carga
        if (document.getElementById('configOverlay')) {
            initRefs();
            return;
        }

        fetch('components/configModal.html?_ts=' + new Date().getTime(), { cache: 'no-store' })
            .then(r => r.text())
            .then(html => {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = html;
                // Mover todos los nodos al body (incluye templates)
                while (wrapper.firstChild) {
                    document.body.appendChild(wrapper.firstChild);
                }
                initRefs();
                wireGlobalHandlers();
            })
            .catch(err => console.error('Error cargando configModal:', err));
    }

    function initRefs() {
        overlayEl = document.getElementById('configOverlay');
        panelEl = document.getElementById('configPanelContent');
    }

    function wireGlobalHandlers() {
        // Cerrar con la "X"
        const closeBtn = document.getElementById('configCloseBtn');
        if (closeBtn) closeBtn.addEventListener('click', closeConfigModal);

        // Cerrar al hacer clic fuera
        overlayEl.addEventListener('click', (e) => {
            if (e.target === overlayEl) closeConfigModal();
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlayEl.classList.contains('active')) {
                closeConfigModal();
            }
        });

        // Cambio de sección desde la sidebar (incluye CTA "Nuevo usuario")
        const sidebarItems = overlayEl.querySelectorAll('[data-section]');
        sidebarItems.forEach(btn => {
            btn.addEventListener('click', () => {
                sidebarItems.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                switchConfigSection(btn.dataset.section);
            });
        });
    }

    // ────────────────────────────────────────────────────────────────────
    //  Apertura / cierre
    // ────────────────────────────────────────────────────────────────────

    function openConfigModal() {
        if (!overlayEl) {
            // El componente aún no está cargado: cargar y reintentar.
            loadConfigModal();
            setTimeout(openConfigModal, 200);
            return;
        }

        try {
            currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        } catch (_) {
            currentUser = null;
        }

        if (!currentUser) {
            window.showPopup && window.showPopup('Sesión', 'Debes iniciar sesión.', 'error');
            return;
        }

        // Mostrar/ocultar las secciones de admin según el rol
        const esAdmin = currentUser.role === 'admin';
        const usuariosBtn = document.getElementById('configSidebarUsuarios');
        if (usuariosBtn) usuariosBtn.hidden = !esAdmin;
        const nuevoBtn = document.getElementById('configSidebarNuevoUsuario');
        if (nuevoBtn) nuevoBtn.hidden = !esAdmin;

        // Reset: marcar "Mi Perfil" activo y abrirlo
        const sidebarItems = overlayEl.querySelectorAll('[data-section]');
        sidebarItems.forEach(b => b.classList.toggle('active', b.dataset.section === 'miPerfil'));

        overlayEl.style.display = 'flex';
        setTimeout(() => overlayEl.classList.add('active'), 10);

        switchConfigSection('miPerfil');
    }

    function closeConfigModal() {
        if (!overlayEl) return;
        overlayEl.classList.remove('active');
        setTimeout(() => { overlayEl.style.display = 'none'; }, 300);
    }

    function switchConfigSection(name) {
        if (!panelEl) return;

        const esAdmin = currentUser && currentUser.role === 'admin';
        if ((name === 'usuarios' || name === 'nuevoUsuario') && !esAdmin) {
            return;
        }

        panelEl.innerHTML = '';

        if (name === 'miPerfil') {
            renderMiPerfil();
        } else if (name === 'usuarios') {
            renderUsuarios();
        } else if (name === 'nuevoUsuario') {
            renderNuevoUsuario();
        }
    }

    // ────────────────────────────────────────────────────────────────────
    //  Sección: Mi Perfil
    // ────────────────────────────────────────────────────────────────────

    function renderMiPerfil() {
        const roleLabel = ROLE_LABELS[currentUser.role] || currentUser.role;
        const entNombre = currentUser.entidad ? currentUser.entidad.name : '';
        const safeName = (currentUser.name || '').replace(/"/g, '&quot;');
        const safeEmail = (currentUser.email || '').replace(/"/g, '&quot;');
        const avatarSrc = window.getUserAvatarSrc(currentUser);

        panelEl.innerHTML = `
            <div class="config-section fade-in">
                <form class="config-form" id="formMiPerfil" autocomplete="off">
                    <div class="profile-header-row">
                        <div class="profile-avatar-group">
                            <div class="profile-avatar-wrapper">
                                <img src="${avatarSrc}" alt="Avatar" class="profile-avatar-img" id="miPerfilAvatarImg">
                                <button type="button" class="profile-avatar-edit-btn" id="avatarEditBtn" aria-label="Cambiar foto de perfil" title="Cambiar foto">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"></path>
                                    </svg>
                                </button>
                                <input type="file" id="avatarFileInput" accept="image/jpeg,image/png,image/webp" hidden>
                            </div>
                            <div class="profile-info-text">
                                <h4 class="profile-name-text">Rol: ${roleLabel}</h4>
                                <p class="profile-email-text">Entidad: ${entNombre}</p>
                            </div>
                        </div>
                        <button type="submit" class="profile-save-btn">Guardar cambios</button>
                    </div>
                    <div class="profile-fields-container">
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                <span>Nombre</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="text" name="name" required maxlength="255"
                                    class="stealth-input" placeholder="Tu nombre" value="${safeName}">
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                <span>Correo</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="email" name="email" required maxlength="255"
                                    class="stealth-input" placeholder="tu@correo.com" value="${safeEmail}">
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                                <span>Contraseña actual</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="password" name="current_password" minlength="8"
                                    class="stealth-input" placeholder="Opcional">
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.286l5.962-5.962A6 6 0 1121 9z"></path>
                                </svg>
                                <span>Nueva contraseña</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="password" name="password" minlength="8"
                                    class="stealth-input" placeholder="Opcional">
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        `;

        const form = panelEl.querySelector('#formMiPerfil');
        form.addEventListener('submit', onSubmitMiPerfil);

        const editBtn = panelEl.querySelector('#avatarEditBtn');
        const fileInput = panelEl.querySelector('#avatarFileInput');
        if (editBtn && fileInput) {
            editBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', onAvatarFileSelected);
        }
    }

    async function onAvatarFileSelected(e) {
        const input = e.currentTarget;
        const file = input.files && input.files[0];
        if (!file) return;

        const MAX_BYTES = 2 * 1024 * 1024;
        const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

        if (!ALLOWED.includes(file.type)) {
            window.showPopup('Formato no válido', 'Solo se admiten imágenes JPG, PNG o WEBP.', 'error');
            input.value = '';
            return;
        }
        if (file.size > MAX_BYTES) {
            window.showPopup('Imagen demasiado grande', 'La imagen no puede superar los 2 MB.', 'error');
            input.value = '';
            return;
        }

        const imgEl = panelEl.querySelector('#miPerfilAvatarImg');
        const editBtn = panelEl.querySelector('#avatarEditBtn');
        const previousSrc = imgEl ? imgEl.src : null;
        const previewUrl = URL.createObjectURL(file);
        if (imgEl) imgEl.src = previewUrl;
        if (editBtn) {
            editBtn.disabled = true;
            editBtn.style.opacity = '0.6';
            editBtn.style.cursor = 'wait';
        }

        const fd = new FormData();
        fd.append('avatar', file);

        try {
            const res = await apiFetchMultipart('/me/avatar', fd);

            if (res.user) {
                localStorage.setItem('user', JSON.stringify(res.user));
                currentUser = res.user;
                const finalUrl = window.getUserAvatarSrc(res.user);
                if (imgEl) imgEl.src = finalUrl;
                refreshHeaderAvatar(finalUrl);
            }
            URL.revokeObjectURL(previewUrl);
            window.showPopup('Éxito', 'Foto de perfil actualizada.', 'success');
        } catch (err) {
            URL.revokeObjectURL(previewUrl);
            if (imgEl && previousSrc) imgEl.src = previousSrc;
            window.showPopup('Error', err.message || 'No se pudo actualizar la foto.', 'error');
        } finally {
            input.value = '';
            if (editBtn) {
                editBtn.disabled = false;
                editBtn.style.opacity = '';
                editBtn.style.cursor = '';
            }
        }
    }

    function refreshHeaderAvatar(url) {
        const el = document.getElementById('avatarImg');
        if (el && url) el.src = url;
    }

    async function onSubmitMiPerfil(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);

        const payload = {};
        const name = (fd.get('name') || '').trim();
        const email = (fd.get('email') || '').trim();
        const currentPassword = fd.get('current_password') || '';
        const password = fd.get('password') || '';
        const passwordConfirm = fd.get('password_confirmation') || '';

        // Sólo enviar campos modificados
        if (name && name !== currentUser.name) payload.name = name;
        if (email && email !== currentUser.email) payload.email = email;

        const currentPasswordInput = form.querySelector('input[name="current_password"]');
        if (currentPasswordInput) {
            currentPasswordInput.style.borderBottom = ''; // reset
            currentPasswordInput.style.outline = '';
        }

        if (password) {
            if (!currentPassword) {
                if (currentPasswordInput) {
                    currentPasswordInput.style.borderBottom = '1px solid #ef4444';
                    currentPasswordInput.style.outline = 'none';
                    currentPasswordInput.focus();
                }
                return;
            }
            payload.password = password;
            // El backend podría requerir password_confirmation, así que lo enviamos igual
            payload.password_confirmation = password;
        }

        if (currentPassword) payload.current_password = currentPassword;

        if (Object.keys(payload).length === 0) {
            window.showPopup('Sin cambios', 'No hay nada que modificar.', 'info');
            return;
        }

        const submitBtn = form.querySelector('.profile-save-btn');
        const originalBtnText = submitBtn ? submitBtn.textContent : 'Guardar cambios';

        if (submitBtn) {
            submitBtn.textContent = 'Guardando...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';
        }

        try {
            const res = await apiFetch('/me', { method: 'PATCH', body: payload });

            // Si llegó token nuevo (cambio de email), rotar
            if (res.token) {
                localStorage.setItem('api_token', res.token);
            }

            // Actualizar usuario en localStorage y en memoria
            if (res.user) {
                localStorage.setItem('user', JSON.stringify(res.user));
                currentUser = res.user;
                refreshHeaderName(res.user.name);
            }

            window.showPopup('Éxito', 'Perfil actualizado correctamente.', 'success');
            // Re-renderizar para limpiar campos de contraseña
            switchConfigSection('miPerfil');
        } catch (err) {
            window.showPopup('Error', err.message || 'No se pudo actualizar el perfil.', 'error');
            if (submitBtn) {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '';
                submitBtn.style.cursor = '';
            }
        }
    }

    function refreshHeaderName(newName) {
        // El header muestra el nombre del usuario en .user-name
        const el = document.querySelector('.user-name');
        if (el && newName) el.textContent = newName;
    }

    // ────────────────────────────────────────────────────────────────────
    //  Sección: Gestor de usuarios (admin) — contenido por desarrollar
    // ────────────────────────────────────────────────────────────────────

    let cachedUsuarios = [];
    let cachedEntidades = [];

    function renderUsuarios() {
        panelEl.innerHTML = `
            <div class="config-section fade-in">
                <h3 class="config-section-title">Gestor de usuarios</h3>
                <div class="users-table-wrapper">
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Entidad</th>
                                <th>Rol</th>
                                <th class="users-col-actions"></th>
                            </tr>
                        </thead>
                        <tbody id="usuariosTbody"></tbody>
                    </table>
                </div>
                <div class="users-empty" hidden>Sin usuarios.</div>
                <div class="users-error" hidden></div>
            </div>
        `;

        const tbody = panelEl.querySelector('#usuariosTbody');
        const emptyEl = panelEl.querySelector('.users-empty');
        const errorEl = panelEl.querySelector('.users-error');

        tbody.innerHTML = `<tr><td colspan="5" class="users-loading">Cargando…</td></tr>`;

        Promise.all([apiFetch('/usuarios'), apiFetch('/entidades')])
            .then(([usuariosRes, entidadesRes]) => {
                cachedUsuarios = Array.isArray(usuariosRes.usuarios) ? usuariosRes.usuarios : [];
                cachedEntidades = Array.isArray(entidadesRes.entidades) ? entidadesRes.entidades : [];

                if (cachedUsuarios.length === 0) {
                    tbody.innerHTML = '';
                    emptyEl.hidden = false;
                    return;
                }
                tbody.innerHTML = cachedUsuarios.map(u => {
                    const entidad = u.entidad && u.entidad.name ? escapeHtml(u.entidad.name) : '—';
                    const roleLabel = ROLE_LABELS[u.role] || u.role;
                    return `
                        <tr>
                            <td>${escapeHtml(u.name || '')}</td>
                            <td>${escapeHtml(u.email || '')}</td>
                            <td>${entidad}</td>
                            <td><span class="role-badge role-${escapeHtml(u.role || '')}">${escapeHtml(roleLabel)}</span></td>
                            <td class="users-col-actions">
                                <button type="button" class="users-edit-btn" data-id="${u.id}" title="Editar usuario" aria-label="Editar usuario">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');

                tbody.querySelectorAll('.users-edit-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = parseInt(btn.dataset.id, 10);
                        const u = cachedUsuarios.find(x => x.id === id);
                        if (u) renderEditarUsuario(u);
                    });
                });
            })
            .catch(err => {
                console.error('Error cargando usuarios:', err);
                tbody.innerHTML = '';
                errorEl.textContent = err.message || 'No se pudieron cargar los usuarios.';
                errorEl.hidden = false;
            });
    }

    function renderEditarUsuario(u) {
        const safeName = escapeHtml(u.name || '');
        const safeEmail = escapeHtml(u.email || '');
        const roleLabel = ROLE_LABELS[u.role] || u.role;
        const entNombre = u.entidad ? u.entidad.name : '';
        const currentEntId = u.entidad ? u.entidad.id : '';

        const roleOptions = Object.entries(ROLE_LABELS).map(([val, lbl]) =>
            `<option value="${val}" ${u.role === val ? 'selected' : ''}>${escapeHtml(lbl)}</option>`
        ).join('');

        const entOptions = cachedEntidades.map(e =>
            `<option value="${e.id}" ${e.id === currentEntId ? 'selected' : ''}>${escapeHtml(e.name)}</option>`
        ).join('');

        panelEl.innerHTML = `
            <div class="config-section fade-in">
                <button type="button" class="users-back-btn" id="usuariosBackBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    <span>Volver</span>
                </button>
                <form class="config-form" id="formEditarUsuario" autocomplete="off">
                    <div class="profile-header-row">
                        <div class="profile-avatar-group">
                            <img src="${window.getUserAvatarSrc(u)}" alt="Avatar" class="profile-avatar-img">
                            <div class="profile-info-text">
                                <h4 class="profile-name-text">Rol: ${escapeHtml(roleLabel)}</h4>
                                <p class="profile-email-text">Entidad: ${escapeHtml(entNombre)}</p>
                            </div>
                        </div>
                        <button type="submit" class="profile-save-btn">Guardar cambios</button>
                    </div>
                    <div class="profile-fields-container">
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                <span>Nombre</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="text" name="name" required maxlength="255"
                                    class="stealth-input" placeholder="Nombre" value="${safeName}">
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                <span>Correo</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="email" name="email" required maxlength="255"
                                    class="stealth-input" placeholder="usuario@correo.com" value="${safeEmail}">
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.286l5.962-5.962A6 6 0 1121 9z"></path>
                                </svg>
                                <span>Nueva contraseña</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="password" name="password" minlength="8"
                                    class="stealth-input" placeholder="Opcional">
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                                </svg>
                                <span>Rol</span>
                            </div>
                            <div class="profile-field-input-group">
                                <select name="role" class="stealth-input stealth-select">${roleOptions}</select>
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"></path>
                                </svg>
                                <span>Entidad</span>
                            </div>
                            <div class="profile-field-input-group">
                                <select name="entidad_id" class="stealth-input stealth-select">${entOptions}</select>
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                                <span>Tu contraseña</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="password" name="admin_password" required minlength="8"
                                    class="stealth-input" placeholder="Confirma con tu contraseña">
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        `;

        panelEl.querySelector('#usuariosBackBtn').addEventListener('click', () => switchConfigSection('usuarios'));
        panelEl.querySelector('#formEditarUsuario').addEventListener('submit', (e) => onSubmitEditarUsuario(e, u));
    }

    async function onSubmitEditarUsuario(e, original) {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);

        const name = (fd.get('name') || '').trim();
        const email = (fd.get('email') || '').trim();
        const password = fd.get('password') || '';
        const role = fd.get('role') || '';
        const entidadIdRaw = fd.get('entidad_id');
        const adminPassword = fd.get('admin_password') || '';

        const payload = { admin_password: adminPassword };
        if (name && name !== original.name) payload.name = name;
        if (email && email !== original.email) payload.email = email;
        if (role && role !== original.role) payload.role = role;
        const newEntId = entidadIdRaw === '' ? null : parseInt(entidadIdRaw, 10);
        const oldEntId = original.entidad ? original.entidad.id : null;
        if (newEntId !== oldEntId) payload.entidad_id = newEntId;
        if (password) payload.password = password;

        const onlyAdmin = Object.keys(payload).length === 1;
        if (onlyAdmin) {
            window.showPopup('Sin cambios', 'No hay nada que modificar.', 'info');
            return;
        }

        const submitBtn = form.querySelector('.profile-save-btn');
        const originalBtnText = submitBtn ? submitBtn.textContent : 'Guardar cambios';
        if (submitBtn) {
            submitBtn.textContent = 'Guardando...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';
        }

        try {
            await apiFetch(`/usuarios/${original.id}`, { method: 'PUT', body: payload });

            if (currentUser && original.id === currentUser.id) {
                try {
                    const meRes = await apiFetch('/me');
                    if (meRes.user) {
                        localStorage.setItem('user', JSON.stringify(meRes.user));
                        currentUser = meRes.user;
                        refreshHeaderName(meRes.user.name);
                        refreshHeaderAvatar(window.getUserAvatarSrc(meRes.user));
                    }
                } catch (_) {}
            }

            window.showPopup('Éxito', 'Usuario actualizado correctamente.', 'success');
            switchConfigSection('usuarios');
        } catch (err) {
            window.showPopup('Error', err.message || 'No se pudo actualizar el usuario.', 'error');
            if (submitBtn) {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '';
                submitBtn.style.cursor = '';
            }
        }
    }

    async function renderNuevoUsuario() {
        panelEl.innerHTML = `
            <div class="config-section fade-in">
                <button type="button" class="users-back-btn" id="usuariosBackBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    <span>Volver</span>
                </button>
                <h3 class="config-section-title">Nuevo usuario</h3>
                <div class="users-loading" id="nuevoUsuarioLoading">Cargando…</div>
            </div>
        `;
        panelEl.querySelector('#usuariosBackBtn').addEventListener('click', () => switchConfigSection('usuarios'));

        try {
            if (cachedEntidades.length === 0) {
                const entidadesRes = await apiFetch('/entidades');
                cachedEntidades = Array.isArray(entidadesRes.entidades) ? entidadesRes.entidades : [];
            }
        } catch (err) {
            console.error('Error cargando entidades:', err);
        }

        const roleOptions = Object.entries(ROLE_LABELS).map(([val, lbl]) =>
            `<option value="${val}" ${val === 'viewer' ? 'selected' : ''}>${escapeHtml(lbl)}</option>`
        ).join('');
        const entOptions = cachedEntidades.map(e =>
            `<option value="${e.id}">${escapeHtml(e.name)}</option>`
        ).join('');

        panelEl.innerHTML = `
            <div class="config-section fade-in">
                <button type="button" class="users-back-btn" id="usuariosBackBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    <span>Volver</span>
                </button>
                <form class="config-form" id="formNuevoUsuario" autocomplete="off">
                    <div class="profile-header-row">
                        <div class="profile-avatar-group">
                            <img src="${window.getUserAvatarSrc({ entidad: cachedEntidades[0] }) || ''}" alt="Avatar" class="profile-avatar-img" id="nuevoUsuarioAvatarImg">
                            <div class="profile-info-text">
                                <h4 class="profile-name-text">Nuevo usuario</h4>
                                <p class="profile-email-text">Crear cuenta</p>
                            </div>
                        </div>
                        <button type="submit" class="profile-save-btn">Crear usuario</button>
                    </div>
                    <div class="profile-fields-container">
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                <span>Nombre</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="text" name="name" required maxlength="255" class="stealth-input" placeholder="Nombre">
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                <span>Correo</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="email" name="email" required maxlength="255" class="stealth-input" placeholder="usuario@correo.com">
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.286l5.962-5.962A6 6 0 1121 9z"></path>
                                </svg>
                                <span>Contraseña</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="password" name="password" required minlength="8" class="stealth-input" placeholder="Mínimo 8 caracteres">
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                                </svg>
                                <span>Rol</span>
                            </div>
                            <div class="profile-field-input-group">
                                <select name="role" class="stealth-input stealth-select">${roleOptions}</select>
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"></path>
                                </svg>
                                <span>Entidad</span>
                            </div>
                            <div class="profile-field-input-group">
                                <select name="entidad_id" class="stealth-input stealth-select">${entOptions}</select>
                            </div>
                        </div>
                        <div class="profile-field-row">
                            <div class="profile-field-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                                <span>Tu contraseña</span>
                            </div>
                            <div class="profile-field-input-group">
                                <input type="password" name="admin_password" required minlength="8" class="stealth-input" placeholder="Confirma con tu contraseña">
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        `;
        panelEl.querySelector('#usuariosBackBtn').addEventListener('click', () => switchConfigSection('usuarios'));
        panelEl.querySelector('#formNuevoUsuario').addEventListener('submit', onSubmitNuevoUsuario);

        const entSelect = panelEl.querySelector('select[name="entidad_id"]');
        const avatarImg = panelEl.querySelector('#nuevoUsuarioAvatarImg');
        if (entSelect && avatarImg) {
            entSelect.addEventListener('change', () => {
                const ent = cachedEntidades.find(e => e.id === parseInt(entSelect.value, 10));
                avatarImg.src = window.getUserAvatarSrc({ entidad: ent }) || '';
            });
        }
    }

    async function onSubmitNuevoUsuario(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);

        const entidadIdRaw = fd.get('entidad_id');
        const payload = {
            name: (fd.get('name') || '').trim(),
            email: (fd.get('email') || '').trim(),
            password: fd.get('password') || '',
            password_confirmation: fd.get('password') || '',
            role: fd.get('role') || 'viewer',
            entidad_id: entidadIdRaw === '' ? null : parseInt(entidadIdRaw, 10),
            admin_password: fd.get('admin_password') || '',
        };

        const submitBtn = form.querySelector('.profile-save-btn');
        const originalBtnText = submitBtn ? submitBtn.textContent : 'Crear usuario';
        if (submitBtn) {
            submitBtn.textContent = 'Creando...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';
        }

        try {
            await apiFetch('/usuarios', { method: 'POST', body: payload });
            window.showPopup('Éxito', 'Usuario creado correctamente.', 'success');
            switchConfigSection('usuarios');
        } catch (err) {
            window.showPopup('Error', err.message || 'No se pudo crear el usuario.', 'error');
            if (submitBtn) {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '';
                submitBtn.style.cursor = '';
            }
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ────────────────────────────────────────────────────────────────────
    //  Helpers
    // ────────────────────────────────────────────────────────────────────

    /**
     * Wrapper de fetch contra la API: añade token, content-type y maneja errores
     * de validación devolviendo un mensaje legible.
     */
    async function apiFetchMultipart(path, formData) {
        const token = localStorage.getItem('api_token');
        const res = await fetch(API_BASE + path, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const msg = data.message || `Error HTTP ${res.status}`;
            if (data.errors && typeof data.errors === 'object') {
                const detallesArr = Object.values(data.errors).flat();
                const filteredDetalles = detallesArr.filter(d => d !== msg).join('\n');
                throw new Error(msg + (filteredDetalles ? '\n' + filteredDetalles : ''));
            }
            throw new Error(msg);
        }

        return data;
    }

    async function apiFetch(path, { method = 'GET', body = null } = {}) {
        const token = localStorage.getItem('api_token');
        const opts = {
            method,
            headers: {
                'Accept': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        };

        if (body !== null) {
            opts.headers['Content-Type'] = 'application/json';
            opts.body = JSON.stringify(body);
        }

        const res = await fetch(API_BASE + path, opts);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const msg = data.message || `Error HTTP ${res.status}`;
            // Si el backend devolvió errores de validación, los concatenamos evitando duplicar el mensaje principal.
            if (data.errors && typeof data.errors === 'object') {
                const detallesArr = Object.values(data.errors).flat();
                const filteredDetalles = detallesArr.filter(d => d !== msg).join('\n');
                throw new Error(msg + (filteredDetalles ? '\n' + filteredDetalles : ''));
            }
            throw new Error(msg);
        }

        return data;
    }

    // ────────────────────────────────────────────────────────────────────
    //  Exposición global y carga
    // ────────────────────────────────────────────────────────────────────

    window.openConfigModal = openConfigModal;
    window.closeConfigModal = closeConfigModal;
    window.addEventListener('openConfigModal', openConfigModal);

    // Auto-cargar el componente al iniciar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadConfigModal);
    } else {
        loadConfigModal();
    }
})();

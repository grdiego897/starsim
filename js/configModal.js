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
    let entidadesCache = [];      // se carga una vez al abrir "Usuarios"

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
        const nuevoUsuarioBtn = document.getElementById('configSidebarNuevoUsuario');
        if (usuariosBtn) usuariosBtn.hidden = !esAdmin;
        if (nuevoUsuarioBtn) nuevoUsuarioBtn.hidden = !esAdmin;

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
        panelEl.innerHTML = '';

        if (name === 'miPerfil') {
            renderMiPerfil();
        } else if (name === 'usuarios') {
            renderUsuarios();
        } else if (name === 'nuevoUsuario') {
            renderNuevoUsuario();
        }
    }

    /** Marca el item activo en la sidebar por su data-section. */
    function setActiveSidebar(name) {
        const items = overlayEl.querySelectorAll('[data-section]');
        items.forEach(b => b.classList.toggle('active', b.dataset.section === name));
    }

    // ────────────────────────────────────────────────────────────────────
    //  Sección: Mi Perfil
    // ────────────────────────────────────────────────────────────────────

    function renderMiPerfil() {
        const roleLabel = ROLE_LABELS[currentUser.role] || currentUser.role;
        const entNombre = currentUser.entidad ? currentUser.entidad.name : 'Sin entidad';
        const safeName = (currentUser.name || '').replace(/"/g, '&quot;');
        const safeEmail = (currentUser.email || '').replace(/"/g, '&quot;');

        panelEl.innerHTML = `
            <div class="config-section fade-in">
                <form class="config-form" id="formMiPerfil" autocomplete="off">
                    <div class="profile-header-row">
                        <div class="profile-avatar-group">
                            <img src="img/avatar.jpg" alt="Avatar" class="profile-avatar-img">
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
    //  Sección: Usuarios (admin)
    // ────────────────────────────────────────────────────────────────────

    async function renderUsuarios() {
        const tpl = document.getElementById('tpl-usuarios');
        const node = tpl.content.cloneNode(true);

        panelEl.appendChild(node);

        // Cargar entidades + usuarios en paralelo
        try {
            const [usuariosRes, entidadesRes] = await Promise.all([
                apiFetch('/usuarios'),
                apiFetch('/entidades'),
            ]);

            entidadesCache = entidadesRes.entidades || [];
            poblarSelectsEntidades();
            pintarTablaUsuarios(usuariosRes.usuarios || []);
        } catch (err) {
            window.showPopup('Error', err.message || 'No se pudieron cargar los usuarios.', 'error');
        }
    }

    /** Sección independiente "Nuevo usuario": sólo el formulario de creación. */
    async function renderNuevoUsuario() {
        const tpl = document.getElementById('tpl-nuevo-usuario');
        const node = tpl.content.cloneNode(true);

        const formCrear = node.querySelector('#formCrearUsuario');
        formCrear.addEventListener('submit', onSubmitCrearUsuario);

        const cancelBtn = node.querySelector('[data-action="cancelar-crear"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                setActiveSidebar('usuarios');
                switchConfigSection('usuarios');
            });
        }

        panelEl.appendChild(node);

        // Asegurar que las entidades estén cargadas para el select
        try {
            if (entidadesCache.length === 0) {
                const entidadesRes = await apiFetch('/entidades');
                entidadesCache = entidadesRes.entidades || [];
            }
            poblarSelectsEntidades();
        } catch (err) {
            window.showPopup('Error', err.message || 'No se pudieron cargar las entidades.', 'error');
        }
    }

    function poblarSelectsEntidades() {
        const selects = panelEl.querySelectorAll('select[data-entidades-select]');
        selects.forEach(sel => {
            // Conservar el valor actualmente seleccionado
            const currentVal = sel.value;
            // Limpiar opciones excepto la primera ("— Sin entidad —")
            while (sel.options.length > 1) sel.remove(1);
            entidadesCache.forEach(ent => {
                const opt = document.createElement('option');
                opt.value = ent.id;
                opt.textContent = ent.name;
                sel.appendChild(opt);
            });
            sel.value = currentVal;
        });
    }

    function pintarTablaUsuarios(usuarios) {
        const tbody = panelEl.querySelector('#tblUsuarios tbody');
        tbody.innerHTML = '';

        if (usuarios.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="5" class="config-table-empty">No hay usuarios registrados.</td>';
            tbody.appendChild(tr);
            return;
        }

        usuarios.forEach(u => tbody.appendChild(filaUsuario(u)));
    }

    function filaUsuario(u) {
        const tr = document.createElement('tr');
        tr.dataset.id = u.id;

        const entidadNombre = u.entidad ? u.entidad.name : '—';
        const rolLabel = ROLE_LABELS[u.role] || u.role;
        const esYo = currentUser && u.id === currentUser.id;

        tr.innerHTML = `
            <td>${escapeHtml(u.name)}${esYo ? ' <span class="badge-self">(tú)</span>' : ''}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>${escapeHtml(entidadNombre)}</td>
            <td><span class="role-pill role-${u.role}">${rolLabel}</span></td>
            <td class="col-actions">
                <button class="config-icon-btn" data-action="editar" title="Editar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="config-icon-btn config-icon-btn-danger" data-action="eliminar" title="Eliminar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/>
                        <path d="M14 11v6"/>
                        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </td>
        `;

        // Datos crudos para edición in-line
        tr._usuario = u;

        tr.querySelector('[data-action="editar"]').addEventListener('click', () => {
            transformarFilaEnEdicion(tr);
        });

        tr.querySelector('[data-action="eliminar"]').addEventListener('click', () => {
            confirmarEliminar(u);
        });

        return tr;
    }

    function transformarFilaEnEdicion(tr) {
        const u = tr._usuario;

        // Construir las opciones de entidades como string HTML
        const entOptions =
            '<option value="">— Sin entidad —</option>' +
            entidadesCache.map(e =>
                `<option value="${e.id}" ${u.entidad && u.entidad.id === e.id ? 'selected' : ''}>${escapeHtml(e.name)}</option>`
            ).join('');

        const roleOptions = ['viewer', 'operator', 'admin'].map(r =>
            `<option value="${r}" ${u.role === r ? 'selected' : ''}>${ROLE_LABELS[r]}</option>`
        ).join('');

        tr.classList.add('row-editing');
        tr.innerHTML = `
            <td><input type="text" name="name" value="${escapeAttr(u.name)}" maxlength="255"></td>
            <td><input type="email" name="email" value="${escapeAttr(u.email)}" maxlength="255"></td>
            <td><select name="entidad_id">${entOptions}</select></td>
            <td><select name="role">${roleOptions}</select></td>
            <td class="col-actions">
                <input type="password" name="password" placeholder="Nueva contraseña (opcional)" minlength="8" class="inline-password">
                <button class="config-btn config-btn-primary config-btn-sm" data-action="guardar">Guardar</button>
                <button class="config-btn config-btn-sm" data-action="cancelar">Cancelar</button>
            </td>
        `;

        tr.querySelector('[data-action="cancelar"]').addEventListener('click', () => {
            // Volver a renderizar la fila como vista normal
            const nuevaFila = filaUsuario(u);
            tr.replaceWith(nuevaFila);
        });

        tr.querySelector('[data-action="guardar"]').addEventListener('click', async () => {
            const payload = {
                name: tr.querySelector('input[name="name"]').value.trim(),
                email: tr.querySelector('input[name="email"]').value.trim(),
                role: tr.querySelector('select[name="role"]').value,
                entidad_id: tr.querySelector('select[name="entidad_id"]').value || null,
            };
            const pwd = tr.querySelector('input[name="password"]').value;
            if (pwd) {
                payload.password = pwd;
                payload.password_confirmation = pwd;
            }

            try {
                const res = await apiFetch(`/usuarios/${u.id}`, { method: 'PATCH', body: payload });
                window.showPopup('Éxito', 'Usuario actualizado.', 'success');
                const nuevaFila = filaUsuario(res.usuario);
                tr.replaceWith(nuevaFila);

                // Si me edité a mí mismo, sincronizar localStorage y header
                if (currentUser && res.usuario.id === currentUser.id) {
                    currentUser = res.usuario;
                    localStorage.setItem('user', JSON.stringify(res.usuario));
                    refreshHeaderName(res.usuario.name);
                }
            } catch (err) {
                window.showPopup('Error', err.message || 'No se pudo actualizar.', 'error');
            }
        });
    }

    async function confirmarEliminar(u) {
        const esYo = currentUser && u.id === currentUser.id;
        const mensaje = esYo
            ? '¿Estás seguro de eliminar TU PROPIA cuenta? Se cerrará tu sesión inmediatamente.'
            : `¿Estás seguro de eliminar al usuario "${u.name}"? Esta acción no se puede deshacer.`;

        const ok = await window.showConfirm('Eliminar usuario', mensaje, {
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            type: 'error',
        });
        if (!ok) return;

        try {
            const res = await apiFetch(`/usuarios/${u.id}`, { method: 'DELETE' });

            if (res.self_deleted) {
                // El admin se eliminó a sí mismo: limpiar sesión y redirigir.
                localStorage.removeItem('api_token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }

            window.showPopup('Éxito', 'Usuario eliminado.', 'success');
            // Recargar lista
            const lista = await apiFetch('/usuarios');
            pintarTablaUsuarios(lista.usuarios || []);
        } catch (err) {
            window.showPopup('Error', err.message || 'No se pudo eliminar.', 'error');
        }
    }

    async function onSubmitCrearUsuario(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);

        const payload = {
            name: (fd.get('name') || '').trim(),
            email: (fd.get('email') || '').trim(),
            role: fd.get('role'),
            entidad_id: fd.get('entidad_id') || null,
            password: fd.get('password'),
            password_confirmation: fd.get('password_confirmation'),
        };

        if (payload.password !== payload.password_confirmation) {
            window.showPopup('Error', 'Las contraseñas no coinciden.', 'error');
            return;
        }

        try {
            await apiFetch('/usuarios', { method: 'POST', body: payload });
            window.showPopup('Éxito', 'Usuario creado correctamente.', 'success');
            form.reset();
            // Volver al listado para ver el nuevo usuario
            setActiveSidebar('usuarios');
            switchConfigSection('usuarios');
        } catch (err) {
            window.showPopup('Error', err.message || 'No se pudo crear el usuario.', 'error');
        }
    }

    // ────────────────────────────────────────────────────────────────────
    //  Helpers
    // ────────────────────────────────────────────────────────────────────

    /**
     * Wrapper de fetch contra la API: añade token, content-type y maneja errores
     * de validación devolviendo un mensaje legible.
     */
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

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(s) {
        return escapeHtml(s);
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

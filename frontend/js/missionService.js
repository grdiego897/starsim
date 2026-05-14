/**
 * Servicio de Misiones — capa cliente sobre el API REST de Laravel.
 * Persiste los datos en la base de datos (no en localStorage).
 *
 * Expuesto como window.MissionService.
 *
 * Métodos públicos:
 *   await refresh()                    -> recarga la caché desde el servidor
 *   await getAllMissions()             -> Array de misiones (recarga si caché vacía)
 *   getAllMissionsSync()               -> Array desde caché (no hace fetch)
 *   await getMissionById(id)           -> objeto misión o null
 *   await saveMission(data)            -> true | 'duplicate' | false
 *   await updateMission(data)          -> true | 'duplicate' | false
 *   await updateStatus(id, status)     -> true | false
 *   await deleteMission(id)            -> true | false
 *   subscribe(cb) -> unsubscribe()
 *
 *   lastError                          -> última cadena de error legible (o null)
 */
(function () {
    const API_BASE = 'http://127.0.0.1/api';
    const EVENT_NAME = 'missions-updated';

    let cache = [];
    let cacheLoaded = false;

    function notifyUpdate() {
        window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }

    function getToken() {
        return localStorage.getItem('api_token');
    }

    function authHeaders(extra = {}) {
        const t = getToken();
        return Object.assign(
            { 'Accept': 'application/json' },
            t ? { 'Authorization': 'Bearer ' + t } : {},
            extra
        );
    }

    function handleAuthError(res) {
        if (res.status === 401) {
            // Token inválido o expirado — forzar relogin
            localStorage.removeItem('api_token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    }

    async function parseError(res) {
        try {
            const data = await res.json();
            if (data.errors) {
                const msgs = Object.values(data.errors).flat().join(' ');
                return msgs || data.message || `Error ${res.status}`;
            }
            return data.message || `Error ${res.status}`;
        } catch (_) {
            return `Error ${res.status}`;
        }
    }

    const MissionService = {
        lastError: null,

        async refresh() {
            this.lastError = null;
            try {
                const res = await fetch(`${API_BASE}/misiones`, {
                    method: 'GET',
                    headers: authHeaders()
                });

                if (!res.ok) {
                    handleAuthError(res);
                    this.lastError = await parseError(res);
                    return cache;
                }

                const json = await res.json();
                cache = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
                cacheLoaded = true;
                return cache;
            } catch (err) {
                console.error('Error de red al cargar misiones:', err);
                this.lastError = 'Error de conexión con el servidor.';
                return cache;
            }
        },

        async getAllMissions() {
            if (!cacheLoaded) {
                await this.refresh();
            }
            return cache.slice();
        },

        getAllMissionsSync() {
            return cache.slice();
        },

        async getMissionById(id) {
            this.lastError = null;
            // Buscar primero en caché
            const cached = cache.find(m => String(m.id) === String(id));
            if (cached) return cached;

            try {
                const res = await fetch(`${API_BASE}/misiones/${id}`, {
                    method: 'GET',
                    headers: authHeaders()
                });

                if (!res.ok) {
                    handleAuthError(res);
                    this.lastError = await parseError(res);
                    return null;
                }

                const json = await res.json();
                return json.data || json || null;
            } catch (err) {
                console.error('Error obteniendo misión:', err);
                this.lastError = 'Error de conexión con el servidor.';
                return null;
            }
        },

        async saveMission(missionData) {
            this.lastError = null;
            try {
                const res = await fetch(`${API_BASE}/misiones`, {
                    method: 'POST',
                    headers: authHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify(missionData)
                });

                if (res.status === 422) {
                    const errJson = await res.json().catch(() => ({}));
                    const errs = errJson.errors || {};
                    if (errs.name && errs.name.some(m => /unique|tomado|already|exist/i.test(m))) {
                        this.lastError = 'Ya existe una misión con ese nombre.';
                        return 'duplicate';
                    }
                    this.lastError = Object.values(errs).flat().join(' ') || errJson.message || 'Datos inválidos.';
                    return false;
                }

                if (res.status === 403) {
                    this.lastError = 'No tienes permisos para crear misiones.';
                    return false;
                }

                if (!res.ok) {
                    handleAuthError(res);
                    this.lastError = await parseError(res);
                    return false;
                }

                await this.refresh();
                notifyUpdate();
                return true;
            } catch (err) {
                console.error('Error de red al guardar misión:', err);
                this.lastError = 'Error de conexión con el servidor.';
                return false;
            }
        },

        async updateMission(missionData) {
            this.lastError = null;
            if (!missionData || !missionData.id) {
                this.lastError = 'Falta el ID de la misión.';
                return false;
            }

            try {
                const res = await fetch(`${API_BASE}/misiones/${missionData.id}`, {
                    method: 'PUT',
                    headers: authHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify(missionData)
                });

                if (res.status === 422) {
                    const errJson = await res.json().catch(() => ({}));
                    const errs = errJson.errors || {};
                    if (errs.name && errs.name.some(m => /unique|tomado|already|exist/i.test(m))) {
                        this.lastError = 'Ya existe una misión con ese nombre.';
                        return 'duplicate';
                    }
                    this.lastError = Object.values(errs).flat().join(' ') || errJson.message || 'Datos inválidos.';
                    return false;
                }

                if (res.status === 403) {
                    this.lastError = 'No tienes permisos para modificar misiones.';
                    return false;
                }

                if (!res.ok) {
                    handleAuthError(res);
                    this.lastError = await parseError(res);
                    return false;
                }

                await this.refresh();
                notifyUpdate();
                return true;
            } catch (err) {
                console.error('Error de red al actualizar misión:', err);
                this.lastError = 'Error de conexión con el servidor.';
                return false;
            }
        },

        async updateStatus(id, status) {
            this.lastError = null;
            try {
                const res = await fetch(`${API_BASE}/misiones/${id}/status`, {
                    method: 'PATCH',
                    headers: authHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ status })
                });

                if (res.status === 403) {
                    this.lastError = 'No tienes permisos para cambiar el estado.';
                    return false;
                }

                if (!res.ok) {
                    handleAuthError(res);
                    this.lastError = await parseError(res);
                    return false;
                }

                // Actualizar caché localmente sin recargar todo
                const json = await res.json();
                const updated = json.data || json;
                const idx = cache.findIndex(m => String(m.id) === String(id));
                if (idx !== -1 && updated) cache[idx] = updated;
                notifyUpdate();
                return true;
            } catch (err) {
                console.error('Error de red al cambiar estado:', err);
                this.lastError = 'Error de conexión con el servidor.';
                return false;
            }
        },

        async deleteMission(id) {
            this.lastError = null;
            try {
                const res = await fetch(`${API_BASE}/misiones/${id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                });

                if (res.status === 403) {
                    this.lastError = 'No tienes permisos para eliminar misiones.';
                    return false;
                }

                if (!res.ok) {
                    handleAuthError(res);
                    this.lastError = await parseError(res);
                    return false;
                }

                cache = cache.filter(m => String(m.id) !== String(id));
                notifyUpdate();
                return true;
            } catch (err) {
                console.error('Error de red al eliminar misión:', err);
                this.lastError = 'Error de conexión con el servidor.';
                return false;
            }
        },

        subscribe(callback) {
            window.addEventListener(EVENT_NAME, callback);
            return function unsubscribe() {
                window.removeEventListener(EVENT_NAME, callback);
            };
        }
    };

    window.MissionService = MissionService;
})();

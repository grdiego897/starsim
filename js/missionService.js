/**
 * Servicio de Misiones - Maneja la persistencia de datos usando LocalStorage
 * Expuesto globalmente como window.MissionService
 */

(function () {
    const STORAGE_KEY = 'starsim_missions';

    const MissionService = {
        /**
         * Obtener todas las misiones del almacenamiento
         * @returns {Array} Lista de misiones
         */
        getAllMissions: function () {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('Error al obtener misiones:', e);
                return [];
            }
        },

        /**
         * Obtener una misión por ID
         * @param {string} id - El ID de la misión
         * @returns {Object|null} Datos de la misión o null
         */
        getMissionById: function (id) {
            try {
                const missions = this.getAllMissions();
                return missions.find(m => m.id === id) || null;
            } catch (e) {
                console.error('Error al obtener misión por ID:', e);
                return null;
            }
        },

        /**
         * Actualizar una misión existente
         * @param {Object} missionData - Los datos actualizados de la misión (debe incluir id)
         * @returns {boolean} Estado de éxito
         */
        updateMission: function (missionData) {
            try {
                const missions = this.getAllMissions();
                const index = missions.findIndex(m => m.id === missionData.id);

                if (index !== -1) {
                    missions[index] = { ...missions[index], ...missionData }; // Combinar para preservar createdAt
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
                    return true;
                }
                return false;
            } catch (e) {
                console.error('Error al actualizar misión:', e);
                return false;
            }
        },

        /**
         * Guardar una nueva misión
         * @param {Object} missionData - El objeto de misión a guardar
         * @returns {boolean} Estado de éxito
         */
        saveMission: function (missionData) {
            try {
                const missions = this.getAllMissions();

                // Añadir ID si falta
                if (!missionData.id) {
                    missionData.id = Date.now().toString();
                }

                // Añadir marca de tiempo de creación
                if (!missionData.createdAt) {
                    missionData.createdAt = new Date().toISOString();
                }

                missions.push(missionData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
                return true;
            } catch (e) {
                console.error('Error al guardar misión:', e);
                return false;
            }
        },

        /**
         * Eliminar una misión por ID
         * @param {string} id - El ID de la misión
         * @returns {boolean} Estado de éxito
         */
        deleteMission: function (id) {
            try {
                const missions = this.getAllMissions();
                const filtered = missions.filter(m => m.id !== id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
                return true;
            } catch (e) {
                console.error('Error al eliminar misión:', e);
                return false;
            }
        }
    };

    // Exponer globalmente
    window.MissionService = MissionService;
})();

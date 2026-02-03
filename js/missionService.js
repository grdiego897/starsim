/**
 * Mission Service - Handles data persistence using LocalStorage
 * Exposed globally as window.MissionService
 */

(function () {
    const STORAGE_KEY = 'starsim_missions';

    const MissionService = {
        /**
         * Get all missions from storage
         * @returns {Array} List of missions
         */
        getAllMissions: function () {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('Error fetching missions:', e);
                return [];
            }
        },

        /**
         * Get a mission by ID
         * @param {string} id - The mission ID
         * @returns {Object|null} Mission data or null
         */
        getMissionById: function (id) {
            try {
                const missions = this.getAllMissions();
                return missions.find(m => m.id === id) || null;
            } catch (e) {
                console.error('Error fetching mission by ID:', e);
                return null;
            }
        },

        /**
         * Update an existing mission
         * @param {Object} missionData - The updated mission data (must include id)
         * @returns {boolean} Success status
         */
        updateMission: function (missionData) {
            try {
                const missions = this.getAllMissions();
                const index = missions.findIndex(m => m.id === missionData.id);

                if (index !== -1) {
                    missions[index] = { ...missions[index], ...missionData }; // Merge to preservecreatedAt
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
                    return true;
                }
                return false;
            } catch (e) {
                console.error('Error updating mission:', e);
                return false;
            }
        },

        /**
         * Save a new mission
         * @param {Object} missionData - The mission object to save
         * @returns {boolean} Success status
         */
        saveMission: function (missionData) {
            try {
                const missions = this.getAllMissions();

                // Add ID if missing
                if (!missionData.id) {
                    missionData.id = Date.now().toString();
                }

                // Add created timestamp
                if (!missionData.createdAt) {
                    missionData.createdAt = new Date().toISOString();
                }

                missions.push(missionData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
                return true;
            } catch (e) {
                console.error('Error saving mission:', e);
                return false;
            }
        },

        /**
         * Delete a mission by ID
         * @param {string} id - The mission ID
         * @returns {boolean} Success status
         */
        deleteMission: function (id) {
            try {
                const missions = this.getAllMissions();
                const filtered = missions.filter(m => m.id !== id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
                return true;
            } catch (e) {
                console.error('Error deleting mission:', e);
                return false;
            }
        }
    };

    // Expose globally
    window.MissionService = MissionService;
})();

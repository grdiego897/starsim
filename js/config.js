const CONFIG = {
    API_BASE: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1/api'
        : 'https://starsim-production-e711.up.railway.app/api'
};

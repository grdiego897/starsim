
class Router {
    constructor() {
        this.routes = {
            'panel': {
                template: 'pages/panel.html',
                style: 'css/panel.css',
                title: 'Panel - Starbase',
                init: () => window.initPanelPage && window.initPanelPage()
            },
            'mision': {
                template: 'pages/mision.html',
                style: 'css/mision.css',
                title: 'Nueva Misión',
                init: () => window.initMisionPage && window.initMisionPage()
            },
            'configAvanzada': {
                template: 'pages/configAvanzada.html',
                style: 'css/configAvanzada.css',
                title: 'Configuración Avanzada',
                init: () => window.initConfigAvanzadaPage && window.initConfigAvanzadaPage()
            },
            'program': {
                template: 'pages/program.html',
                style: 'css/program.css',
                title: 'Programa',
                init: () => window.initProgramPage && window.initProgramPage()
            }
        };

        // Bind for callback context
        this.handleLocation = this.handleLocation.bind(this);

        // Listen to hash changes
        window.addEventListener('hashchange', this.handleLocation);

        // Handle initial load
        window.addEventListener('DOMContentLoaded', this.handleLocation);
    }

    async handleLocation() {
        // Get path from hash, default to panel
        let path = window.location.hash.slice(1) || 'panel';

        // Handle query params if any (ignore for route matching)
        const queryIndex = path.indexOf('?');
        if (queryIndex !== -1) {
            path = path.slice(0, queryIndex);
        }

        const route = this.routes[path] || this.routes['panel'];

        // Update Title
        document.title = route.title;

        // Swap CSS
        const pageCss = document.getElementById('page-css');
        if (pageCss && route.style) {
            pageCss.href = route.style;
        } else if (pageCss) {
            pageCss.href = '';
        }

        // Fetch Content
        try {
            const response = await fetch(route.template);
            const html = await response.text();

            // Inject Content
            const appContent = document.getElementById('app-content');
            if (appContent) {
                appContent.innerHTML = html;

                // Initialize Page Logic
                if (route.init) {
                    // Small delay to ensure DOM is ready
                    setTimeout(route.init, 50);
                }
            }
        } catch (error) {
            console.error('Error loading page:', error);
            document.getElementById('app-content').innerHTML = '<h1>Error loading content</h1>';
        }
    }

    navigateTo(path) {
        window.location.hash = path;
    }
}

// Instantiate and expose globally
window.router = new Router();

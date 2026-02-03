
class Router {
    constructor() {
        this.routes = {
            'panel': {
                template: 'pages/panel.html',
                style: 'css/panel.css',
                title: 'Panel - Starsim',
                init: () => window.initPanelPage && window.initPanelPage()
            },
            'mision': {
                template: 'pages/mision.html',
                style: 'css/mision.css',
                title: 'Misión',
                init: () => window.initMisionPage && window.initMisionPage()
            },
            'configAvanzada': {
                template: 'pages/configAvanzada.html',
                style: 'css/configAvanzada.css',
                title: 'Configuración Avanzada de Misión',
                init: () => window.initConfigAvanzadaPage && window.initConfigAvanzadaPage()
            },
            'program': {
                template: 'pages/program.html',
                style: 'css/program.css',
                title: 'Programa',
                init: () => window.initProgramPage && window.initProgramPage()
            }
        };

        // Vincular para contexto de callback
        this.handleLocation = this.handleLocation.bind(this);

        // Escuchar cambios de hash
        window.addEventListener('hashchange', this.handleLocation);

        // Manejar carga inicial
        window.addEventListener('DOMContentLoaded', this.handleLocation);
    }

    async handleLocation() {
        // Obtener ruta del hash, por defecto panel
        let path = window.location.hash.slice(1) || 'panel';

        // Manejar parámetros de consulta si existen (ignorar para coincidencia de rutas)
        const queryIndex = path.indexOf('?');
        if (queryIndex !== -1) {
            path = path.slice(0, queryIndex);
        }

        const route = this.routes[path] || this.routes['panel'];

        // Actualizar título
        document.title = route.title;

        // Cambiar CSS
        const pageCss = document.getElementById('page-css');
        if (pageCss && route.style) {
            pageCss.href = route.style;
        } else if (pageCss) {
            pageCss.href = '';
        }

        // Obtener contenido
        try {
            const response = await fetch(route.template);
            const html = await response.text();

            // Inyectar contenido
            const appContent = document.getElementById('app-content');
            if (appContent) {
                appContent.innerHTML = html;

                // Inicializar lógica de página
                if (route.init) {
                    // Pequeño retraso para asegurar que el DOM esté listo
                    setTimeout(route.init, 50);
                }
            }
        } catch (error) {
            console.error('Error al cargar página:', error);
            document.getElementById('app-content').innerHTML = '<h1>Error al cargar contenido</h1>';
        }
    }

    navigateTo(path) {
        window.location.hash = path;
    }
}

// Instanciar y exponer globalmente
window.router = new Router();

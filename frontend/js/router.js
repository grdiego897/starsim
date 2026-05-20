// ROUTER SPA
class Router {
    constructor() {
        this.routes = {
            'panel': {
                template: 'pages/panel.html',
                style: 'css/panel.css',
                title: 'Panel',
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
                title: 'Misión Av',
                init: () => window.initConfigAvanzadaPage && window.initConfigAvanzadaPage()
            },
            'program': {
                template: 'pages/program.html',
                style: 'css/program.css',
                title: 'Programa',
                init: () => window.initProgramPage && window.initProgramPage()
            },
            'constelacion': {
                template: 'pages/constelacion.html',
                style: 'css/constelacion.css',
                title: 'Constelación',
                init: () => window.initConstelacionPage && window.initConstelacionPage()
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
        // Omitir si el cambio de hash fue disparado de forma silenciosa por ScrollTransition
        if (window._scrollTransitionSilent) return;

        // Obtener la ruta desde el hash, por defecto panel
        let path = window.location.hash.slice(1) || 'panel';

        // Manejar parámetros de consulta si existen (ignorar para coincidencia de rutas)
        const queryIndex = path.indexOf('?');
        if (queryIndex !== -1) {
            path = path.slice(0, queryIndex);
        }

        // Rutas restringidas para el rol 'viewer'
        const VIEWER_RESTRICTED_ROUTES = ['mision', 'configAvanzada'];
        if (VIEWER_RESTRICTED_ROUTES.includes(path)) {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            if (userData.role === 'viewer') {
                // Redirigir al panel silenciosamente
                window.location.hash = 'panel';
                if (window.showNotification) {
                    window.showNotification('No tienes permiso para acceder a esta sección', 3000);
                }
                return;
            }
        }

        const route = this.routes[path] || this.routes['panel'];

        // Actualizar título
        document.title = route.title;

        const pageCss = document.getElementById('page-css');

        // --- Rutas con transición de scroll ---
        if (window.ScrollTransition && window.ScrollTransition.isScrollRoute(path)) {
            // Limpiar el CSS específico de página para las rutas con scroll,
            // ya que tanto panel.css como program.css se cargan globalmente
            if (pageCss) {
                pageCss.href = '';
            }
            if (window.ScrollTransition.isInitialized()) {
                // Ya estamos en modo scroll — transitar a la sección solicitada
                window.ScrollTransition.goToRoute(path);
            } else {
                await window.ScrollTransition.init(path);
            }
            return;
        }

        // --- Rutas normales ---
        // Limpiar la transición de scroll si navegamos fuera
        if (window.ScrollTransition) {
            window.ScrollTransition.destroy();
        }

        const appContent = document.getElementById('app-content');
        if (!appContent) return;

        // Determinar si debemos animar (sólo si ya hay contenido)
        const hasExistingContent = appContent.innerHTML.trim().length > 0;

        // --- Fase 1: Desvanecer el contenido actual ---
        if (hasExistingContent) {
            appContent.classList.add('page-leaving');
            await new Promise(resolve => {
                const onEnd = () => {
                    appContent.removeEventListener('transitionend', onEnd);
                    resolve();
                };
                appContent.addEventListener('transitionend', onEnd);
                // Temporizador de seguridad por si transitionend no se dispara
                setTimeout(resolve, 400);
            });
        }

        // --- Fase 2: Intercambiar CSS y contenido ---
        if (pageCss && route.style) {
            pageCss.href = route.style;
        }

        try {
            const response = await fetch(route.template);
            const html = await response.text();

            // Saltar a la posición de entrada (invisible, sin transición)
            appContent.classList.remove('page-leaving');
            appContent.classList.add('page-entering');
            appContent.innerHTML = html;

            // Precargar todas las imágenes del nuevo contenido antes de mostrarlo
            const images = appContent.querySelectorAll('img[src]');
            if (images.length > 0) {
                const imagePromises = Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.addEventListener('load', resolve, { once: true });
                        img.addEventListener('error', resolve, { once: true });
                    });
                });
                // Esperar las imágenes con un tope de 800ms para evitar bloqueos
                await Promise.race([
                    Promise.all(imagePromises),
                    new Promise(resolve => setTimeout(resolve, 800))
                ]);
            }

            // Inicializar la lógica de la página antes de mostrarla
            if (route.init) {
                route.init();
            }

            // Forzar un reflow para que el navegador registre la posición de entrada
            void appContent.offsetHeight;

            // --- Fase 3: Aparecer con el nuevo contenido ---
            appContent.classList.remove('page-entering');
            // La transición CSS base animará opacity/transform de vuelta a la normalidad

        } catch (error) {
            console.error('Error loading page:', error);
            appContent.classList.remove('page-leaving', 'page-entering');
            appContent.innerHTML = '<h1>Error loading content</h1>';
        }
    }

    navigateTo(path) {
        window.location.hash = path;
    }
}

// Instanciar y exponer globalmente
window.router = new Router();

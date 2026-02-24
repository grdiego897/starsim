
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
<<<<<<< HEAD
        // Obtener ruta del hash, por defecto panel
=======
        // Skip if this hash change was triggered silently by ScrollTransition
        if (window._scrollTransitionSilent) return;

        // Get path from hash, default to panel
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
        let path = window.location.hash.slice(1) || 'panel';

        // Manejar parámetros de consulta si existen (ignorar para coincidencia de rutas)
        const queryIndex = path.indexOf('?');
        if (queryIndex !== -1) {
            path = path.slice(0, queryIndex);
        }

        const route = this.routes[path] || this.routes['panel'];

        // Actualizar título
        document.title = route.title;

<<<<<<< HEAD
        // Cambiar CSS
=======
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
        const pageCss = document.getElementById('page-css');

        // --- Scroll Transition Routes ---
        if (window.ScrollTransition && window.ScrollTransition.isScrollRoute(path)) {
            // Clear page-specific CSS for scroll routes
            // since both panel.css and program.css are loaded globally
            if (pageCss) {
                pageCss.href = '';
            }
            if (window.ScrollTransition.isInitialized()) {
                // Already in scroll mode — transition to the requested section
                window.ScrollTransition.goToRoute(path);
            } else {
                await window.ScrollTransition.init(path);
            }
            return;
        }

        // --- Normal Routes ---
        // Cleanup scroll transition if navigating away
        if (window.ScrollTransition) {
            window.ScrollTransition.destroy();
        }

        const appContent = document.getElementById('app-content');
        if (!appContent) return;

        // Determine if we should animate (only if there is existing content)
        const hasExistingContent = appContent.innerHTML.trim().length > 0;

        // --- Phase 1: Fade-out current content ---
        if (hasExistingContent) {
            appContent.classList.add('page-leaving');
            await new Promise(resolve => {
                const onEnd = () => {
                    appContent.removeEventListener('transitionend', onEnd);
                    resolve();
                };
                appContent.addEventListener('transitionend', onEnd);
                // Safety timeout in case transitionend doesn't fire
                setTimeout(resolve, 400);
            });
        }

        // --- Phase 2: Swap CSS & content ---
        if (pageCss && route.style) {
            pageCss.href = route.style;
        }

<<<<<<< HEAD
        // Obtener contenido
=======
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
        try {
            const response = await fetch(route.template);
            const html = await response.text();

<<<<<<< HEAD
            // Inyectar contenido
            const appContent = document.getElementById('app-content');
            if (appContent) {
                appContent.innerHTML = html;

                // Inicializar lógica de página
                if (route.init) {
                    // Pequeño retraso para asegurar que el DOM esté listo
                    setTimeout(route.init, 50);
                }
=======
            // Snap to entry position (invisible, no transition)
            appContent.classList.remove('page-leaving');
            appContent.classList.add('page-entering');
            appContent.innerHTML = html;

            // Preload all images in the new content before revealing
            const images = appContent.querySelectorAll('img[src]');
            if (images.length > 0) {
                const imagePromises = Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.addEventListener('load', resolve, { once: true });
                        img.addEventListener('error', resolve, { once: true });
                    });
                });
                // Wait for images but cap at 800ms to avoid hanging
                await Promise.race([
                    Promise.all(imagePromises),
                    new Promise(resolve => setTimeout(resolve, 800))
                ]);
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
            }

            // Initialize page logic before revealing
            if (route.init) {
                route.init();
            }

            // Force a reflow so the browser registers the entry position
            void appContent.offsetHeight;

            // --- Phase 3: Fade-in new content ---
            appContent.classList.remove('page-entering');
            // The base CSS transition will animate opacity/transform back to normal

        } catch (error) {
<<<<<<< HEAD
            console.error('Error al cargar página:', error);
            document.getElementById('app-content').innerHTML = '<h1>Error al cargar contenido</h1>';
=======
            console.error('Error loading page:', error);
            appContent.classList.remove('page-leaving', 'page-entering');
            appContent.innerHTML = '<h1>Error loading content</h1>';
>>>>>>> 45965733d2f3cbc3b60d507432d4bdee1915a2a7
        }
    }

    navigateTo(path) {
        window.location.hash = path;
    }
}

// Instanciar y exponer globalmente
window.router = new Router();

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
        // Skip if this hash change was triggered silently by ScrollTransition
        if (window._scrollTransitionSilent) return;

        // Get path from hash, default to panel
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

        try {
            const response = await fetch(route.template);
            const html = await response.text();

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

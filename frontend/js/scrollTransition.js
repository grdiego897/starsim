/**
 * Transición de scroll entre las pantallas principales
 */
(function () {
    'use strict';

    const SECTIONS = [
        {
            id: 'section-constelacion',
            route: 'constelacion',
            template: 'pages/constelacion.html',
            label: 'Constelación',
            init: () => window.initConstelacionPage && window.initConstelacionPage()
        },
        {
            id: 'section-panel',
            route: 'panel',
            template: 'pages/panel.html',
            label: 'Panel',
            init: () => window.initPanelPage && window.initPanelPage()
        },
        {
            id: 'section-program',
            route: 'program',
            template: 'pages/program.html',
            label: 'Programa',
            init: () => window.initProgramPage && window.initProgramPage()
        }
    ];

    let activeIndex = 0;
    let transitioning = false;
    let cooldownTimer = null;
    let viewportEl = null;
    let initialized = false;

    // Delta acumulado para una detección más suave
    let accumulatedDelta = 0;
    const DELTA_THRESHOLD = 120;
    let deltaResetTimer = null;

    // Alterna la clase de pantalla completa en el body para que Constelación ocupe la ventana
    // (cabecera oculta, viewport ampliado a 100vh) cuando es la sección activa.
    function applyFullBleed(index) {
        const isConst = SECTIONS[index] && SECTIONS[index].route === 'constelacion';
        document.body.classList.toggle('constelacion-active', isConst);
    }

    /**
     * Construye el viewport de scroll con todas las secciones
     */
    async function initScrollTransition(startRoute) {
        // Determinar la sección inicial
        activeIndex = SECTIONS.findIndex(s => s.route === startRoute);
        if (activeIndex < 0) activeIndex = 0;

        const appContent = document.getElementById('app-content');
        if (!appContent) return;

        // Limpiar contenido previo
        appContent.innerHTML = '';

        // Crear viewport
        viewportEl = document.createElement('div');
        viewportEl.className = 'scroll-viewport';

        // Obtener e inyectar todas las plantillas de sección
        for (let i = 0; i < SECTIONS.length; i++) {
            const sec = SECTIONS[i];
            const sectionEl = document.createElement('div');
            sectionEl.id = sec.id;
            sectionEl.className = 'scroll-section';

            // Clases de posición
            if (i === activeIndex) {
                sectionEl.classList.add('active');
            } else if (i > activeIndex) {
                sectionEl.classList.add('below');
            } else {
                sectionEl.classList.add('above');
            }

            try {
                const resp = await fetch(sec.template);
                sectionEl.innerHTML = await resp.text();
            } catch (e) {
                console.error(`Error loading ${sec.template}:`, e);
                sectionEl.innerHTML = '<p style="padding:40px;color:#888;">Error loading content</p>';
            }

            viewportEl.appendChild(sectionEl);
        }

        appContent.appendChild(viewportEl);

        // Inicializar scripts de página
        for (const sec of SECTIONS) {
            setTimeout(sec.init, 80);
        }

        // Asociar el listener de scroll al viewport
        viewportEl.addEventListener('wheel', handleWheel, { passive: false });

        // Actualizar el hash de forma silenciosa
        silentHashUpdate(SECTIONS[activeIndex].route);

        applyFullBleed(activeIndex);

        initialized = true;
    }

    /**
     * Gestiona los eventos de rueda para la transición de sección
     */
    function handleWheel(e) {
        if (transitioning) {
            e.preventDefault();
            return;
        }

        const currentSection = viewportEl.querySelector('.scroll-section.active');
        if (!currentSection) return;

        const scrollTop = currentSection.scrollTop;
        const scrollHeight = currentSection.scrollHeight;
        const clientHeight = currentSection.clientHeight;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 5;
        const atTop = scrollTop <= 5;

        const deltaY = e.deltaY;

        // Scroll hacia abajo al llegar al final → ir a la siguiente sección
        if (deltaY > 0 && atBottom && activeIndex < SECTIONS.length - 1) {
            e.preventDefault();
            accumulatedDelta += Math.abs(deltaY);
            clearTimeout(deltaResetTimer);
            deltaResetTimer = setTimeout(() => { accumulatedDelta = 0; }, 300);

            if (accumulatedDelta >= DELTA_THRESHOLD) {
                accumulatedDelta = 0;
                transitionTo(activeIndex + 1);
            }
            return;
        }

        // Scroll hacia arriba al llegar al inicio → ir a la sección anterior
        if (deltaY < 0 && atTop && activeIndex > 0) {
            e.preventDefault();
            accumulatedDelta += Math.abs(deltaY);
            clearTimeout(deltaResetTimer);
            deltaResetTimer = setTimeout(() => { accumulatedDelta = 0; }, 300);

            if (accumulatedDelta >= DELTA_THRESHOLD) {
                accumulatedDelta = 0;
                transitionTo(activeIndex - 1);
            }
            return;
        }

        // Scroll normal dentro de la sección — permitir
    }

    /**
     * Transita a un índice de sección concreto
     */
    function transitionTo(newIndex) {
        if (newIndex === activeIndex || transitioning) return;
        if (newIndex < 0 || newIndex >= SECTIONS.length) return;

        transitioning = true;
        const oldIndex = activeIndex;
        activeIndex = newIndex;

        const sections = viewportEl.querySelectorAll('.scroll-section');

        sections.forEach((el, i) => {
            el.classList.remove('active', 'above', 'below');
            if (i === newIndex) {
                el.classList.add('active');
                // Reiniciar el scroll al inicio si venimos desde arriba
                if (newIndex > oldIndex) {
                    el.scrollTop = 0;
                }
            } else if (i < newIndex) {
                el.classList.add('above');
            } else {
                el.classList.add('below');
            }
        });

        applyFullBleed(newIndex);

        // Actualizar el hash
        silentHashUpdate(SECTIONS[newIndex].route);

        // Actualizar el título de la página
        const routeConfig = window.router && window.router.routes
            ? window.router.routes[SECTIONS[newIndex].route]
            : null;
        if (routeConfig) document.title = routeConfig.title;

        // Tiempo de espera
        clearTimeout(cooldownTimer);
        cooldownTimer = setTimeout(() => {
            transitioning = false;
        }, 700);
    }

    /**
     * Actualiza el hash sin disparar hashchange
     */
    function silentHashUpdate(route) {
        if (window._scrollTransitionSilent) return;
        window._scrollTransitionSilent = true;
        history.replaceState(null, '', '#' + route);
        setTimeout(() => { window._scrollTransitionSilent = false; }, 50);
    }

    /**
     * Limpieza — se invoca al navegar fuera de las rutas con scroll habilitado
     */
    function destroyScrollTransition() {
        // Las secciones pueden registrar un hook de limpieza (p. ej. Constelación detiene aquí su bucle rAF).
        if (typeof window._constelacionCleanup === 'function') {
            try { window._constelacionCleanup(); } catch (_) { }
            window._constelacionCleanup = null;
        }
        document.body.classList.remove('constelacion-active');
        if (viewportEl) {
            viewportEl.removeEventListener('wheel', handleWheel);
            viewportEl = null;
        }
        initialized = false;
        activeIndex = 0;
        transitioning = false;
        accumulatedDelta = 0;
    }

    /**
     * Navega a una ruta concreta dentro del viewport de scroll (p. ej. desde la sidebar)
     */
    function goToRoute(route) {
        const idx = SECTIONS.findIndex(s => s.route === route);
        if (idx >= 0) transitionTo(idx);
    }

    /**
     * Comprueba si una ruta tiene la transición de scroll habilitada
     */
    function isScrollRoute(route) {
        return SECTIONS.some(s => s.route === route);
    }

    // Exponer globalmente
    window.ScrollTransition = {
        init: initScrollTransition,
        destroy: destroyScrollTransition,
        isScrollRoute: isScrollRoute,
        isInitialized: () => initialized,
        goToRoute: goToRoute
    };
})();

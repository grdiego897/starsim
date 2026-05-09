/**
 * ScrollTransition — scroll-based page switching between Panel and Programa
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

    // Accumulated delta for smoother detection
    let accumulatedDelta = 0;
    const DELTA_THRESHOLD = 120;
    let deltaResetTimer = null;

    // Toggles the full-bleed body class so Constelación occupies the full window
    // (header hidden, viewport expanded to 100vh) when it's the active section.
    function applyFullBleed(index) {
        const isConst = SECTIONS[index] && SECTIONS[index].route === 'constelacion';
        document.body.classList.toggle('constelacion-active', isConst);
    }

    /**
     * Build the scroll viewport with all sections
     */
    async function initScrollTransition(startRoute) {
        // Determine starting section
        activeIndex = SECTIONS.findIndex(s => s.route === startRoute);
        if (activeIndex < 0) activeIndex = 0;

        const appContent = document.getElementById('app-content');
        if (!appContent) return;

        // Clear previous content
        appContent.innerHTML = '';

        // Create viewport
        viewportEl = document.createElement('div');
        viewportEl.className = 'scroll-viewport';

        // Fetch and inject all section templates
        for (let i = 0; i < SECTIONS.length; i++) {
            const sec = SECTIONS[i];
            const sectionEl = document.createElement('div');
            sectionEl.id = sec.id;
            sectionEl.className = 'scroll-section';

            // Position classes
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

        // Init page scripts
        for (const sec of SECTIONS) {
            setTimeout(sec.init, 80);
        }

        // Attach scroll listener to viewport
        viewportEl.addEventListener('wheel', handleWheel, { passive: false });

        // Update hash silently
        silentHashUpdate(SECTIONS[activeIndex].route);

        applyFullBleed(activeIndex);

        initialized = true;
    }

    /**
     * Handle wheel events for section transition
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

        // Scrolling down at the bottom → go to next section
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

        // Scrolling up at the top → go to previous section
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

        // Normal scroll within the section — allow
    }

    /**
     * Transition to a specific section index
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
                // Reset scroll to top if coming from above
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

        // Update hash
        silentHashUpdate(SECTIONS[newIndex].route);

        // Update page title
        const routeConfig = window.router && window.router.routes
            ? window.router.routes[SECTIONS[newIndex].route]
            : null;
        if (routeConfig) document.title = routeConfig.title;

        // Cooldown
        clearTimeout(cooldownTimer);
        cooldownTimer = setTimeout(() => {
            transitioning = false;
        }, 700);
    }

    /**
     * Update hash without triggering hashchange
     */
    function silentHashUpdate(route) {
        if (window._scrollTransitionSilent) return;
        window._scrollTransitionSilent = true;
        history.replaceState(null, '', '#' + route);
        setTimeout(() => { window._scrollTransitionSilent = false; }, 50);
    }

    /**
     * Cleanup — called when navigating away from scroll-enabled routes
     */
    function destroyScrollTransition() {
        // Sections may register a cleanup hook (e.g. Constelación stops its rAF loop here).
        if (typeof window._constelacionCleanup === 'function') {
            try { window._constelacionCleanup(); } catch (_) {}
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
     * Navigate to a specific route within the scroll viewport (e.g. from sidebar)
     */
    function goToRoute(route) {
        const idx = SECTIONS.findIndex(s => s.route === route);
        if (idx >= 0) transitionTo(idx);
    }

    /**
     * Check if a route is scroll-transition enabled
     */
    function isScrollRoute(route) {
        return SECTIONS.some(s => s.route === route);
    }

    // Expose globally
    window.ScrollTransition = {
        init: initScrollTransition,
        destroy: destroyScrollTransition,
        isScrollRoute: isScrollRoute,
        isInitialized: () => initialized,
        goToRoute: goToRoute
    };
})();

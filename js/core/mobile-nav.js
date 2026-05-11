/**
 * Mobile Navigation Management
 *
 * @fileoverview Burger-Menu und Drawer-Navigation für Mobile
 * @module core/mobile-nav
 */

(function() {
    'use strict';

    /**
     * DOM Element IDs
     * @readonly
     */
    const ELEMENTS = Object.freeze({
        DRAWER: 'mobileNavDrawer',
        OVERLAY: 'mobileNavOverlay',
        TOGGLE: 'burgerMenuToggle',
        CLOSE: 'drawerClose'
    });

    /**
     * CSS Klassen
     * @readonly
     */
    const CLASSES = Object.freeze({
        OPEN: 'open',
        VISIBLE: 'visible',
        ACTIVE: 'active'
    });

    /**
     * Breakpoint für Desktop (px)
     * @const {number}
     */
    const DESKTOP_BREAKPOINT = 992;

    /**
     * Öffnet die Mobile Navigation
     */
    function open() {
        const drawer = document.getElementById(ELEMENTS.DRAWER);
        const overlay = document.getElementById(ELEMENTS.OVERLAY);
        const toggle = document.getElementById(ELEMENTS.TOGGLE);

        if (drawer) drawer.classList.add(CLASSES.OPEN);
        if (overlay) overlay.classList.add(CLASSES.VISIBLE);
        if (toggle) toggle.classList.add(CLASSES.ACTIVE);

        document.body.style.overflow = 'hidden';
    }

    /**
     * Schließt die Mobile Navigation
     */
    function close() {
        const drawer = document.getElementById(ELEMENTS.DRAWER);
        const overlay = document.getElementById(ELEMENTS.OVERLAY);
        const toggle = document.getElementById(ELEMENTS.TOGGLE);

        if (drawer) drawer.classList.remove(CLASSES.OPEN);
        if (overlay) overlay.classList.remove(CLASSES.VISIBLE);
        if (toggle) toggle.classList.remove(CLASSES.ACTIVE);

        document.body.style.overflow = '';
    }

    /**
     * Toggled die Mobile Navigation
     */
    function toggle() {
        const drawer = document.getElementById(ELEMENTS.DRAWER);
        const isOpen = drawer && drawer.classList.contains(CLASSES.OPEN);

        if (isOpen) {
            close();
        } else {
            open();
        }
    }

    /**
     * Prüft ob die Navigation offen ist
     * @returns {boolean}
     */
    function isOpen() {
        const drawer = document.getElementById(ELEMENTS.DRAWER);
        return drawer ? drawer.classList.contains(CLASSES.OPEN) : false;
    }

    /**
     * Initialisiert Event-Listener
     */
    function init() {
        // Burger-Toggle Button
        const toggleBtn = document.getElementById(ELEMENTS.TOGGLE);
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggle);
        }

        // Overlay (Klick außerhalb schließt)
        const overlay = document.getElementById(ELEMENTS.OVERLAY);
        if (overlay) {
            overlay.addEventListener('click', close);
        }

        // Close-Button im Drawer
        const closeBtn = document.getElementById(ELEMENTS.CLOSE);
        if (closeBtn) {
            closeBtn.addEventListener('click', close);
        }

        // Interne Links im Drawer schließen die Navigation
        document.querySelectorAll('.drawer-internal-link').forEach(link => {
            link.addEventListener('click', close);
        });

        // Escape-Taste schließt Navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                close();
            }
        });

        // Bei Resize auf Desktop schließen
        window.addEventListener('resize', () => {
            if (window.innerWidth > DESKTOP_BREAKPOINT) {
                close();
            }
        });
    }

    // Global verfügbar machen
    window.MobileNav = Object.freeze({
        ELEMENTS,
        CLASSES,
        DESKTOP_BREAKPOINT,
        open,
        close,
        toggle,
        isOpen,
        init
    });

    // Globale Funktionen für onclick-Handler (Rückwärtskompatibilität)
    window.toggleMobileNav = toggle;
    window.closeMobileNav = close;

})();

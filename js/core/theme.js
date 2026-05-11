/**
 * Theme-Management für Light/Dark Mode
 *
 * @fileoverview Theme-Wechsel und Persistierung
 * @module core/theme
 */

(function() {
    'use strict';

    /**
     * Verfügbare Themes
     * @readonly
     */
    const THEMES = Object.freeze({
        LIGHT: 'light',
        DARK: 'dark'
    });

    const STORAGE_KEY = 'theme';

    /**
     * Initialisiert das Theme aus LocalStorage oder System-Präferenz
     */
    function init() {
        const savedTheme = localStorage.getItem(STORAGE_KEY) || THEMES.LIGHT;
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    /**
     * Wechselt zwischen Light und Dark Mode
     * @returns {string} Das neue Theme
     */
    function toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);

        return newTheme;
    }

    /**
     * Setzt ein bestimmtes Theme
     * @param {string} theme - 'light' oder 'dark'
     */
    function set(theme) {
        if (theme !== THEMES.LIGHT && theme !== THEMES.DARK) {
            console.warn(`ThemeManager.set: Invalid theme '${theme}'`);
            return;
        }

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }

    /**
     * Gibt das aktuelle Theme zurück
     * @returns {string} 'light' oder 'dark'
     */
    function getCurrent() {
        return document.documentElement.getAttribute('data-theme') || THEMES.LIGHT;
    }

    /**
     * Prüft ob Dark Mode aktiv ist
     * @returns {boolean}
     */
    function isDark() {
        return getCurrent() === THEMES.DARK;
    }

    // Global verfügbar machen
    window.ThemeManager = Object.freeze({
        THEMES,
        init,
        toggle,
        set,
        getCurrent,
        isDark
    });

    // Globale Funktion für onclick-Handler (Rückwärtskompatibilität)
    window.toggleTheme = toggle;

})();

/**
 * Utility-Funktionen mit Error-Handling
 *
 * @fileoverview Allgemeine Hilfsfunktionen
 * @module core/utils
 */

(function() {
    'use strict';

    /**
     * Sichere DOM-Element-Abfrage
     * @param {string} selector - CSS-Selektor oder ID (mit #)
     * @param {boolean} [required=false] - Loggt Warnung wenn nicht gefunden
     * @returns {HTMLElement|null}
     */
    function getElement(selector, required = false) {
        const element = selector.startsWith('#')
            ? document.getElementById(selector.slice(1))
            : document.querySelector(selector);

        if (!element && required) {
            console.warn(`Utils.getElement: Element not found: ${selector}`);
        }

        return element;
    }

    /**
     * Sichere innerHTML-Zuweisung
     * @param {HTMLElement|string} elementOrSelector
     * @param {string} html
     * @returns {boolean} Erfolg
     */
    function setInnerHTML(elementOrSelector, html) {
        try {
            const element = typeof elementOrSelector === 'string'
                ? getElement(elementOrSelector)
                : elementOrSelector;

            if (element) {
                element.innerHTML = html;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Utils.setInnerHTML failed:', error);
            return false;
        }
    }

    /**
     * Sichere textContent-Zuweisung
     * @param {HTMLElement|string} elementOrSelector
     * @param {string} text
     * @returns {boolean} Erfolg
     */
    function setTextContent(elementOrSelector, text) {
        try {
            const element = typeof elementOrSelector === 'string'
                ? getElement(elementOrSelector)
                : elementOrSelector;

            if (element) {
                element.textContent = text;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Utils.setTextContent failed:', error);
            return false;
        }
    }

    /**
     * Sichere Style-Zuweisung
     * @param {HTMLElement} element
     * @param {Object} styles - Style-Objekt { property: value }
     */
    function setStyles(element, styles) {
        if (!element || !styles) return;

        try {
            Object.entries(styles).forEach(([prop, value]) => {
                element.style[prop] = value;
            });
        } catch (error) {
            console.error('Utils.setStyles failed:', error);
        }
    }

    /**
     * Sichere Klassen-Manipulation
     * @param {HTMLElement|string} elementOrSelector
     * @param {string} className
     * @param {boolean} add - true = add, false = remove
     * @returns {boolean} Erfolg
     */
    function toggleClass(elementOrSelector, className, add) {
        try {
            const element = typeof elementOrSelector === 'string'
                ? getElement(elementOrSelector)
                : elementOrSelector;

            if (element) {
                if (add) {
                    element.classList.add(className);
                } else {
                    element.classList.remove(className);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Utils.toggleClass failed:', error);
            return false;
        }
    }

    /**
     * Debounce-Funktion
     * @param {Function} func - Zu debouncende Funktion
     * @param {number} [wait=100] - Wartezeit in ms
     * @returns {Function} Debounced Funktion
     */
    function debounce(func, wait = 100) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle-Funktion
     * @param {Function} func - Zu throttlende Funktion
     * @param {number} [limit=100] - Minimale Zeit zwischen Aufrufen in ms
     * @returns {Function} Throttled Funktion
     */
    function throttle(func, limit = 100) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Erstellt ein DocumentFragment aus HTML-String
     * @param {string} html
     * @returns {DocumentFragment}
     */
    function createFragment(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content;
    }

    /**
     * Formatiert eine Zahl mit einer bestimmten Anzahl Dezimalstellen
     * @param {number} value
     * @param {number} [decimals=1]
     * @returns {string}
     */
    function formatNumber(value, decimals = 1) {
        return Number(value).toFixed(decimals);
    }

    // Global verfügbar machen
    window.Utils = Object.freeze({
        getElement,
        setInnerHTML,
        setTextContent,
        setStyles,
        toggleClass,
        debounce,
        throttle,
        createFragment,
        formatNumber
    });

})();

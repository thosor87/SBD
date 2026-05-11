/**
 * LocalStorage Wrapper mit Error-Handling
 *
 * @fileoverview Sicherer Zugriff auf LocalStorage/SessionStorage
 * @module core/storage
 */

(function() {
    'use strict';

    /**
     * Storage Keys für die Anwendung
     * @readonly
     */
    const KEYS = Object.freeze({
        CUSTOM_SCORES: 'scc_custom_provider_scores',
        THEME: 'theme',
        SESSION_UNLOCKED: 'compassUnlocked',
        SESSION_PUBLIC: 'compassPublic'
    });

    /**
     * Sicheres Laden aus LocalStorage
     * @param {string} key - Storage Key
     * @param {*} [defaultValue=null] - Fallback-Wert
     * @returns {*} Gespeicherter oder Default-Wert
     */
    function load(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error(`StorageManager.load('${key}') failed:`, error);
            return defaultValue;
        }
    }

    /**
     * Sicheres Speichern in LocalStorage
     * @param {string} key - Storage Key
     * @param {*} value - Zu speichernder Wert
     * @returns {boolean} Erfolg
     */
    function save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`StorageManager.save('${key}') failed:`, error);
            return false;
        }
    }

    /**
     * Entfernt einen Key aus LocalStorage
     * @param {string} key
     * @returns {boolean}
     */
    function remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`StorageManager.remove('${key}') failed:`, error);
            return false;
        }
    }

    /**
     * Lädt einen String-Wert (ohne JSON-Parsing)
     * @param {string} key
     * @param {string} [defaultValue='']
     * @returns {string}
     */
    function loadString(key, defaultValue = '') {
        try {
            return localStorage.getItem(key) || defaultValue;
        } catch (error) {
            console.error(`StorageManager.loadString('${key}') failed:`, error);
            return defaultValue;
        }
    }

    /**
     * Speichert einen String-Wert (ohne JSON-Stringify)
     * @param {string} key
     * @param {string} value
     * @returns {boolean}
     */
    function saveString(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error(`StorageManager.saveString('${key}') failed:`, error);
            return false;
        }
    }

    /**
     * Lädt Custom Provider Scores
     * @returns {Object} Custom Scores Object
     */
    function loadCustomScores() {
        return load(KEYS.CUSTOM_SCORES, {});
    }

    /**
     * Speichert Custom Provider Scores
     * @param {Object} scores
     * @returns {boolean}
     */
    function saveCustomScores(scores) {
        return save(KEYS.CUSTOM_SCORES, scores);
    }

    /**
     * SessionStorage: Lädt einen Wert
     * @param {string} key
     * @returns {string|null}
     */
    function sessionLoad(key) {
        try {
            return sessionStorage.getItem(key);
        } catch (error) {
            console.error(`StorageManager.sessionLoad('${key}') failed:`, error);
            return null;
        }
    }

    /**
     * SessionStorage: Speichert einen Wert
     * @param {string} key
     * @param {string} value
     * @returns {boolean}
     */
    function sessionSave(key, value) {
        try {
            sessionStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error(`StorageManager.sessionSave('${key}') failed:`, error);
            return false;
        }
    }

    /**
     * SessionStorage: Entfernt einen Wert
     * @param {string} key
     * @returns {boolean}
     */
    function sessionRemove(key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`StorageManager.sessionRemove('${key}') failed:`, error);
            return false;
        }
    }

    // Global verfügbar machen
    window.StorageManager = Object.freeze({
        KEYS,
        load,
        save,
        remove,
        loadString,
        saveString,
        loadCustomScores,
        saveCustomScores,
        sessionLoad,
        sessionSave,
        sessionRemove
    });

})();

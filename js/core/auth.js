/**
 * Authentifizierungs- und Session-Management
 *
 * @fileoverview Passwort-Validierung und Session-Handling
 * @module core/auth
 */

(function() {
    'use strict';

    /**
     * SHA-256 Hash des korrekten Passworts
     * @const {string}
     * @private
     */
    const PASSWORD_HASH = '8d3a1838c96994fdc083afd45060f5cc1f72983e6a995daca367806584d9ea15';

    /**
     * Session Storage Keys
     * @readonly
     */
    const SESSION_KEYS = Object.freeze({
        UNLOCKED: 'compassUnlocked',
        PUBLIC: 'compassPublic'
    });

    /**
     * Interner State
     * @private
     */
    let _isAuthenticated = false;

    /**
     * SHA-256 Hash-Funktion
     * @param {string} message - Zu hashender String
     * @returns {Promise<string>} Hex-encoded Hash
     */
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Prüft bestehende Session
     * @returns {{authenticated: boolean, publicMode: boolean}}
     */
    function checkSession() {
        const unlocked = sessionStorage.getItem(SESSION_KEYS.UNLOCKED);
        const isPublic = sessionStorage.getItem(SESSION_KEYS.PUBLIC);

        if (unlocked === 'true') {
            _isAuthenticated = true;
            return { authenticated: true, publicMode: false };
        } else if (isPublic === 'true') {
            _isAuthenticated = false;
            return { authenticated: false, publicMode: true };
        }

        return { authenticated: false, publicMode: false };
    }

    /**
     * Validiert eingegebenes Passwort
     * @param {string} password - Eingegebenes Passwort
     * @returns {Promise<boolean>} True wenn korrekt
     */
    async function validatePassword(password) {
        const enteredHash = await sha256(password);
        return enteredHash === PASSWORD_HASH;
    }

    /**
     * Authentifiziert mit Passwort
     * @param {string} password
     * @returns {Promise<boolean>} True wenn erfolgreich
     */
    async function authenticateWithPassword(password) {
        const isValid = await validatePassword(password);

        if (isValid) {
            sessionStorage.setItem(SESSION_KEYS.UNLOCKED, 'true');
            sessionStorage.removeItem(SESSION_KEYS.PUBLIC);
            _isAuthenticated = true;
        }

        return isValid;
    }

    /**
     * Aktiviert Public Mode (ohne Passwort)
     */
    function enablePublicMode() {
        sessionStorage.setItem(SESSION_KEYS.PUBLIC, 'true');
        sessionStorage.removeItem(SESSION_KEYS.UNLOCKED);
        _isAuthenticated = false;
    }

    /**
     * Prüft ob Benutzer authentifiziert ist (Full Access)
     * @returns {boolean}
     */
    function isAuthenticated() {
        return _isAuthenticated;
    }

    /**
     * Prüft ob Public Mode aktiv ist
     * @returns {boolean}
     */
    function isPublicMode() {
        return sessionStorage.getItem(SESSION_KEYS.PUBLIC) === 'true';
    }

    /**
     * Beendet die Session
     */
    function logout() {
        sessionStorage.removeItem(SESSION_KEYS.UNLOCKED);
        sessionStorage.removeItem(SESSION_KEYS.PUBLIC);
        _isAuthenticated = false;
    }

    // Global verfügbar machen
    window.AuthManager = Object.freeze({
        SESSION_KEYS,
        checkSession,
        validatePassword,
        authenticateWithPassword,
        enablePublicMode,
        isAuthenticated,
        isPublicMode,
        logout
    });

})();

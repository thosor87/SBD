/**
 * SCC Data Aggregator – konsolidiert die Datenmodule unter window.SCC_DATA.
 *
 * Ab Version 4.0.0 ist die ehemals monolithische providers.js in vier fokussierte
 * Module aufgeteilt:
 *   - sov-framework.js        (EU CSF / SEAL)
 *   - c3a-framework.js        (BSI C3A v1.0)
 *   - providers-base.js       (Provider-Stammdaten)
 *   - provider-assessments.js (Scores, Erklärungen, C3A, Quellen)
 *
 * Diese Datei aggregiert sie unter dem etablierten window.SCC_DATA-Namespace,
 * sodass scc-compass.js, chart.js und scc-criteria-page.js unverändert bleiben.
 *
 * @fileoverview SCC Data Aggregator
 * @module data/providers
 */

(function() {
    'use strict';

    const FRAMEWORK = window.SCC_SOV_FRAMEWORK;
    const C3A      = window.SCC_C3A;
    const SOV7     = window.SCC_SOV7;
    const BASE     = window.SCC_PROVIDERS_BASE;
    const ASSESS   = window.SCC_ASSESSMENTS;

    if (!FRAMEWORK || !C3A || !SOV7 || !BASE || !ASSESS) {
        console.error('[SCC] Datenmodule nicht vollständig geladen. Reihenfolge in HTML prüfen.');
        return;
    }

    /**
     * Audit-Mode-State (BSI C3A): 'c1' (EU-Bezug) oder 'c2' (DE-Bezug)
     * Wirkt auf alle SOV-/C3A-Berechnungen.
     */
    const AUDIT_MODE_STORAGE_KEY = 'scc-audit-mode';
    let _auditMode = 'c1';
    try {
        const stored = window.localStorage?.getItem(AUDIT_MODE_STORAGE_KEY);
        if (stored === 'c2' || stored === 'c1') _auditMode = stored;
    } catch (e) { /* localStorage nicht verfügbar */ }

    function getAuditMode() { return _auditMode; }
    function setAuditMode(mode) {
        const m = (mode === 'c2') ? 'c2' : 'c1';
        if (m === _auditMode) return false;
        _auditMode = m;
        try { window.localStorage?.setItem(AUDIT_MODE_STORAGE_KEY, m); } catch (e) {}
        return true;
    }

    /**
     * Berechnet die Provider-Liste mit Kontrolle-Score gemäß aktuellem Audit-Mode.
     * Wird bei jedem Aufruf neu gerechnet, damit ein Mode-Wechsel sofort durchschlägt.
     * @param {string} [mode] - Optional: expliziter Mode, sonst aktueller AUDIT_MODE
     * @returns {Array<Object>}
     */
    function buildProvidersWithControl(mode) {
        const auditMode = mode || _auditMode;
        return BASE.BASE_PROVIDER_DATA.map(provider => {
            const sovScores = ASSESS.computeProviderSovScores(provider.id, auditMode);
            const control = FRAMEWORK.calculateControlFromSov(sovScores);
            return Object.freeze({ ...provider, control });
        });
    }

    /**
     * Aktuelle Provider-Liste (mode-abhängig). Nicht gecacht — wird bei jedem
     * Zugriff neu berechnet, damit BASE_PROVIDERS-Konsumenten den aktuellen Mode sehen.
     */
    function getProviders() {
        return buildProvidersWithControl();
    }
    // Initiale Snapshot-Liste für Kompatibilität (im Default-Mode 'c1')
    const BASE_PROVIDERS = buildProvidersWithControl('c1');

    function getProviderById(id) {
        return BASE_PROVIDERS.find(p => p.id === id);
    }

    function getProvidersByCategory(category) {
        return BASE_PROVIDERS.filter(p => p.category === category);
    }

    function getProvidersCopy() {
        return getProviders().map(p => ({ ...p }));
    }

    /**
     * Aggregiert das C3A-Assessment eines Providers zu Score-Buckets im aktuellen Mode
     * @param {string} providerId
     * @param {string} [mode] - 'c1' (default) oder 'c2'
     * @returns {Object|null} { sov1..sov6, total } oder null
     */
    function getProviderC3AScores(providerId, mode) {
        const c3a = ASSESS.getProviderC3A(providerId);
        return c3a ? C3A.aggregateC3A(c3a, mode || _auditMode) : null;
    }

    /**
     * Liefert SOV-Scores des Providers im aktuellen (oder übergebenen) Audit-Mode
     */
    function getProviderSovScores(providerId, mode) {
        return ASSESS.computeProviderSovScores(providerId, mode || _auditMode);
    }

    /**
     * Aggregiert das SOV-7 Assessment zu einem Score (0–100)
     * @param {string} providerId
     * @returns {number|null}
     */
    function getProviderSov7Scores(providerId) {
        const sov7 = ASSESS.getProviderSov7(providerId);
        return sov7 != null ? SOV7.aggregateSov7(sov7) : null;
    }

    /**
     * @returns {Object} Konsolidierte API – kompatibel mit der v3.x-Schnittstelle
     */
    window.SCC_DATA = Object.freeze({
        // Provider-Stammdaten
        PROVIDER_CATEGORIES: BASE.PROVIDER_CATEGORIES,
        CATEGORY_COLORS:     BASE.CATEGORY_COLORS,
        CATEGORY_LABELS:     BASE.CATEGORY_LABELS,
        ANONYMOUS_PREFIXES:  BASE.ANONYMOUS_PREFIXES,
        BASE_PROVIDERS,
        LEGEND_DATA:         BASE.LEGEND_DATA,
        anonymizeProviders:  BASE.anonymizeProviders,
        getProviderById,
        getProvidersByCategory,
        getProvidersCopy,

        // EU CSF / SEAL
        SEAL_LEVELS:               FRAMEWORK.SEAL_LEVELS,
        SEAL_ZONES:                FRAMEWORK.SEAL_ZONES,
        SOV_CRITERIA:              FRAMEWORK.SOV_CRITERIA,
        SOV_WEIGHTS:               FRAMEWORK.SOV_WEIGHTS,
        getSealLevel:              FRAMEWORK.getSealLevel,
        calculateControlFromSov:   FRAMEWORK.calculateControlFromSov,

        // SOV-Bewertungen je Provider (mode-abhängig ab v4.0.0)
        PROVIDER_SOV_SCORES:       ASSESS.PROVIDER_SOV_SCORES,  // C1-Snapshot, Backwards-Compat
        PROVIDER_SOV_EXPLANATIONS: ASSESS.PROVIDER_SOV_EXPLANATIONS,
        getProviderSovScores,      // mode-abhängig
        getProviderSovExplanations: ASSESS.getProviderSovExplanations,

        // Audit-Mode (BSI C3A C1 vs. C2)
        getAuditMode,
        setAuditMode,
        getProviders,              // mode-abhängige Provider-Liste

        // Neu in v4.0.0: BSI C3A
        C3A_VERSION:           C3A.C3A_VERSION,
        C3A_PUBLISHED:         C3A.C3A_PUBLISHED,
        C3A_SOURCE:            C3A.C3A_SOURCE,
        C3A_CRITERIA:          C3A.C3A_CRITERIA,
        C3A_RESULTS:           C3A.C3A_RESULTS,
        getC3ACriteriaBySov:   C3A.getCriteriaBySov,
        getProviderC3A:        ASSESS.getProviderC3A,
        getProviderC3AScores,
        getProviderSources:    ASSESS.getProviderSources,
        getProviderAssessment: ASSESS.getProviderAssessment,

        // SOV-7 Compliance-Katalog + SOV-8 Experten-Werte (Hybrid-Control seit v4.0.0)
        SOV7_VERSION:          SOV7.SOV7_VERSION,
        SOV7_CRITERIA:         SOV7.SOV7_CRITERIA,
        SOV7_RESULT_SCORE:     SOV7.SOV7_RESULT_SCORE,
        SOV8_EXPERT_SCORES:    ASSESS.SOV8_EXPERT_SCORES,
        getProviderSov7:       ASSESS.getProviderSov7,
        getProviderSov7Scores,
        computeProviderSovScores: ASSESS.computeProviderSovScores
    });

})();

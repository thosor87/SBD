/**
 * EU Cloud Sovereignty Framework – Definitionen, Gewichte, SEAL-Levels
 *
 * Basis: EU Cloud Sovereignty Framework (Version 1.2.1, Oktober 2025).
 * Diese Datei enthält ausschließlich die Framework-Logik – keine Provider-Daten.
 *
 * @fileoverview EU CSF / SEAL Framework
 * @module data/sov-framework
 */

(function() {
    'use strict';

    /**
     * EU SEAL-Level Definitionen (Sovereignty Effective Assurance Levels)
     * @readonly
     */
    const SEAL_LEVELS = Object.freeze({
        SEAL_4: { level: 4, min: 90, label: 'Vollständige Souveränität', shortLabel: 'SEAL-4', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.08)' },
        SEAL_3: { level: 3, min: 75, label: 'Digital Resilience', shortLabel: 'SEAL-3', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.08)' },
        SEAL_2: { level: 2, min: 55, label: 'Data Sovereignty', shortLabel: 'SEAL-2', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.08)' },
        SEAL_1: { level: 1, min: 40, label: 'Basistransparenz', shortLabel: 'SEAL-1', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.08)' },
        SEAL_0: { level: 0, min: 0, label: 'Keine Souveränität', shortLabel: 'SEAL-0', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.05)' }
    });

    /**
     * SEAL-Zonen für die Chart-Visualisierung
     * @readonly
     */
    const SEAL_ZONES = Object.freeze([
        { level: 4, top: 10, height: 8, label: 'SEAL-4' },
        { level: 3, top: 18, height: 12, label: 'SEAL-3' },
        { level: 2, top: 30, height: 16, label: 'SEAL-2' },
        { level: 1, top: 46, height: 12, label: 'SEAL-1' },
        { level: 0, top: 58, height: 32, label: '' }
    ]);

    /**
     * ES³ Level Definitionen (European Sovereign Stack Standard)
     * @readonly
     */
    const ES3_LEVELS = Object.freeze({
        FUTURE_PROOF: { level: 4, id: 'future-proof', label: 'Future-Proof', shortLabel: 'ES³ Future-Proof', color: '#10b981' },
        ADVANCED:     { level: 3, id: 'advanced',     label: 'Advanced',     shortLabel: 'ES³ Advanced',     color: '#3b82f6' },
        MANAGED:      { level: 2, id: 'managed',       label: 'Managed',      shortLabel: 'ES³ Managed',      color: '#f59e0b' },
        INITIAL:      { level: 1, id: 'initial',        label: 'Initial',       shortLabel: 'ES³ Initial',      color: '#f97316' },
    });

    /**
     * Ermittelt das SEAL-Level basierend auf dem Kontrolle-Score
     * @param {number} controlScore
     * @returns {Object}
     */
    function getSealLevel(controlScore) {
        if (controlScore >= 90) return SEAL_LEVELS.SEAL_4;
        if (controlScore >= 75) return SEAL_LEVELS.SEAL_3;
        if (controlScore >= 55) return SEAL_LEVELS.SEAL_2;
        if (controlScore >= 40) return SEAL_LEVELS.SEAL_1;
        return SEAL_LEVELS.SEAL_0;
    }

    /**
     * Gewichtung der SOV-Kriterien gemäß EU Cloud Sovereignty Framework
     * @readonly
     */
    const SOV_WEIGHTS = Object.freeze({
        sov1: 0.15,
        sov2: 0.10,
        sov3: 0.10,
        sov4: 0.15,
        sov5: 0.20,
        sov6: 0.15,
        sov7: 0.10,
        sov8: 0.05
    });

    /**
     * Berechnet den Kontrolle-Score aus den SOV-Einzelwerten
     * @param {Object} sovScores
     * @returns {number}
     */
    function calculateControlFromSov(sovScores) {
        if (!sovScores) return 0;
        const totalWeight = Object.values(SOV_WEIGHTS).reduce((sum, w) => sum + w, 0);
        let weightedSum = 0;
        for (const [key, weight] of Object.entries(SOV_WEIGHTS)) {
            weightedSum += (sovScores[key] || 0) * weight;
        }
        return Math.round(weightedSum / totalWeight);
    }

    /**
     * SOV-Kriterien (Sovereignty Objectives) gemäß EU CSF
     * @readonly
     */
    const SOV_CRITERIA = Object.freeze({
        SOV1: {
            id: 'sov1', name: 'Strategische Souveränität', shortName: 'SOV-1',
            description: 'Sitz und Kontrolle der Entscheidungsorgane in der EU, Schutz vor Nicht-EU-Übernahmen',
            icon: 'fa-building-columns'
        },
        SOV2: {
            id: 'sov2', name: 'Rechtliche Souveränität', shortName: 'SOV-2',
            description: 'EU-Recht als maßgebliches Recht, Schutz vor extraterritorialen Zugriffen (CLOUD Act, FISA)',
            icon: 'fa-scale-balanced'
        },
        SOV3: {
            id: 'sov3', name: 'Daten- & KI-Souveränität', shortName: 'SOV-3',
            description: 'Kontrolle über Verschlüsselungsschlüssel (BYOK), EU-Datenresidenz, verifizierbare Löschung',
            icon: 'fa-database'
        },
        SOV4: {
            id: 'sov4', name: 'Operative Souveränität', shortName: 'SOV-4',
            description: 'Exit-Fähigkeit, EU-basierte Teams für Betrieb und Support',
            icon: 'fa-gears'
        },
        SOV5: {
            id: 'sov5', name: 'Lieferketten-Souveränität', shortName: 'SOV-5',
            description: 'Nachvollziehbarkeit von Hardware, Firmware und Code, SBOMs',
            icon: 'fa-link'
        },
        SOV6: {
            id: 'sov6', name: 'Technologie-Souveränität', shortName: 'SOV-6',
            description: 'Offene APIs, Open-Source-Komponenten, minimales Vendor Lock-in',
            icon: 'fa-code'
        },
        SOV7: {
            id: 'sov7', name: 'Sicherheits-Souveränität', shortName: 'SOV-7',
            description: 'EU-basierte Security Operations, DSGVO/NIS2-Compliance, Zertifizierungen',
            icon: 'fa-shield-halved'
        },
        SOV8: {
            id: 'sov8', name: 'Ökologische Nachhaltigkeit', shortName: 'SOV-8',
            description: 'Energieeffizienz (PUE), erneuerbare Energien, transparente Emissionsmetriken',
            icon: 'fa-leaf'
        }
    });

    window.SCC_SOV_FRAMEWORK = Object.freeze({
        SEAL_LEVELS,
        SEAL_ZONES,
        ES3_LEVELS,
        SOV_CRITERIA,
        SOV_WEIGHTS,
        getSealLevel,
        calculateControlFromSov
    });

})();

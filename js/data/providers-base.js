/**
 * Provider-Stammdaten und Kategorisierung
 *
 * Enthält ausschließlich die strukturellen Provider-Metadaten (ID, Name, Performance,
 * Kategorie, Beschreibung). SOV-Bewertungen und C3A-Assessments liegen in
 * provider-assessments.js.
 *
 * @fileoverview Cloud Provider Stammdaten
 * @module data/providers-base
 */

(function() {
    'use strict';

    /**
     * Provider-Kategorien
     * @readonly
     */
    const PROVIDER_CATEGORIES = Object.freeze({
        HYPERSCALER: 'hyperscaler',
        SOVEREIGN: 'sovereign',
        EU: 'eu',
        PRIVATE: 'private',
        HYBRID: 'hybrid'
    });

    const CATEGORY_COLORS = Object.freeze({
        [PROVIDER_CATEGORIES.HYPERSCALER]: '#ef4444',
        [PROVIDER_CATEGORIES.SOVEREIGN]: '#3b82f6',
        [PROVIDER_CATEGORIES.EU]: '#10b981',
        [PROVIDER_CATEGORIES.PRIVATE]: '#8b5cf6',
        [PROVIDER_CATEGORIES.HYBRID]: '#f59e0b'
    });

    const CATEGORY_LABELS = Object.freeze({
        [PROVIDER_CATEGORIES.HYPERSCALER]: 'Hyperscaler',
        [PROVIDER_CATEGORIES.SOVEREIGN]: 'Souveräne Clouds',
        [PROVIDER_CATEGORIES.EU]: 'EU/Deutsche Anbieter',
        [PROVIDER_CATEGORIES.PRIVATE]: 'Private Cloud',
        [PROVIDER_CATEGORIES.HYBRID]: 'Hybrid-Lösungen'
    });

    const ANONYMOUS_PREFIXES = Object.freeze({
        [PROVIDER_CATEGORIES.HYPERSCALER]: 'H',
        [PROVIDER_CATEGORIES.SOVEREIGN]: 'S',
        [PROVIDER_CATEGORIES.EU]: 'E',
        [PROVIDER_CATEGORIES.PRIVATE]: 'P',
        [PROVIDER_CATEGORIES.HYBRID]: 'Y'
    });

    /**
     * Basis-Provider-Daten (ohne control – wird aus SOV berechnet)
     * @type {Array}
     */
    const BASE_PROVIDER_DATA = [
        {
            id: 'aws',
            name: 'AWS',
            performance: 95,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.HYPERSCALER],
            category: PROVIDER_CATEGORIES.HYPERSCALER,
            groupIndex: 0,
            description: 'Umfangreichstes Portfolio an Infrastruktur- und Plattform-Services mit exzellenter Developer Experience.'
        },
        {
            id: 'microsoft-azure',
            name: 'Microsoft Azure',
            performance: 95,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.HYPERSCALER],
            category: PROVIDER_CATEGORIES.HYPERSCALER,
            groupIndex: 1,
            description: 'Leistungsfähiges Cloud-Ökosystem mit umfangreichem IaaS/PaaS-Portfolio und größter Partner-Landschaft.'
        },
        {
            id: 'google-cloud',
            name: 'Google Cloud',
            performance: 95,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.HYPERSCALER],
            category: PROVIDER_CATEGORIES.HYPERSCALER,
            groupIndex: 2,
            description: 'Überzeugend bei Container-Management, KI-Services und Workplace-Lösungen.'
        },
        {
            id: 'oracle-cloud',
            name: 'Oracle Cloud',
            performance: 70,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.HYPERSCALER],
            category: PROVIDER_CATEGORIES.HYPERSCALER,
            description: 'Besondere Stärken im Datenbank-Bereich mit umfangreichen Sicherheits- und Compliance-Möglichkeiten.'
        },
        {
            id: 'aws-european-sovereign-cloud',
            name: 'AWS European Sovereign Cloud',
            performance: 90,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.SOVEREIGN],
            category: PROVIDER_CATEGORIES.SOVEREIGN,
            description: 'Seit Januar 2026 in GA: Vollständig unabhängige EU-Cloud mit explizitem CLOUD Act-Schutz, BSI C5 und 7 ISO-Zertifizierungen bereits erreicht.'
        },
        {
            id: 'microsoft-delos-cloud',
            name: 'Microsoft DELOS Cloud',
            performance: 60,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.SOVEREIGN],
            category: PROVIDER_CATEGORIES.SOVEREIGN,
            description: 'Speziell für deutsche Verwaltung mit vollständiger Datenhoheit ohne US-Zugriffsmöglichkeiten.'
        },
        {
            id: 'oracle-eu-sovereign-cloud',
            name: 'Oracle EU Sovereign Cloud',
            performance: 70,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.SOVEREIGN],
            category: PROVIDER_CATEGORIES.SOVEREIGN,
            description: 'GA seit 2023 in Frankfurt und Madrid: in der EU registrierte Oracle-Tochter mit EU-only Personal und vertraglichem CLOUD-Act-Schutz, US-Mutter (Oracle Corp.) bleibt bestehendes Restrisiko.'
        },
        {
            id: 'stackit',
            name: 'STACKIT',
            performance: 75,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.EU],
            category: PROVIDER_CATEGORIES.EU,
            description: 'Cloud-Lösung der Schwarz Gruppe mit Fokus auf deutsche Mittelständler.'
        },
        {
            id: 'ionos-cloud',
            name: 'IONOS Cloud',
            performance: 65,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.EU],
            category: PROVIDER_CATEGORIES.EU,
            description: 'Größter deutscher Cloud-Anbieter mit DSGVO-konformer Infrastruktur.'
        },
        {
            id: 'open-telekom-cloud',
            name: 'T Cloud Public',
            performance: 55,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.EU],
            category: PROVIDER_CATEGORIES.EU,
            description: 'Deutsche Telekom Cloud (OpenStack) mit Industrial AI Cloud (NVIDIA Blackwell, größte souveräne AI-Infrastruktur Europas seit Feb 2026) – 80% Hyperscaler-Feature-Parity, 100% bis Ende 2026 angekündigt.'
        },
        {
            id: 'sap-cloud-infrastructure',
            name: 'SAP Cloud Infrastructure',
            performance: 55,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.EU],
            category: PROVIDER_CATEGORIES.EU,
            description: 'IaaS-Cloud der SAP SE auf OpenStack-Basis für hochsensible Workloads in deutschen Rechenzentren – aktuell eingeschränkt öffentlich verfügbar.'
        },
        {
            id: 'openstack-private-cloud',
            name: 'OpenStack Private Cloud',
            performance: 35,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.PRIVATE],
            category: PROVIDER_CATEGORIES.PRIVATE,
            description: 'Open-Source Private Cloud mit voller Transparenz und ohne Vendor-Lock-in.'
        },
        {
            id: 'vmware-private-cloud',
            name: 'VMware Private Cloud',
            performance: 20,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.PRIVATE],
            category: PROVIDER_CATEGORIES.PRIVATE,
            description: 'Bewährte Enterprise-Virtualisierung mit voller Kontrolle.'
        },
        {
            id: 'google-dedicated-cloud',
            name: 'Google Dedicated Cloud',
            performance: 70,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.HYBRID],
            category: PROVIDER_CATEGORIES.HYBRID,
            description: 'Air-gapped Google Distributed Cloud (Bewertung im Treuhänder-Modell, wie es im EU-Markt typisch betrieben wird — z.B. T-Systems oder S3NS/Thales als operativer Treuhänder, Schlüssel und Personal beim Treuhänder).'
        },
        {
            id: 'azure-stack-hci',
            name: 'Azure Stack HCI',
            performance: 60,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.HYBRID],
            category: PROVIDER_CATEGORIES.HYBRID,
            description: 'Hybrid-Cloud-Lösung mit Azure-Services on-premises.'
        },
        {
            id: 'aws-outpost',
            name: 'AWS Outpost',
            performance: 65,
            color: CATEGORY_COLORS[PROVIDER_CATEGORIES.HYBRID],
            category: PROVIDER_CATEGORIES.HYBRID,
            description: 'AWS-Services in Ihrem Rechenzentrum für konsistente Hybrid-Erfahrung.'
        }
    ];

    /**
     * Legenden-Daten für die UI
     * @readonly
     */
    const LEGEND_DATA = Object.freeze({
        full: [
            { color: CATEGORY_COLORS[PROVIDER_CATEGORIES.HYPERSCALER], text: '<strong>Hyperscaler</strong> (AWS, Azure, GCP, Oracle)' },
            { color: CATEGORY_COLORS[PROVIDER_CATEGORIES.SOVEREIGN], text: '<strong>Souveräne Clouds</strong> (AWS European, DELOS, Oracle EU SC)' },
            { color: CATEGORY_COLORS[PROVIDER_CATEGORIES.EU], text: '<strong>Deutsche/EU Anbieter</strong> (STACKIT, IONOS, T Cloud, SAP CI)' },
            { color: CATEGORY_COLORS[PROVIDER_CATEGORIES.PRIVATE], text: '<strong>Private Cloud</strong> (OpenStack, VMware)' },
            { color: CATEGORY_COLORS[PROVIDER_CATEGORIES.HYBRID], text: '<strong>Hybrid-Lösungen</strong> (Google Dedicated, Azure Stack HCI, AWS Outpost)' }
        ],
        anonymous: [
            { color: CATEGORY_COLORS[PROVIDER_CATEGORIES.HYPERSCALER], text: '<strong>Hyperscaler</strong> (H1, H2, H3, H4)' },
            { color: CATEGORY_COLORS[PROVIDER_CATEGORIES.SOVEREIGN], text: '<strong>Souveräne Clouds</strong> (S1, S2, S3)' },
            { color: CATEGORY_COLORS[PROVIDER_CATEGORIES.EU], text: '<strong>Deutsche/EU Anbieter</strong> (E1, E2, E3, E4)' },
            { color: CATEGORY_COLORS[PROVIDER_CATEGORIES.PRIVATE], text: '<strong>Private Cloud</strong> (P1, P2)' },
            { color: CATEGORY_COLORS[PROVIDER_CATEGORIES.HYBRID], text: '<strong>Hybrid-Lösungen</strong> (Y1, Y2, Y3)' }
        ]
    });

    /**
     * Erzeugt anonymisierte Provider-Namen (z. B. H1, S1) für Public-Mode.
     */
    function anonymizeProviders(providers) {
        return providers.map((p, i) => {
            const prefix = ANONYMOUS_PREFIXES[p.category] || '?';
            const index = providers.filter((fp, fi) => fi <= i && fp.category === p.category).length;
            return { ...p, name: `${prefix}${index}` };
        });
    }

    window.SCC_PROVIDERS_BASE = Object.freeze({
        PROVIDER_CATEGORIES,
        CATEGORY_COLORS,
        CATEGORY_LABELS,
        ANONYMOUS_PREFIXES,
        BASE_PROVIDER_DATA: Object.freeze(BASE_PROVIDER_DATA),
        LEGEND_DATA,
        anonymizeProviders
    });

})();

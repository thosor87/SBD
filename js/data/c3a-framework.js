/**
 * BSI C3A — Criteria enabling Cloud Computing Autonomy
 *
 * Operationalisierung des EU Cloud Sovereignty Framework durch das BSI.
 * Quelle: BSI-Publikation "Criteria enabling Cloud Computing Autonomy (C3A)",
 *         v1.0 vom 27.04.2026.
 * URL:    https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/CloudComputing/C3A_Cloud_Computing_Autonomy.pdf
 *
 * Struktur:
 *   - 6 Kategorien (SOV-1 bis SOV-6) – SOV-7 (Security/Compliance) und SOV-8 (Sustainability)
 *     sind in C3A bewusst nicht enthalten und werden über BSI C5:2026 / IT-Grundschutz abgedeckt.
 *   - Pro Kriterium: ID, SOV-Kategorie, Name, Beschreibung, Varianten (C1=EU, C2=DE), Additional Criteria.
 *   - Bewertung pro Provider: 'pass' | 'partial' | 'fail' | 'unknown'.
 *
 * @fileoverview BSI C3A Framework v1.0
 * @module data/c3a-framework
 */

(function() {
    'use strict';

    /**
     * C3A Bewertungs-Status (für Provider-Assessment)
     * @readonly
     */
    const C3A_RESULTS = Object.freeze({
        PASS:    { id: 'pass',    label: 'Erfüllt',          color: '#10b981', icon: 'fa-circle-check' },
        PARTIAL: { id: 'partial', label: 'Teilweise erfüllt', color: '#f59e0b', icon: 'fa-circle-half-stroke' },
        FAIL:    { id: 'fail',    label: 'Nicht erfüllt',     color: '#ef4444', icon: 'fa-circle-xmark' },
        UNKNOWN: { id: 'unknown', label: 'Unbekannt',         color: '#6b7280', icon: 'fa-circle-question' }
    });

    /**
     * Score-Mapping für aggregierte Auswertung (0-100)
     */
    const C3A_RESULT_SCORE = Object.freeze({
        pass: 100, partial: 50, fail: 0, unknown: 0
    });

    /**
     * C3A-Kriterien-Katalog
     * IDs entsprechen den BSI-Kennzeichnungen (z. B. "SOV-1-01", "SOV-4-09").
     * @readonly
     */
    const C3A_CRITERIA = Object.freeze({
        // ===== SOV-1 Strategic Sovereignty =====
        'SOV-1-01': {
            sov: 'sov1', area: 'Strategic Sovereignty', name: 'Jurisdiction',
            description: 'Cloud-Anbieter unter EU- (C1) bzw. deutscher (C2) Jurisdiktion mit Vertragsführung und Streitbeilegung.',
            variants: { C1: 'EU jurisdiction', C2: 'German jurisdiction' }
        },
        'SOV-1-02': {
            sov: 'sov1', area: 'Strategic Sovereignty', name: 'Registered Office',
            description: 'Firmensitz des Anbieters in der EU (C1) bzw. Deutschland (C2). Subunternehmer fallen unter dieselbe Anforderung.',
            variants: { C1: 'EU HQ', C2: 'German HQ' }
        },
        'SOV-1-03': {
            sov: 'sov1', area: 'Strategic Sovereignty', name: 'Effective Control',
            description: 'Effektive Kontrolle durch eine oder mehrere EU- (C1) bzw. deutsche (C2) Gesellschaften. Direkte/indirekte Einflussnahme aus Nicht-EU darf nicht möglich sein.',
            variants: { C1: 'EU control', C2: 'German control' }
        },
        'SOV-1-04': {
            sov: 'sov1', area: 'Strategic Sovereignty', name: 'Control Change',
            description: 'Cloud-Anbieter informiert Kunden 90 Tage im Voraus über Änderungen an Eigentümerstruktur, Beteiligungsverhältnissen oder Governance, die C3A-Kontrollen beeinflussen.'
        },

        // ===== SOV-2 Legal & Jurisdictional Sovereignty =====
        'SOV-2-01': {
            sov: 'sov2', area: 'Legal & Jurisdictional', name: 'Extraterritorial Exposure',
            description: 'Mindestens jährliche Identifikation aller Nicht-EU-Gesetze mit grenzüberschreitenden Auswirkungen auf Verfügbarkeit, Vertraulichkeit und Integrität, plus strukturierte Risikoanalyse.'
        },
        'SOV-2-02': {
            sov: 'sov2', area: 'Legal & Jurisdictional', name: 'Audit Rights',
            description: 'Dokumentierte Verfahren, die der zuständigen Cybersecurity-Behörde (C1: Land des RZ; C2: deutsche Bundesverwaltung) Audits zur C3A-Konformität ermöglichen.',
            variants: { C1: 'National authority audit', C2: 'German federal audit' }
        },
        'SOV-2-03': {
            sov: 'sov2', area: 'Legal & Jurisdictional', name: 'State of Defense Takeover',
            description: 'Im Verteidigungsfall ermöglicht der Anbieter dem EU-Mitgliedstaat (C1) bzw. der deutschen Bundesverwaltung (C2) die Übernahme der Cloud-Betriebsfähigkeiten inkl. physischer Assets, Personal, Quellcode und Doku.',
            variants: { C1: 'EU member state takeover', C2: 'German federal takeover' }
        },

        // ===== SOV-3 Data Sovereignty =====
        'SOV-3-01': {
            sov: 'sov3', area: 'Data Sovereignty', name: 'Data Residence',
            description: 'Kunde kann Speicher- und Verarbeitungsorte prüfen. Service-Optionen für Speicherung/Verarbeitung ausschließlich in EU (C1-C3, C5) bzw. Deutschland (C4).',
            variants: { C1: 'Customer transparency', C2: 'EU derived/account data', C3: 'EU customer data', C4: 'DE customer data', C5: 'EU provider data' },
            // SOV-3-01 hat 5 Varianten — C4 (DE customer data) ist der DE-Bezug, strenger als C2
            deVariant: 'C4'
        },
        'SOV-3-02': {
            sov: 'sov3', area: 'Data Sovereignty', name: 'External Key Management',
            description: 'Integration externer KMS für IaaS/PaaS (Basis), erweitert auf SaaS (AC). Schlüssel werden außerhalb der Cloud-Provider-Umgebung erzeugt, verwaltet und gespeichert.',
            additionalCriteria: ['SaaS-Unterstützung externer Schlüsselverwaltung']
        },
        'SOV-3-03': {
            sov: 'sov3', area: 'Data Sovereignty', name: 'External Identity Provider',
            description: 'Standardbasierte Integration externer Identity Provider, optional über offene Standards (AC1), Stateless-Authentifizierung (AC2), Authorization über dynamische Claims (AC3).',
            additionalCriteria: ['Open Standards', 'Stateless Auth', 'Dynamic Claims']
        },
        'SOV-3-04': {
            sov: 'sov3', area: 'Data Sovereignty', name: 'Logging and Monitoring',
            description: 'Kunden können Management- und Datenzugriffsereignisse aufzeichnen, behalten und prüfen, optional Real-time-API (AC1) und granulares Filtering (AC2).',
            additionalCriteria: ['Real-time Open-Source-API', 'Granulares Filtering']
        },
        'SOV-3-05': {
            sov: 'sov3', area: 'Data Sovereignty', name: 'Client-Side Encryption',
            description: 'Kunden-Daten werden vor Übertragung/Verarbeitung mit Schlüsseln verschlüsselt, die ausschließlich außerhalb der Cloud-Provider-Umgebung liegen.'
        },

        // ===== SOV-4 Operational Sovereignty =====
        'SOV-4-01': {
            sov: 'sov4', area: 'Operational Sovereignty', name: 'Operating Personnel',
            description: 'Personal mit logischem/physischem Zugriff sowie Management-Kontrolle: EU-Bürger mit EU-Hauptwohnsitz (C1) bzw. EU-Bürger mit DE-Hauptwohnsitz (C2). AC: Personal in eigenständiger europäischer Organisation.',
            variants: { C1: 'EU citizens, EU residency', C2: 'EU citizens, DE residency' },
            additionalCriteria: ['Standalone European organization']
        },
        'SOV-4-02': {
            sov: 'sov4', area: 'Operational Sovereignty', name: 'Remote Work',
            description: 'Administrativer Zugriff erfolgt aus Pfaden innerhalb EU (C1) bzw. Deutschland (C2). Zugriffe von außerhalb werden technisch eingeschränkt; Ausnahmen nur kontrolliert und überwacht.',
            variants: { C1: 'EU access paths', C2: 'DE access paths' }
        },
        'SOV-4-03': {
            sov: 'sov4', area: 'Operational Sovereignty', name: 'Redundant Connectivity',
            description: 'Redundante und unabhängige Konnektivität, mind. ein EU-Anbieter. AC: mind. ein Connectivity-Provider außerhalb der Konzernstruktur.',
            additionalCriteria: ['Connectivity outside corporate structure']
        },
        'SOV-4-04': {
            sov: 'sov4', area: 'Operational Sovereignty', name: 'SOC',
            description: 'SOC-Kapazitäten für die angebotenen Cloud-Services in EU (C1) bzw. Deutschland (C2) etabliert und betrieben. Im Disconnect-Fall muss ein eigenständiger SOC weiter funktionieren.',
            variants: { C1: 'SOC in EU', C2: 'SOC in Germany' }
        },
        'SOV-4-05': {
            sov: 'sov4', area: 'Operational Sovereignty', name: 'Ingress Data Control',
            description: 'Software-Updates und operative Daten werden in einer geschützten Netzwerkzone empfangen, autorisiert und validiert; Schwachstellen-Check (EUVD/CVE), dokumentiertes Change-Management.',
            additionalCriteria: ['Dedicated physical DMZ', 'Documentation to authority']
        },
        'SOV-4-06': {
            sov: 'sov4', area: 'Operational Sovereignty', name: 'Update Threat Analysis',
            description: 'Risikobasierte Sicherheitsanalyse vor Deployment von Drittsoftware, inklusive Detection und Mitigation für Malware, Spyware, Ransomware.'
        },
        'SOV-4-07': {
            sov: 'sov4', area: 'Operational Sovereignty', name: 'Data Exchange Monitoring',
            description: 'Datenaustausch mit Dritten wird durchgängig überwacht, kontrolliert und protokolliert. Dokumentierter Prozess, mind. jährlich aktualisiert. Verbundene Konzerngesellschaften gelten als Dritte.'
        },
        'SOV-4-08': {
            sov: 'sov4', area: 'Operational Sovereignty', name: 'Data Exchange Gateways',
            description: 'Alle Datenaustausche dokumentiert, definiert und visualisiert (Data Flow Diagram), nur über bekannte Gateways, mit Origin/Destination/Transport/Schutzmechanismen, mind. jährlich aktualisiert.',
            additionalCriteria: ['DFD an Behörde verfügbar']
        },
        'SOV-4-09': {
            sov: 'sov4', area: 'Operational Sovereignty', name: 'Disconnect',
            description: 'Cloud kann alle Nicht-EU-Verbindungen trennen, ohne Verfügbarkeit, Integrität, Authentizität oder Vertraulichkeit zu verlieren. Prozess unabhängig von Nicht-EU. Jährlicher dokumentierter Test.',
            additionalCriteria: ['Disconnect-Doku an Behörde verfügbar']
        },
        'SOV-4-10': {
            sov: 'sov4', area: 'Operational Sovereignty', name: 'Reconnect',
            description: 'Wiederherstellung der Nicht-EU-Verbindungen nach Disconnect. Update-Prozess auch für Disconnect-Dauer von bis zu 90 Tagen getestet.'
        },

        // ===== SOV-5 Supply Chain Sovereignty =====
        'SOV-5-01': {
            sov: 'sov5', area: 'Supply Chain', name: 'Software Dependencies',
            description: 'Identifikation aller Software-Komponenten und Lieferanten je Service mit Herkunftsländern. SBOM gemäß TR-03183 oder vergleichbar. AC: risikobasierter Prozess für externe Software-Abhängigkeiten und Substitutionsfähigkeit.',
            additionalCriteria: ['Risikobasierter Mitigation-Prozess']
        },
        'SOV-5-02': {
            sov: 'sov5', area: 'Supply Chain', name: 'Hardware Dependencies',
            description: 'Dokumentiertes Inventar der Hardware-Komponenten und Lieferanten mit Herkunftsländern. AC: risikobasierter Prozess inkl. architektonischer Substitutionsmöglichkeit.',
            additionalCriteria: ['Risikobasierter Mitigation-Prozess']
        },
        'SOV-5-03': {
            sov: 'sov5', area: 'Supply Chain', name: 'External Service Dependencies',
            description: 'Inventar aller funktional notwendigen externen Cloud-Services mit Land der Erbringung/Entwicklung. AC: dokumentierter Prozess für externe Service-Abhängigkeiten und Substitutionsfähigkeit.',
            additionalCriteria: ['Risikobasierter Mitigation-Prozess']
        },
        'SOV-5-04': {
            sov: 'sov5', area: 'Supply Chain', name: 'Export Restriction',
            description: 'Dokumentierte Prozesse zur Identifikation und Mitigation von Risiken durch Exportbeschränkungen oder Lieferketten-Unterbrechungen für Software, externe Services und Hardware.'
        },
        'SOV-5-05': {
            sov: 'sov5', area: 'Supply Chain', name: 'Capacity Management',
            description: 'Capacity Management gemäß BSI C5 in EU (C1) bzw. Deutschland (C2).',
            variants: { C1: 'EU capacity management', C2: 'DE capacity management' }
        },

        // ===== SOV-6 Technology Sovereignty =====
        'SOV-6-01': {
            sov: 'sov6', area: 'Technology Sovereignty', name: 'Source Code Availability',
            description: 'Backup des Quellcodes in der EU, max. 24 h alt, mind. 5 Versionen. Inkl. Infrastructure-as-Code, Build-Skripte, Deployment-Toolchains und Doku zur unabhängigen Weiterentwicklung.'
        },
        'SOV-6-02': {
            sov: 'sov6', area: 'Technology Sovereignty', name: 'Continuous Service Delivery',
            description: 'Bei Disconnect Dritter: dokumentierte Contingency-Strategien (alternative Lieferanten, interne Remediation, kompensierende Controls). AC: Eigenfähigkeit zu Vulnerability-Remediation und Patches inkl. lokaler Build-Umgebungen.',
            additionalCriteria: ['Lokale Build-Umgebung + Engineering-Talent']
        },
        'SOV-6-03': {
            sov: 'sov6', area: 'Technology Sovereignty', name: 'Software Development',
            description: 'Autorisiertes Personal hat Zugang zu Entwicklungstools/-umgebungen für Wartung und Updates; Contingency-Verfahren bei Ausfall kritischer Dev-Abhängigkeiten.'
        }
    });

    /**
     * Aggregiert eine C3A-Bewertung pro SOV-Kategorie zu einem Score (0-100)
     *
     * Audit-Mode (BSI-konform):
     *   'c1' (Default): EU-Bezug reicht — pass mit C1 oder C2 zählt voll (100).
     *   'c2': Deutscher Bezug erforderlich — bei Kriterien mit C1/C2-Varianten zählt
     *         pass nur dann voll, wenn explizit C2 erfüllt ist. C1-only wird auf
     *         partial (50) heruntergestuft, da das Kriterium den DE-Bezug nicht erfüllt.
     *
     * @param {Object} c3aAssessment - { 'SOV-1-01': { result: 'pass', variant: 'C1', ... }, ... }
     * @param {string} mode - 'c1' (default, EU) oder 'c2' (DE-Strenge)
     * @returns {Object} { sov1: 0-100, sov2: 0-100, ... sov6: 0-100, total: 0-100 }
     */
    function aggregateC3A(c3aAssessment, mode) {
        if (!c3aAssessment) return null;
        const auditMode = mode === 'c2' ? 'c2' : 'c1';
        const buckets = { sov1: [], sov2: [], sov3: [], sov4: [], sov5: [], sov6: [] };

        for (const [criterionId, assessment] of Object.entries(c3aAssessment)) {
            const meta = C3A_CRITERIA[criterionId];
            if (!meta) continue;

            let effectiveResult = assessment.result;
            // BSI-Strenge: Wenn DE-Bezug verlangt, aber Kriterium hat Varianten
            // und der Provider erfüllt nicht die DE-Variante, wird das auf partial heruntergestuft.
            // Default-DE-Variante ist 'C2'. Kriterien mit erweitertem Variant-Set (z. B. SOV-3-01
            // mit C1…C5) können `meta.deVariant` setzen, um die strengere DE-Variante zu definieren.
            if (auditMode === 'c2' && meta.variants && assessment.result === 'pass') {
                const deVariant = meta.deVariant || 'C2';
                if (assessment.variant !== deVariant) {
                    effectiveResult = 'partial';
                }
            }
            const score = C3A_RESULT_SCORE[effectiveResult] ?? 0;
            buckets[meta.sov].push(score);
        }

        const result = { total: 0 };
        let totalSum = 0, totalCount = 0;
        for (const [sov, scores] of Object.entries(buckets)) {
            if (scores.length === 0) {
                result[sov] = null;
                continue;
            }
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            result[sov] = Math.round(avg);
            totalSum += avg;
            totalCount += 1;
        }
        result.total = totalCount > 0 ? Math.round(totalSum / totalCount) : 0;
        return result;
    }

    /**
     * Liefert die C3A-Kriterien gefiltert nach SOV-Kategorie
     * @param {string} sovId - z. B. 'sov4'
     * @returns {Array<{id: string, ...}>}
     */
    function getCriteriaBySov(sovId) {
        return Object.entries(C3A_CRITERIA)
            .filter(([_, c]) => c.sov === sovId)
            .map(([id, c]) => ({ id, ...c }));
    }

    window.SCC_C3A = Object.freeze({
        C3A_RESULTS,
        C3A_RESULT_SCORE,
        C3A_CRITERIA,
        aggregateC3A,
        getCriteriaBySov,
        C3A_VERSION: '1.0',
        C3A_PUBLISHED: '2026-04-27',
        C3A_SOURCE: {
            title: 'BSI – Criteria enabling Cloud Computing Autonomy (C3A) v1.0',
            url: 'https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/CloudComputing/C3A_Cloud_Computing_Autonomy.pdf'
        }
    });

})();

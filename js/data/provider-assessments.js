/**
 * Provider-Assessments: SOV-Scores, SOV-Erklärungen, C3A-Bewertungen, Quellen
 *
 * Pro Provider:
 *   - sov:             {sov1..sov8}: 0-100, Bewertung gemäß EU CSF
 *   - sovExplanations: {sov1..sov8}: kurze Begründung
 *   - c3a:             {[criterionId]: { result, variant?, note? }}, Bewertung gemäß BSI C3A v1.0
 *   - sources:         [{title, url, retrieved?}], 2-5 belastbare Belegstellen
 *
 * Bewertungs-Status: 'pass' | 'partial' | 'fail' | 'unknown'
 * Stand: 2026-04-27 (mit C3A v1.0 vom 27.04.2026)
 *
 * @fileoverview Provider-spezifische Bewertungen
 * @module data/provider-assessments
 */

(function() {
    'use strict';

    /**
     * Hilfsfunktion: erzeugt eine C3A- oder SOV-7-Bewertung
     */
    const r = (result, note, variant) => {
        const out = { result };
        if (variant) out.variant = variant;
        if (note) out.note = note;
        return out;
    };

    /**
     * SOV-8 (Nachhaltigkeit) — Experten-Werte
     *
     * Da die Nachhaltigkeits-Dimension nicht im BSI-Mandat liegt und ein eigener
     * Kriterienkatalog für jetzigen Zweck zu viel Aufwand wäre, bleibt SOV-8
     * eine Experten-Einschätzung. Wird im UI als „Experten-Wert" gekennzeichnet.
     * @readonly
     */
    const SOV8_EXPERT_SCORES = Object.freeze({
        'aws': 60,
        'microsoft-azure': 65,
        'google-cloud': 55,
        'oracle-cloud': 50,
        'aws-european-sovereign-cloud': 70,
        'microsoft-delos-cloud': 65,
        'oracle-eu-sovereign-cloud': 60,
        'stackit': 85,
        'ionos-cloud': 75,
        'open-telekom-cloud': 76,
        'sap-cloud-infrastructure': 76,
        'openstack-private-cloud': 50,
        'vmware-private-cloud': 50,
        'google-dedicated-cloud': 60,
        'azure-stack-hci': 55,
        'aws-outpost': 55
    });

    /* ======================================================================
     * Hyperscaler – AWS, Microsoft Azure, Google Cloud, Oracle Cloud
     * Diese Provider erfüllen die strukturellen C3A-Kriterien (SOV-1, SOV-2)
     * grundsätzlich nicht: US-Mutterkonzern, CLOUD Act / FISA 702.
     * ====================================================================== */

    const ASSESSMENTS = {

        'aws': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO/IEC 27001:2022 zertifiziert'),
                'SOV-7-02': r('fail', 'Kein BSI IT-Grundschutz für US-Konzern'),
                'SOV-7-03': r('pass', 'BSI C5 Type 2 Testat'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('pass', 'ISO 27701'),
                'SOV-7-07': r('pass', 'SOC 2 Type 2'),
                'SOV-7-08': r('fail', 'US-Konzern, KRITIS nur über AWS European Sovereign Cloud'),
                'SOV-7-09': r('partial', 'NIS2-Pflichten dokumentiert, aber US-Mutter'),
                'SOV-7-10': r('fail', 'Globaler SOC, kein dedizierter EU-SOC')
            },
            sovExplanations: {
                sov1: 'US-Konzern, Entscheidungen in Seattle',
                sov2: 'Unterliegt CLOUD Act und FISA 702',
                sov3: 'EU-Regionen verfügbar, BYOK möglich',
                sov4: 'Globaler Support, keine EU-Garantie',
                sov5: 'Proprietäre Hardware, keine Transparenz',
                sov6: 'Stark proprietäre Services, hohes Lock-in',
                sov7: 'ISO 27001, SOC 2, C5-Testat',
                sov8: 'Renewable Energy Pledge, aber wenig Transparenz'
            },
            c3a: {
                'SOV-1-01': r('fail', 'US-Jurisdiktion (Delaware/Washington)'),
                'SOV-1-02': r('fail', 'HQ Seattle, US'),
                'SOV-1-03': r('fail', 'Effective Control durch Amazon.com Inc.'),
                'SOV-1-04': r('partial', 'Materielle Änderungen werden über Investor Relations kommuniziert, kein formaler 90-Tage-Prozess'),
                'SOV-2-01': r('partial', 'Transparency Reports, aber keine strukturierte Risikoanalyse je Service'),
                'SOV-2-02': r('partial', 'Audit-Rechte über AWS Artifact und Bestandsverträge, kein direkter behördlicher Audit'),
                'SOV-2-03': r('fail', 'Keine Takeover-Möglichkeit für Mitgliedstaaten'),
                'SOV-3-01': r('partial', 'EU-Regionen verfügbar, aber keine vollständige Garantie der Datenresidenz auf Provider-Daten'),
                'SOV-3-02': r('partial', 'AWS KMS External Key Store; nicht für alle Services'),
                'SOV-3-03': r('pass', 'IAM Identity Center, SAML/OIDC'),
                'SOV-3-04': r('pass', 'CloudTrail, CloudWatch'),
                'SOV-3-05': r('partial', 'Client-Side Encryption für S3 und ausgewählte Services'),
                'SOV-4-01': r('fail', 'Globales Personal, kein EU-Citizenship-Lock'),
                'SOV-4-02': r('fail', 'Globaler Admin-Zugriff'),
                'SOV-4-03': r('partial', 'Mehrere globale Connectivity-Provider, aber AWS-Konzernstruktur'),
                'SOV-4-04': r('partial', 'SOC global, AWS Security Hub als Tooling'),
                'SOV-4-05': r('pass', 'Etablierte Update- und Vulnerability-Prozesse'),
                'SOV-4-06': r('pass', 'Security Bulletins, Vulnerability Management'),
                'SOV-4-07': r('partial', 'Limitierte Transparenz zu internen Datenflüssen'),
                'SOV-4-08': r('partial', 'Whitepaper zu Datenflüssen, kein DFD pro Service'),
                'SOV-4-09': r('fail', 'Nicht entkoppelbar vom AWS-Konzernnetzwerk'),
                'SOV-4-10': r('unknown'),
                'SOV-5-01': r('partial', 'Limitierte SBOM-Veröffentlichung'),
                'SOV-5-02': r('fail', 'Proprietäre Nitro-Hardware, keine Transparenz'),
                'SOV-5-03': r('partial'),
                'SOV-5-04': r('partial', 'US-Exportkontrolle EAR'),
                'SOV-5-05': r('fail', 'Capacity-Management global'),
                'SOV-6-01': r('fail', 'Quellcode in den USA'),
                'SOV-6-02': r('partial'),
                'SOV-6-03': r('fail', 'Dev-Toolchains AWS-eigen, US-zentriert')
            },
            sources: [
                { title: 'AWS – Cloud Act Statement', url: 'https://aws.amazon.com/compliance/cloud-act/' },
                { title: 'AWS Compliance Programs', url: 'https://aws.amazon.com/compliance/programs/' },
                { title: 'AWS – EU Data Protection / GDPR Center', url: 'https://aws.amazon.com/compliance/eu-data-protection/' },
                { title: 'AWS – European Digital Sovereignty FAQ', url: 'https://aws.amazon.com/compliance/europe-digital-sovereignty/faq/' }
            ]
        },

        'microsoft-azure': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO/IEC 27001'),
                'SOV-7-02': r('fail', 'Kein BSI IT-Grundschutz'),
                'SOV-7-03': r('pass', 'BSI C5'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('pass', 'ISO 27701'),
                'SOV-7-07': r('pass', 'SOC 2 Type 2'),
                'SOV-7-08': r('fail', 'KRITIS nur über DELOS Cloud'),
                'SOV-7-09': r('partial', 'NIS2 dokumentiert, US-Mutter'),
                'SOV-7-10': r('fail', 'Globaler SOC')
            },
            sovExplanations: {
                sov1: 'US-Konzern, Entscheidungen in Redmond',
                sov2: 'Unterliegt CLOUD Act und FISA 702',
                sov3: 'EU-Regionen, BYOK und CMK verfügbar',
                sov4: 'Globaler Support, keine EU-Garantie',
                sov5: 'Proprietäre Hardware, keine Transparenz',
                sov6: 'Lock-in liegt im Ökosystem (M365, Entra, Power Platform), nicht der Runtime – .NET ist vollständig OSS',
                sov7: 'ISO 27001, SOC 2, C5-Testat',
                sov8: 'Carbon Negative Pledge 2030'
            },
            c3a: {
                'SOV-1-01': r('fail', 'US-Jurisdiktion (Washington State)'),
                'SOV-1-02': r('fail', 'HQ Redmond, US'),
                'SOV-1-03': r('fail', 'Effective Control durch Microsoft Corp.'),
                'SOV-1-04': r('partial'),
                'SOV-2-01': r('partial', 'Microsoft Law Enforcement Requests Report'),
                'SOV-2-02': r('partial'),
                'SOV-2-03': r('fail'),
                'SOV-3-01': r('partial', 'EU Data Boundary für Microsoft 365 und Azure'),
                'SOV-3-02': r('partial', 'Azure Key Vault Managed HSM, BYOK; nicht für alle SaaS'),
                'SOV-3-03': r('pass', 'Entra ID, OIDC/SAML'),
                'SOV-3-04': r('pass', 'Azure Monitor, Microsoft Sentinel'),
                'SOV-3-05': r('partial', 'Customer-Managed Keys, Confidential Computing optional'),
                'SOV-4-01': r('fail'),
                'SOV-4-02': r('fail'),
                'SOV-4-03': r('partial'),
                'SOV-4-04': r('partial', 'MSFT-eigene SOCs global'),
                'SOV-4-05': r('pass'),
                'SOV-4-06': r('pass'),
                'SOV-4-07': r('partial'),
                'SOV-4-08': r('partial'),
                'SOV-4-09': r('fail'),
                'SOV-4-10': r('unknown'),
                'SOV-5-01': r('partial'),
                'SOV-5-02': r('fail'),
                'SOV-5-03': r('partial'),
                'SOV-5-04': r('partial', 'US EAR-Restriktionen'),
                'SOV-5-05': r('fail'),
                'SOV-6-01': r('fail', 'Quellcode in den USA'),
                'SOV-6-02': r('partial'),
                'SOV-6-03': r('fail')
            },
            sources: [
                { title: 'Microsoft – Trust Center', url: 'https://www.microsoft.com/en-us/trust-center' },
                { title: 'Microsoft – CLOUD Act Customer Guidance', url: 'https://learn.microsoft.com/en-us/compliance/assurance/assurance-cloud-act' },
                { title: 'Microsoft – EU Data Boundary', url: 'https://www.microsoft.com/en-us/trust-center/privacy/eu-data-boundary' },
                { title: 'Microsoft – Compliance Offerings', url: 'https://learn.microsoft.com/en-us/compliance/regulatory/offering-home' }
            ]
        },

        'google-cloud': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO/IEC 27001'),
                'SOV-7-02': r('fail', 'Kein BSI IT-Grundschutz'),
                'SOV-7-03': r('pass', 'BSI C5'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('pass', 'ISO 27701'),
                'SOV-7-07': r('pass', 'SOC 2 Type 2'),
                'SOV-7-08': r('fail', 'KRITIS nicht abgebildet'),
                'SOV-7-09': r('partial', 'NIS2 dokumentiert, US-Mutter'),
                'SOV-7-10': r('fail', 'Globaler SOC')
            },
            sovExplanations: {
                sov1: 'US-Konzern, Entscheidungen in Mountain View',
                sov2: 'Unterliegt CLOUD Act und FISA 702',
                sov3: 'EU-Regionen, starke Verschlüsselung',
                sov4: 'Globaler Support, keine EU-Garantie',
                sov5: 'Proprietäre Hardware (TPU), wenig Transparenz',
                sov6: 'Kubernetes-Ursprung, mehr Open-Source-Fokus',
                sov7: 'ISO 27001, SOC 2, aber weniger EU-Zertifizierungen',
                sov8: 'Carbon-neutral seit 2007'
            },
            c3a: {
                'SOV-1-01': r('fail'), 'SOV-1-02': r('fail'), 'SOV-1-03': r('fail'), 'SOV-1-04': r('partial'),
                'SOV-2-01': r('partial'), 'SOV-2-02': r('partial'), 'SOV-2-03': r('fail'),
                'SOV-3-01': r('partial', 'Sovereign Controls für ausgewählte Services'),
                'SOV-3-02': r('partial', 'External Key Manager (EKM), Confidential Computing'),
                'SOV-3-03': r('pass', 'Cloud Identity, OIDC/SAML'),
                'SOV-3-04': r('pass', 'Cloud Logging, Audit Logs'),
                'SOV-3-05': r('partial'),
                'SOV-4-01': r('fail'), 'SOV-4-02': r('fail'),
                'SOV-4-03': r('partial'), 'SOV-4-04': r('partial'),
                'SOV-4-05': r('pass'), 'SOV-4-06': r('pass'),
                'SOV-4-07': r('partial'), 'SOV-4-08': r('partial'),
                'SOV-4-09': r('fail'), 'SOV-4-10': r('unknown'),
                'SOV-5-01': r('partial', 'SLSA-Framework von Google entwickelt'),
                'SOV-5-02': r('fail', 'Proprietäre TPUs'),
                'SOV-5-03': r('partial'),
                'SOV-5-04': r('partial'),
                'SOV-5-05': r('fail'),
                'SOV-6-01': r('fail'),
                'SOV-6-02': r('partial'),
                'SOV-6-03': r('fail')
            },
            sources: [
                { title: 'Google Cloud – Compliance Resource Center', url: 'https://cloud.google.com/security/compliance' },
                { title: 'Google Cloud – Sovereign Controls', url: 'https://cloud.google.com/blog/products/identity-security/announcing-sovereign-controls-by-partners' },
                { title: 'Google Cloud – Data Protection (GDPR)', url: 'https://cloud.google.com/privacy/gdpr' },
                { title: 'Google – Government Requests Transparency', url: 'https://transparencyreport.google.com/user-data/overview' }
            ]
        },

        'oracle-cloud': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO/IEC 27001'),
                'SOV-7-02': r('fail', 'Kein BSI IT-Grundschutz'),
                'SOV-7-03': r('partial', 'C5 in Teilen, nicht voll'),
                'SOV-7-04': r('partial', 'ISO 27017 partiell'),
                'SOV-7-05': r('partial', 'ISO 27018 partiell'),
                'SOV-7-06': r('partial', 'ISO 27701 partiell'),
                'SOV-7-07': r('pass', 'SOC 2 Type 2'),
                'SOV-7-08': r('fail', 'Keine KRITIS-Eignung dokumentiert'),
                'SOV-7-09': r('partial', 'NIS2-Anforderungen erkennbar adressiert'),
                'SOV-7-10': r('fail', 'Globaler SOC, US-zentriert')
            },
            sovExplanations: {
                sov1: 'US-Konzern, Entscheidungen in Austin',
                sov2: 'Unterliegt CLOUD Act und FISA',
                sov3: 'EU-Regionen, Autonomous DB Encryption',
                sov4: 'Eingeschränkter EU-Support',
                sov5: 'Stark proprietär, keine Transparenz',
                sov6: 'Sehr proprietär, starkes Lock-in',
                sov7: 'ISO 27001, SOC 2, Basis-Compliance',
                sov8: 'Begrenzte Nachhaltigkeitsinitiativen'
            },
            c3a: {
                'SOV-1-01': r('fail'), 'SOV-1-02': r('fail'), 'SOV-1-03': r('fail'), 'SOV-1-04': r('partial'),
                'SOV-2-01': r('unknown'), 'SOV-2-02': r('partial'), 'SOV-2-03': r('fail'),
                'SOV-3-01': r('partial', 'EU Sovereign Cloud (Frankfurt, Madrid) verfügbar'),
                'SOV-3-02': r('partial', 'OCI Vault, External KMS Integration begrenzt'),
                'SOV-3-03': r('pass'), 'SOV-3-04': r('pass'),
                'SOV-3-05': r('partial'),
                'SOV-4-01': r('fail'), 'SOV-4-02': r('fail'),
                'SOV-4-03': r('partial'), 'SOV-4-04': r('partial'),
                'SOV-4-05': r('pass'), 'SOV-4-06': r('pass'),
                'SOV-4-07': r('partial'), 'SOV-4-08': r('partial'),
                'SOV-4-09': r('fail'), 'SOV-4-10': r('unknown'),
                'SOV-5-01': r('partial'), 'SOV-5-02': r('fail'),
                'SOV-5-03': r('partial'), 'SOV-5-04': r('partial'),
                'SOV-5-05': r('fail'),
                'SOV-6-01': r('fail'), 'SOV-6-02': r('partial'), 'SOV-6-03': r('fail')
            },
            sources: [
                { title: 'Oracle Cloud Compliance', url: 'https://www.oracle.com/corporate/cloud-compliance/' },
                { title: 'Oracle EU Sovereign Cloud', url: 'https://www.oracle.com/cloud/eu-sovereign-cloud/' },
                { title: 'Oracle – Trust Center', url: 'https://www.oracle.com/trust/' }
            ]
        },

        /* ======================================================================
         * Souveräne Clouds – AWS European Sovereign Cloud, Microsoft DELOS Cloud
         * ====================================================================== */

        'aws-european-sovereign-cloud': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO 27001:2022 (Jan 2026)'),
                'SOV-7-02': r('partial', 'IT-Grundschutz auf Roadmap'),
                'SOV-7-03': r('pass', 'BSI C5 Type 1 (2026), Type 2 in Vorbereitung'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('pass', 'ISO 27701'),
                'SOV-7-07': r('partial', 'SOC 2 Type 1 erreicht, Type 2 in Bearbeitung'),
                'SOV-7-08': r('partial', 'Sovereign-Variante zielt darauf, KRITIS-Cert noch offen'),
                'SOV-7-09': r('pass', 'Designed for NIS2'),
                'SOV-7-10': r('pass', 'EU-SOC etabliert (Brandenburg)')
            },
            sovExplanations: {
                sov1: 'EU-Tochter mit unabhängigem Aufsichtsrat (ESC-SRF)',
                sov2: 'Expliziter CLOUD Act-Schutz, EU-Recht – kritisch: 100% Tochter von Amazon.com Inc. (US)',
                sov3: 'EU-only Keys, dezidiertes Identity-Management',
                sov4: 'EU-Personal für Betrieb und Support',
                sov5: 'AWS-Hardware, aber EU-Kontrolle',
                sov6: 'AWS-Services, proprietär',
                sov7: 'SOC 2 Type 1, BSI C5, ISO 27001/17/18/27701/22301/20000/9001 – seit Januar 2026 vollständig zertifiziert',
                sov8: 'EU-Rechenzentren, erneuerbare Energie'
            },
            c3a: {
                'SOV-1-01': r('pass', 'AWS European Sovereign Cloud GmbH unter EU-Recht', 'C1'),
                'SOV-1-02': r('pass', 'HQ Brandenburg, Deutschland', 'C2'),
                'SOV-1-03': r('partial', '100% Tochter Amazon.com Inc. (US) – Effective Control der Mutter unklar', 'C1'),
                'SOV-1-04': r('pass', 'Etablierte Governance über ESC-SRF'),
                'SOV-2-01': r('pass', 'Strukturiertes Risk-Assessment im ESC-SRF dokumentiert'),
                'SOV-2-02': r('pass', 'BSI C5 Type 1 attestiert, Audit-Rechte verfügbar', 'C1'),
                'SOV-2-03': r('partial', 'Takeover-Klauseln vertraglich, aber technische Umsetzung unklar', 'C1'),
                'SOV-3-01': r('pass', 'Daten ausschließlich in EU', 'C2'),
                'SOV-3-02': r('pass', 'External KMS für IaaS/PaaS'),
                'SOV-3-03': r('pass'),
                'SOV-3-04': r('pass', 'CloudTrail in der ESC eigenständig'),
                'SOV-3-05': r('pass'),
                'SOV-4-01': r('pass', 'EU-Bürger mit EU-Hauptwohnsitz', 'C1'),
                'SOV-4-02': r('pass', 'EU-Access-Pfade verbindlich', 'C1'),
                'SOV-4-03': r('pass'),
                'SOV-4-04': r('pass', 'EU-SOC etabliert', 'C1'),
                'SOV-4-05': r('pass'),
                'SOV-4-06': r('pass'),
                'SOV-4-07': r('pass'),
                'SOV-4-08': r('pass'),
                'SOV-4-09': r('partial', 'Disconnect technisch möglich, aber abhängig von US-Mutter-Konzern'),
                'SOV-4-10': r('partial'),
                'SOV-5-01': r('partial', 'SBOM noch nicht öffentlich vollständig'),
                'SOV-5-02': r('partial', 'AWS-Hardware aus globaler Lieferkette'),
                'SOV-5-03': r('partial'),
                'SOV-5-04': r('partial'),
                'SOV-5-05': r('pass', 'Capacity Management EU', 'C1'),
                'SOV-6-01': r('partial', 'Quellcode-Backup-Strategie EU in Ausarbeitung'),
                'SOV-6-02': r('partial'),
                'SOV-6-03': r('partial')
            },
            sources: [
                { title: 'AWS – Opening the European Sovereign Cloud (GA, Jan 2026)', url: 'https://aws.amazon.com/blogs/aws/opening-the-aws-european-sovereign-cloud/' },
                { title: 'AWS ESC – First Compliance Milestone (SOC 2, C5, 7 ISO)', url: 'https://aws.amazon.com/blogs/security/aws-european-sovereign-cloud-achieves-first-compliance-milestone-soc-2-and-c5-reports-plus-seven-iso-certifications/' },
                { title: 'AWS European Sovereign Cloud – Compliance', url: 'https://aws.eu/compliance/' },
                { title: 'AWS – European Digital Sovereignty', url: 'https://aws.amazon.com/compliance/europe-digital-sovereignty/' },
                { title: 'AWS – Built, Operated, Controlled, and Secured in Europe', url: 'https://www.aboutamazon.eu/news/aws/built-operated-controlled-and-secured-in-europe-aws-unveils-new-sovereign-controls-and-governance-structure-for-the-aws-european-sovereign-cloud' }
            ]
        },

        'oracle-eu-sovereign-cloud': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO/IEC 27001'),
                'SOV-7-02': r('fail', 'Kein BSI IT-Grundschutz'),
                'SOV-7-03': r('partial', 'BSI C5 dokumentiert, formales Testat begrenzt'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('pass', 'ISO 27701'),
                'SOV-7-07': r('pass', 'SOC 2 Type 2'),
                'SOV-7-08': r('partial', 'KRITIS-Eignung über Sovereign-Variante grundsätzlich erreichbar'),
                'SOV-7-09': r('pass', 'NIS2 designed-for'),
                'SOV-7-10': r('pass', 'EU-SOC durch Oracle EMEA')
            },
            sovExplanations: {
                sov1: 'Operiert durch Oracle EMEA Limited (Irland), aber 100% Tochter der Oracle Corp. (US) — Effective Control der Mutter unklar',
                sov2: 'EU-Recht über Oracle EMEA, vertragliche CLOUD-Act-Schutzklauseln',
                sov3: 'EU-only Daten, BYOK über Oracle Vault, External KMS in Teilen',
                sov4: 'EU-Personal vertraglich, EU-Access-Pfade dokumentiert',
                sov5: 'Oracle-Hardware aus globaler Lieferkette',
                sov6: 'Oracle-proprietäre Services, Source-Code-Backup-Strategie EU nicht öffentlich dokumentiert',
                sov7: 'ISO 27001/17/18/27701, SOC 2 Type 2, NIS2 — kein BSI C5/IT-Grundschutz dokumentiert',
                sov8: 'Oracle-Standard-Nachhaltigkeitsmaßnahmen, EU-RZs'
            },
            c3a: {
                'SOV-1-01': r('pass', 'EU-Jurisdiktion über Oracle EMEA Limited (Irland)', 'C1'),
                'SOV-1-02': r('partial', 'HQ Oracle EMEA in Irland, Mutterkonzern in Texas/USA', 'C1'),
                'SOV-1-03': r('fail', '100% Tochter Oracle Corp. (US) — Effective Control der Mutter'),
                'SOV-1-04': r('partial', 'Materielle Änderungen über Investor Relations'),
                'SOV-2-01': r('partial', 'Vertragliche CLOUD-Act-Schutzklauseln, strukturierte Risikoanalyse begrenzt'),
                'SOV-2-02': r('partial', 'Audit-Rechte über Oracle Cloud Trust', 'C1'),
                'SOV-2-03': r('fail', 'Keine dokumentierte Takeover-Möglichkeit', 'C1'),
                'SOV-3-01': r('pass', 'Daten ausschließlich in EU (Frankfurt, Madrid)', 'C2'),
                'SOV-3-02': r('partial', 'External KMS für IaaS, nicht für alle Services'),
                'SOV-3-03': r('pass', 'OCI Identity, OIDC/SAML'),
                'SOV-3-04': r('pass', 'OCI Audit Logs'),
                'SOV-3-05': r('partial'),
                'SOV-4-01': r('pass', 'EU-only Personal vertraglich, EU-Bürger', 'C1'),
                'SOV-4-02': r('pass', 'EU-Access-Pfade verbindlich', 'C1'),
                'SOV-4-03': r('pass'),
                'SOV-4-04': r('pass', 'EU-SOC durch Oracle EMEA', 'C1'),
                'SOV-4-05': r('pass'),
                'SOV-4-06': r('pass'),
                'SOV-4-07': r('partial'),
                'SOV-4-08': r('partial', 'DFD nicht öffentlich'),
                'SOV-4-09': r('partial', 'Disconnect-Strategie nicht öffentlich dokumentiert'),
                'SOV-4-10': r('partial'),
                'SOV-5-01': r('partial', 'Eingeschränkte SBOM-Veröffentlichung'),
                'SOV-5-02': r('partial', 'Oracle-Hardware aus globaler Lieferkette'),
                'SOV-5-03': r('partial'),
                'SOV-5-04': r('partial', 'US EAR-Restriktionen'),
                'SOV-5-05': r('pass', 'Capacity Management EU', 'C1'),
                'SOV-6-01': r('partial', 'Quellcode-Backup-Strategie EU nicht öffentlich'),
                'SOV-6-02': r('partial'),
                'SOV-6-03': r('partial')
            },
            sources: [
                { title: 'Oracle EU Sovereign Cloud', url: 'https://www.oracle.com/cloud/eu-sovereign-cloud/' },
                { title: 'Oracle Pressemitteilung — EU Sovereign Cloud GA (2023)', url: 'https://www.oracle.com/news/announcement/oracle-european-union-sovereign-cloud-2023-06-13/' },
                { title: 'Oracle Cloud Compliance', url: 'https://www.oracle.com/corporate/cloud-compliance/' },
                { title: 'Oracle Trust Center', url: 'https://www.oracle.com/trust/' }
            ]
        },

        'microsoft-delos-cloud': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO 27001'),
                'SOV-7-02': r('pass', 'BSI IT-Grundschutz (zertifiziert)'),
                'SOV-7-03': r('pass', 'BSI C5'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('partial', 'ISO 27701 nicht vollständig dokumentiert'),
                'SOV-7-07': r('pass', 'SOC 2 Type 2 über MS-Stack'),
                'SOV-7-08': r('pass', 'Designed für deutsche Verwaltung / KRITIS'),
                'SOV-7-09': r('pass', 'NIS2-konform'),
                'SOV-7-10': r('pass', 'SOC in Deutschland, VS-NfD-fähig')
            },
            sovExplanations: {
                sov1: 'Deutsche Treuhänderschaft (Delos Cloud GmbH, SAP-Tochter)',
                sov2: 'Kein US-Zugriff, deutsches Recht',
                sov3: 'Keys bei deutschem Treuhänder',
                sov4: 'Betrieb durch deutsche Partner (SAP/Arvato), georedundant (zwei Ops-Center DE seit Frühjahr 2026), aber kein NIST-Public-Cloud-Zugang – nur für Verwaltung, Exit außerhalb dieses Rahmens eingeschränkt',
                sov5: 'MS-Technologie, aber DE-Kontrolle',
                sov6: 'Azure-Stack, proprietär',
                sov7: 'C5, BSI-Grundschutz, VS-NfD',
                sov8: 'Deutsche RZs, Nachhaltigkeitsstandards'
            },
            c3a: {
                'SOV-1-01': r('pass', 'Delos Cloud GmbH unter deutschem Recht', 'C2'),
                'SOV-1-02': r('pass', 'HQ Deutschland', 'C2'),
                'SOV-1-03': r('pass', 'Effective Control durch SAP SE (DE)', 'C2'),
                'SOV-1-04': r('pass'),
                'SOV-2-01': r('pass', 'BSI-geprüfte Risikoanalyse'),
                'SOV-2-02': r('pass', 'BSI-Audit als Designprinzip', 'C2'),
                'SOV-2-03': r('partial', 'Vertragsbasiert, technisch teils umsetzbar', 'C2'),
                'SOV-3-01': r('pass', 'Daten ausschließlich in Deutschland', 'C4'),
                'SOV-3-02': r('pass', 'Schlüsselverwaltung beim Treuhänder'),
                'SOV-3-03': r('pass'),
                'SOV-3-04': r('pass'),
                'SOV-3-05': r('pass'),
                'SOV-4-01': r('pass', 'Personal mit DE-Hauptwohnsitz', 'C2'),
                'SOV-4-02': r('pass', 'Admin-Zugriff aus Deutschland', 'C2'),
                'SOV-4-03': r('partial'),
                'SOV-4-04': r('pass', 'SOC in Deutschland', 'C2'),
                'SOV-4-05': r('pass'),
                'SOV-4-06': r('pass'),
                'SOV-4-07': r('pass'),
                'SOV-4-08': r('pass'),
                'SOV-4-09': r('partial', 'Air-gapped Variante geplant; Updates kommen aus MS-Quellen'),
                'SOV-4-10': r('partial'),
                'SOV-5-01': r('partial', 'MS-Software ohne öffentliche SBOM'),
                'SOV-5-02': r('partial'),
                'SOV-5-03': r('partial'),
                'SOV-5-04': r('partial', 'US-Exportkontrolle für MS-Software relevant'),
                'SOV-5-05': r('pass', 'Capacity Management in Deutschland', 'C2'),
                'SOV-6-01': r('partial', 'Quellcode bei MS, nicht im Treuhänderzugriff'),
                'SOV-6-02': r('partial'),
                'SOV-6-03': r('fail', 'Dev-Tooling in MS-Hand')
            },
            sources: [
                { title: 'Delos Cloud GmbH', url: 'https://delos.cloud/' },
                { title: 'Microsoft – Erste Souveräne Cloud-Plattform für die deutsche Verwaltung (Sept 2024)', url: 'https://news.microsoft.com/de-de/erste-souveraene-cloud-plattform-fuer-die-deutsche-verwaltung-auf-der-zielgeraden/' },
                { title: 'SAP – Delos Cloud Pressemitteilung Sept 2024', url: 'https://www.sap.com/germany/documents/2024/10/5eb3f216-d97e-0010-bca6-c68f7e60039b.html' },
                { title: 'Arvato Systems – Delos Cloud', url: 'https://www.arvato-systems.com/blog/national-cloud-providers-announce-increased-cooperation' }
            ]
        },

        /* ======================================================================
         * EU/Deutsche Anbieter
         * ====================================================================== */

        'stackit': {
            es3: {
                certified: true,
                auditBody: 'BDO',
                currentLevel: 4,
                note: 'STACKIT ist der erste Provider mit ES³-Zertifizierung nach dem European Sovereign Stack Standard – auditiert von BDO.',
            },
            sov7: {
                'SOV-7-01': r('pass', 'ISO 27001 (Schwarz Digits 2024)'),
                'SOV-7-02': r('partial', 'IT-Grundschutz für Teile, nicht voll'),
                'SOV-7-03': r('pass', 'BSI C5 Type 2 (2024)'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('partial', 'ISO 27701 in Bearbeitung'),
                'SOV-7-07': r('pass', 'ISAE 3000 / SOC 2'),
                'SOV-7-08': r('pass', 'KRITIS-fähig'),
                'SOV-7-09': r('pass', 'NIS2-konform'),
                'SOV-7-10': r('pass', 'SOC in Deutschland')
            },
            sovExplanations: {
                sov1: '100% deutsche Eigentümer (Schwarz Gruppe)',
                sov2: 'Deutsches Recht, kein US-Zugriff',
                sov3: 'Vollständige Datenhoheit in DE',
                sov4: 'Deutscher Betrieb und Support',
                sov5: 'OpenStack-basiert, EU-Hardware-Fokus',
                sov6: 'OpenStack-Basis und offene APIs – Potenzial für echte Souveränität vorhanden. Bei einzelnen Managed Services (z.B. Dremio Enterprise statt Trino) bleibt dieses Potenzial noch ungenutzt',
                sov7: 'C5 Type 2, ISO 27001, ISAE 3000/3402, SOC 2',
                sov8: 'Eigene RZs, hoher Nachhaltigkeitsfokus'
            },
            c3a: {
                'SOV-1-01': r('pass', 'STACKIT GmbH & Co. KG, Heilbronn', 'C2'),
                'SOV-1-02': r('pass', 'HQ Deutschland', 'C2'),
                'SOV-1-03': r('pass', 'Schwarz Gruppe, vollständig deutsch', 'C2'),
                'SOV-1-04': r('pass'),
                'SOV-2-01': r('pass'),
                'SOV-2-02': r('pass', 'C5 Type 2 attestiert', 'C2'),
                'SOV-2-03': r('partial', 'Kein US-Mutterkonzern – State-of-Defense-Klausel auf Anfrage', 'C2'),
                'SOV-3-01': r('pass', 'Ausschließlich deutsche RZs', 'C4'),
                'SOV-3-02': r('pass', 'External KMS möglich'),
                'SOV-3-03': r('pass', 'Standardbasiert (OIDC/SAML)'),
                'SOV-3-04': r('pass', 'Audit Logs verfügbar'),
                'SOV-3-05': r('pass'),
                'SOV-4-01': r('pass', 'Personal in Deutschland', 'C2'),
                'SOV-4-02': r('pass', 'DE-Access-Pfade', 'C2'),
                'SOV-4-03': r('pass'),
                'SOV-4-04': r('pass', 'SOC in Deutschland', 'C2'),
                'SOV-4-05': r('pass'),
                'SOV-4-06': r('pass'),
                'SOV-4-07': r('pass'),
                'SOV-4-08': r('partial'),
                'SOV-4-09': r('pass', 'Disconnect-fähig, da kein Nicht-EU-Abhängigkeitsdesign'),
                'SOV-4-10': r('pass'),
                'SOV-5-01': r('partial', 'OpenStack-SBOM verfügbar, einzelne Managed Services schwächer'),
                'SOV-5-02': r('partial'),
                'SOV-5-03': r('partial'),
                'SOV-5-04': r('partial'),
                'SOV-5-05': r('pass', 'Capacity Management in Deutschland', 'C2'),
                'SOV-6-01': r('pass', 'OpenStack-Quellen verfügbar'),
                'SOV-6-02': r('pass'),
                'SOV-6-03': r('pass')
            },
            sources: [
                { title: 'STACKIT – Zertifikate', url: 'https://stackit.com/en/why-stackit/benefits/certificates' },
                { title: 'Schwarz Digits – Souveräne STACKIT Cloud (BSI C5, ISAE, SOC 2)', url: 'https://schwarz-digits.de/en/presse/archive/2024/sovereign-stackit-cloud-with-bsi-s-c5-isae-3000-soc-2-and-isae-3402-certified' },
                { title: 'Schwarz Digits – C5 Type 2 (2024)', url: 'https://schwarz-digits.de/en/presse/archive/2024/c5-type-2-certificate-stackit-receives-confirmation-of-the-highest-security-standards-for-cloud-services' },
                { title: 'STACKIT – Datensouveränität', url: 'https://stackit.com/en/why-stackit/benefits/data-sovereignty' }
            ]
        },

        'ionos-cloud': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO 27001'),
                'SOV-7-02': r('pass', 'BSI-IGZ-0543-2022 (IT-Grundschutz)'),
                'SOV-7-03': r('pass', 'BSI C5 (Compute, S3, Cubes)'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('partial', 'ISO 27701 in Vorbereitung'),
                'SOV-7-07': r('partial', 'SOC 2 in Vorbereitung'),
                'SOV-7-08': r('pass', 'KRITIS-fähig (govdigital-Cloud)'),
                'SOV-7-09': r('pass', 'NIS2-konform'),
                'SOV-7-10': r('pass', 'SOC in Deutschland')
            },
            sovExplanations: {
                sov1: 'Deutsche Eigentümer (United Internet AG, börsennotiert)',
                sov2: 'Deutsches Recht, DSGVO-nativ, kein US-Zugriff',
                sov3: 'Vollständige EU-Datenresidenz, BYOK',
                sov4: 'Deutscher Support und Betrieb',
                sov5: 'EU-Lieferanten, etablierte Partnerschaften',
                sov6: 'Standard-APIs, OpenStack-kompatibel, offene Schnittstellen',
                sov7: 'BSI C5, IT-Grundschutz (BSI-IGZ-0543-2022), ISO 27001',
                sov8: 'Deutsche RZs, Nachhaltigkeitsinitiativen'
            },
            c3a: {
                'SOV-1-01': r('pass', 'IONOS SE, Karlsruhe', 'C2'),
                'SOV-1-02': r('pass', 'HQ Deutschland', 'C2'),
                'SOV-1-03': r('pass', 'United Internet AG, börsennotiert in Deutschland', 'C2'),
                'SOV-1-04': r('pass'),
                'SOV-2-01': r('pass'),
                'SOV-2-02': r('pass', 'BSI C5, IT-Grundschutz', 'C2'),
                'SOV-2-03': r('partial', 'C2'),
                'SOV-3-01': r('pass', 'Daten in Deutschland und EU', 'C4'),
                'SOV-3-02': r('pass'),
                'SOV-3-03': r('pass'),
                'SOV-3-04': r('pass'),
                'SOV-3-05': r('pass'),
                'SOV-4-01': r('pass', 'C2'),
                'SOV-4-02': r('pass', 'C2'),
                'SOV-4-03': r('pass'),
                'SOV-4-04': r('pass', 'C2'),
                'SOV-4-05': r('pass'),
                'SOV-4-06': r('pass'),
                'SOV-4-07': r('pass'),
                'SOV-4-08': r('partial'),
                'SOV-4-09': r('pass'),
                'SOV-4-10': r('pass'),
                'SOV-5-01': r('partial'),
                'SOV-5-02': r('partial'),
                'SOV-5-03': r('partial'),
                'SOV-5-04': r('partial'),
                'SOV-5-05': r('pass', 'C2'),
                'SOV-6-01': r('pass'),
                'SOV-6-02': r('pass'),
                'SOV-6-03': r('pass')
            },
            sources: [
                { title: 'IONOS Cloud – Zertifikate', url: 'https://cloud.ionos.de/zertifikate' },
                { title: 'IONOS – BSI IT-Grundschutz Zertifikat', url: 'https://www.ionos.de/newsroom/news/ionos-erhaelt-it-grundschutz-zertifikat-vom-bundesamt-fuer-sicherheit-in-der-informationstechnik-bsi/' },
                { title: 'IONOS – C5 Certification (2023)', url: 'https://www.ionos-group.com/investor-relations/publications/announcements/ionos-receives-c5-certification-for-compute-engine-cloud-cubes-and-s3-object-storage.html' },
                { title: 'BSI – Zertifikat BSI-IGZ-0543-2022', url: 'https://www.bsi.bund.de/SharedDocs/Zertifikate_GS_ISO27001/Abgeschlossen/BSI-IGZ-0543-2022.html' }
            ]
        },

        'open-telekom-cloud': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO 27001'),
                'SOV-7-02': r('partial', 'BSI-konform, IT-Grundschutz nicht voll'),
                'SOV-7-03': r('pass', 'BSI C5 Testat'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('partial', 'ISO 27701 in Vorbereitung'),
                'SOV-7-07': r('partial', 'SOC 2 nicht vollständig'),
                'SOV-7-08': r('pass', 'KRITIS-Eignung'),
                'SOV-7-09': r('pass', 'NIS2-konform'),
                'SOV-7-10': r('pass', 'SOC in Deutschland')
            },
            sovExplanations: {
                sov1: 'Deutsche Telekom mit ~30% Staatsanteil (KfW) – struktureller Schutz vor Non-EU-Übernahmen',
                sov2: 'Deutsches Recht, DSGVO-konform, kein US-Mutterkonzern – kein CLOUD Act; T-Mobile US als Restrisiko',
                sov3: 'EU-Datenresidenz, BYOK bestätigt – Huawei-Netzzugriff als Restrisiko für Datenisolation',
                sov4: 'Telekom-Betrieb, aber Huawei L2/L3-Support',
                sov5: 'Huawei-Hardware und -Software, kritisch für Lieferkette',
                sov6: 'OpenStack-basiert, offene APIs und Standards',
                sov7: 'C5-Testat, ISO 27001, BSI-konform',
                sov8: '100% Ökostrom in deutschen Betrieben seit 2021'
            },
            c3a: {
                'SOV-1-01': r('pass', 'Deutsche Telekom AG / T-Systems', 'C2'),
                'SOV-1-02': r('pass', 'HQ Bonn', 'C2'),
                'SOV-1-03': r('pass', 'KfW-Anteil, börsennotiert in Deutschland', 'C2'),
                'SOV-1-04': r('pass'),
                'SOV-2-01': r('pass'),
                'SOV-2-02': r('pass', 'C2'),
                'SOV-2-03': r('partial', 'C2'),
                'SOV-3-01': r('pass', 'Daten in Deutschland', 'C4'),
                'SOV-3-02': r('pass', 'BYOK verfügbar'),
                'SOV-3-03': r('pass'),
                'SOV-3-04': r('pass'),
                'SOV-3-05': r('pass'),
                'SOV-4-01': r('partial', 'L2/L3-Support partiell durch Huawei', 'C2'),
                'SOV-4-02': r('partial', 'Admin-Zugriffe partiell durch Huawei', 'C2'),
                'SOV-4-03': r('pass'),
                'SOV-4-04': r('pass', 'C2'),
                'SOV-4-05': r('pass'),
                'SOV-4-06': r('pass'),
                'SOV-4-07': r('partial'),
                'SOV-4-08': r('partial'),
                'SOV-4-09': r('partial', 'Huawei-Hardware-Stack als Disconnect-Risiko'),
                'SOV-4-10': r('partial'),
                'SOV-5-01': r('partial'),
                'SOV-5-02': r('fail', 'Huawei-Hardware – kritisch nach BSI-Empfehlungen'),
                'SOV-5-03': r('partial'),
                'SOV-5-04': r('partial', 'Exportkontrolle CN/EU relevant'),
                'SOV-5-05': r('pass', 'C2'),
                'SOV-6-01': r('partial', 'OpenStack ja, aber Huawei-Patches'),
                'SOV-6-02': r('partial'),
                'SOV-6-03': r('partial')
            },
            sources: [
                { title: 'T-Systems – Industrial AI Cloud Launch (Feb 2026)', url: 'https://www.telekom.com/en/media/media-information/archive/launch-industrial-ai-cloud-with-nvidia-1098706' },
                { title: 'Deutsche Telekom – AI Sovereignty for Germany and Europe', url: 'https://www.telekom.com/en/media/media-information/archive/ai-sovereignty-for-germany-and-europe-1098708' },
                { title: 'Open Telekom Cloud – Compliance', url: 'https://www.open-telekom-cloud.com/en/security/certifications-attestations' },
                { title: 'NVIDIA Blog – Germany Industrial AI Cloud Launch', url: 'https://blogs.nvidia.com/blog/germany-industrial-ai-cloud-launch/' }
            ]
        },

        'sap-cloud-infrastructure': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO 27001 (SAP Trust Center)'),
                'SOV-7-02': r('pass', 'ISO 27001 auf IT-Grundschutz (April 2026, RZ Walldorf/St. Leon-Rot, 3 unabhängige AZ)'),
                'SOV-7-03': r('pass', 'BSI C5 Typ II'),
                'SOV-7-04': r('partial', 'ISO 27017 nicht in CI-Pressemitteilung explizit, in SAP Trust Center allgemein gelistet'),
                'SOV-7-05': r('partial', 'ISO 27018 nicht in CI-Pressemitteilung explizit, in SAP Trust Center allgemein gelistet'),
                'SOV-7-06': r('unknown', 'ISO 27701 nicht öffentlich dokumentiert'),
                'SOV-7-07': r('pass', 'SOC 1 Type 2 + SOC 2 Type 2'),
                'SOV-7-08': r('pass', 'KRITIS/NIS2, Schutzziel HOCH (lt. SAP)'),
                'SOV-7-09': r('pass', 'KRITIS/NIS2-konform'),
                'SOV-7-10': r('partial', 'BSI-zugelassene VS-NfD-Hardware verbaut, Plattform-VS-NfD-Zulassung in Bearbeitung')
            },
            sovExplanations: {
                sov1: 'SAP SE, Walldorf – börsennotiert, kein Staatsanteil',
                sov2: 'Deutsches Recht, kein US-Konzern, kein CLOUD Act',
                sov3: 'Deutsche Rechenzentren, VS-NfD-fähig – BYOK nicht bestätigt',
                sov4: 'VS-NfD-Personal, OpenStack-Exit möglich – kein Self-Service, kein öffentlicher Katalog',
                sov5: 'SAP-eigene RZs und Leitungen, OpenStack-Basis – keine öffentlichen SBOMs',
                sov6: 'OpenStack, API-first – Katalog/Preisliste nicht öffentlich, Lock-in nicht verifizierbar',
                sov7: 'ISO 27001 auf Basis IT-Grundschutz (April 2026), C5 Typ II, SOC 1/2 Typ II, KRITIS, Schutzziel HOCH, EN 50600 VK3 – VS-NfD in Bearbeitung',
                sov8: 'Eigene RZs in Deutschland, Nachhaltigkeitsstrategie als DAX-Konzern'
            },
            c3a: {
                'SOV-1-01': r('pass', 'SAP SE, Walldorf', 'C2'),
                'SOV-1-02': r('pass', 'HQ Deutschland', 'C2'),
                'SOV-1-03': r('pass', 'Börsennotiert in Deutschland', 'C2'),
                'SOV-1-04': r('pass'),
                'SOV-2-01': r('pass'),
                'SOV-2-02': r('pass', 'IT-Grundschutz / C5 Typ II', 'C2'),
                'SOV-2-03': r('partial', 'C2'),
                'SOV-3-01': r('pass', 'Walldorf, St. Leon-Rot', 'C4'),
                'SOV-3-02': r('partial', 'BYOK nicht öffentlich bestätigt'),
                'SOV-3-03': r('pass'),
                'SOV-3-04': r('pass'),
                'SOV-3-05': r('partial'),
                'SOV-4-01': r('pass', 'VS-NfD-Personal in Deutschland', 'C2'),
                'SOV-4-02': r('pass', 'C2'),
                'SOV-4-03': r('pass'),
                'SOV-4-04': r('pass', 'C2'),
                'SOV-4-05': r('pass'),
                'SOV-4-06': r('pass'),
                'SOV-4-07': r('partial'),
                'SOV-4-08': r('partial'),
                'SOV-4-09': r('pass'),
                'SOV-4-10': r('pass'),
                'SOV-5-01': r('partial', 'Keine öffentlichen SBOMs'),
                'SOV-5-02': r('partial'),
                'SOV-5-03': r('partial'),
                'SOV-5-04': r('partial'),
                'SOV-5-05': r('pass', 'C2'),
                'SOV-6-01': r('partial'),
                'SOV-6-02': r('pass'),
                'SOV-6-03': r('pass')
            },
            sources: [
                { title: 'SAP News – Cloud Infrastructure IT-Grundschutz Zertifizierung (April 2026)', url: 'https://news.sap.com/germany/2026/04/sap-cloud-infrastructure-rechenzentren-deutschland-it-grundschutz-zertifizierung/' },
                { title: 'SAP Trust Center – Zertifizierungen und Compliance', url: 'https://www.sap.com/germany/about/trust-center/certification-compliance.html' },
                { title: 'SAP News (EN) – IT-Grundschutz Certification', url: 'https://news.sap.com/2026/04/sap-cloud-infrastructure-it-grundschutz-certification-data-centers-germany/' }
            ]
        },

        /* ======================================================================
         * Private Cloud
         * ====================================================================== */

        'openstack-private-cloud': {
            sov7: {
                'SOV-7-01': r('partial', 'Abhängig vom Betreiber — kann erreicht werden'),
                'SOV-7-02': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-03': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-04': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-05': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-06': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-07': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-08': r('partial', 'Bei souveränem Betrieb erreichbar'),
                'SOV-7-09': r('partial', 'Bei NIS2-konformem Betrieb erreichbar'),
                'SOV-7-10': r('partial', 'Bei eigenem SOC erreichbar')
            },
            sovExplanations: {
                sov1: 'Vollständige eigene Kontrolle',
                sov2: 'Eigenes Recht, volle Souveränität',
                sov3: 'Volle Datenhoheit, eigene Keys',
                sov4: 'Eigener Betrieb, volle Kontrolle',
                sov5: 'Hardware-Wahl frei, Open Source',
                sov6: '100% Open Source, keine Abhängigkeit',
                sov7: 'Eigene Sicherheit, Eigenverantwortung',
                sov8: 'Abhängig von eigener Infrastruktur'
            },
            c3a: {
                'SOV-1-01': r('pass', 'Privater Betrieb durch Anwender'),
                'SOV-1-02': r('pass'), 'SOV-1-03': r('pass'), 'SOV-1-04': r('pass'),
                'SOV-2-01': r('pass'), 'SOV-2-02': r('pass'), 'SOV-2-03': r('pass'),
                'SOV-3-01': r('pass'), 'SOV-3-02': r('pass'), 'SOV-3-03': r('pass'),
                'SOV-3-04': r('pass'), 'SOV-3-05': r('pass'),
                'SOV-4-01': r('pass'), 'SOV-4-02': r('pass'), 'SOV-4-03': r('partial', 'Abhängig vom Betreiber'),
                'SOV-4-04': r('partial', 'Abhängig vom Betreiber'),
                'SOV-4-05': r('pass'), 'SOV-4-06': r('pass'), 'SOV-4-07': r('pass'),
                'SOV-4-08': r('pass'), 'SOV-4-09': r('pass'), 'SOV-4-10': r('pass'),
                'SOV-5-01': r('pass', 'OpenStack vollständig Open Source'),
                'SOV-5-02': r('partial', 'Hardware aus globaler Lieferkette'),
                'SOV-5-03': r('pass'), 'SOV-5-04': r('partial'),
                'SOV-5-05': r('pass'),
                'SOV-6-01': r('pass'), 'SOV-6-02': r('pass'), 'SOV-6-03': r('pass')
            },
            sources: [
                { title: 'OpenStack Project', url: 'https://www.openstack.org/' },
                { title: 'OpenInfra Foundation', url: 'https://openinfra.dev/' }
            ]
        },

        'vmware-private-cloud': {
            sov7: {
                'SOV-7-01': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-02': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-03': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-04': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-05': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-06': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-07': r('partial', 'Abhängig vom Betreiber'),
                'SOV-7-08': r('partial', 'Bei souveränem Betrieb erreichbar'),
                'SOV-7-09': r('partial', 'Bei NIS2-konformem Betrieb erreichbar'),
                'SOV-7-10': r('partial', 'Bei eigenem SOC erreichbar')
            },
            sovExplanations: {
                sov1: 'Vollständige eigene Kontrolle (Betreiber)',
                sov2: 'Eigenes Recht, volle Souveränität',
                sov3: 'Volle Datenhoheit, eigene Keys',
                sov4: 'Eigener Betrieb, VMware-Lizenzabhängigkeit',
                sov5: 'Broadcom-Lizenzabhängigkeit',
                sov6: 'Proprietäre VMware-Technologie',
                sov7: 'Bewährte Enterprise-Sicherheit',
                sov8: 'Abhängig von eigener Infrastruktur'
            },
            c3a: {
                'SOV-1-01': r('pass'), 'SOV-1-02': r('pass'), 'SOV-1-03': r('pass'), 'SOV-1-04': r('pass'),
                'SOV-2-01': r('pass'), 'SOV-2-02': r('pass'), 'SOV-2-03': r('pass'),
                'SOV-3-01': r('pass'), 'SOV-3-02': r('pass'), 'SOV-3-03': r('pass'),
                'SOV-3-04': r('pass'), 'SOV-3-05': r('pass'),
                'SOV-4-01': r('pass'), 'SOV-4-02': r('pass'), 'SOV-4-03': r('partial'),
                'SOV-4-04': r('partial'),
                'SOV-4-05': r('pass'), 'SOV-4-06': r('pass'), 'SOV-4-07': r('pass'),
                'SOV-4-08': r('pass'), 'SOV-4-09': r('partial', 'Lizenzaktivierung erfordert teils US-Endpoints'),
                'SOV-4-10': r('partial'),
                'SOV-5-01': r('partial'), 'SOV-5-02': r('partial'),
                'SOV-5-03': r('partial', 'Broadcom-Cloud-Services teils notwendig'),
                'SOV-5-04': r('fail', 'US-Exportkontrolle'),
                'SOV-5-05': r('pass'),
                'SOV-6-01': r('fail', 'Quellcode bei Broadcom (proprietär)'),
                'SOV-6-02': r('partial'),
                'SOV-6-03': r('fail')
            },
            sources: [
                { title: 'Broadcom – VMware Compliance', url: 'https://www.broadcom.com/company/legal/security' },
                { title: 'VMware Cloud Foundation', url: 'https://www.broadcom.com/products/vcf' }
            ]
        },

        /* ======================================================================
         * Hybrid-Lösungen
         * ====================================================================== */

        'google-dedicated-cloud': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO 27001 (vom Google-Stack geerbt)'),
                'SOV-7-02': r('partial', 'IT-Grundschutz im Treuhänder-Modell prinzipiell erreichbar'),
                'SOV-7-03': r('pass', 'BSI C5'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('partial', 'ISO 27701 partiell'),
                'SOV-7-07': r('pass', 'SOC 2'),
                'SOV-7-08': r('pass', 'Air-gapped + Treuhänder = KRITIS-fähig'),
                'SOV-7-09': r('pass', 'NIS2-konform'),
                'SOV-7-10': r('pass', 'Treuhänder betreibt SOC in DE/EU')
            },
            sovExplanations: {
                sov1: 'Treuhänder-Modell (z.B. T-Systems, S3NS): operativer Betrieb durch EU-Treuhänder, Effective Control der US-Mutter durch Vertrag eingeschränkt',
                sov2: 'Treuhänder isoliert von US-Jurisdiktion, vertraglicher CLOUD Act-Schutz',
                sov3: 'Air-gapped + Schlüssel beim Treuhänder = vollständige Datenisolation',
                sov4: 'Treuhänder-Personal in DE/EU, eigener SOC',
                sov5: 'Google-Software-Stack, EU-Hardware via Treuhänder möglich',
                sov6: 'GCP-Services proprietär, Patches durch Treuhänder validiert',
                sov7: 'BSI-konforme Compliance über Treuhänder',
                sov8: 'Google Nachhaltigkeitsstandards'
            },
            c3a: {
                'SOV-1-01': r('pass', 'Treuhänder unter EU/DE-Jurisdiktion', 'C1'),
                'SOV-1-02': r('pass', 'Treuhänder mit EU/DE-HQ', 'C1'),
                'SOV-1-03': r('partial', 'Operative Effective Control beim Treuhänder, US-Mutter (Google) bleibt Eigentümer der Software'),
                'SOV-1-04': r('partial', 'Vertragliche Notice-Pflicht, US-M&A-Risiko bleibt'),
                'SOV-2-01': r('pass', 'Treuhänder verantwortet Risikoanalyse'),
                'SOV-2-02': r('pass', 'Treuhänder ermöglicht Behörden-Audits', 'C1'),
                'SOV-2-03': r('partial', 'Vertraglich möglich über Treuhänder'),
                'SOV-3-01': r('pass', 'EU/DE-Datenresidenz', 'C4'),
                'SOV-3-02': r('pass', 'Schlüssel beim Treuhänder'),
                'SOV-3-03': r('pass'),
                'SOV-3-04': r('pass'),
                'SOV-3-05': r('pass'),
                'SOV-4-01': r('pass', 'Treuhänder-Personal in EU/DE', 'C1'),
                'SOV-4-02': r('pass', 'Admin-Zugriffe nur aus EU/DE', 'C1'),
                'SOV-4-03': r('pass'),
                'SOV-4-04': r('pass', 'Treuhänder-SOC in EU/DE', 'C1'),
                'SOV-4-05': r('pass', 'Updates durch Treuhänder validiert'),
                'SOV-4-06': r('pass'),
                'SOV-4-07': r('pass'),
                'SOV-4-08': r('pass'),
                'SOV-4-09': r('pass', 'Air-gapped per Definition'),
                'SOV-4-10': r('pass'),
                'SOV-5-01': r('partial', 'Google-Software, SBOM eingeschränkt'),
                'SOV-5-02': r('partial', 'Google-Hardware aus globaler Lieferkette'),
                'SOV-5-03': r('partial'),
                'SOV-5-04': r('partial', 'US EAR-Restriktionen'),
                'SOV-5-05': r('pass', 'Capacity Management beim Treuhänder', 'C1'),
                'SOV-6-01': r('partial', 'Source-Backup-Strategie EU im Treuhänder-Vertrag, abhängig vom Modell'),
                'SOV-6-02': r('partial', 'Patches über Treuhänder, aber Engineering-Talent bei Google'),
                'SOV-6-03': r('partial', 'Dev-Tooling bei Google, Build durch Treuhänder')
            },
            sources: [
                { title: 'Google Distributed Cloud (Air-Gapped)', url: 'https://cloud.google.com/distributed-cloud/hosted/docs' },
                { title: 'Google Cloud – Sovereign Solutions', url: 'https://cloud.google.com/sovereign-cloud' }
            ]
        },

        'azure-stack-hci': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO 27001 (Microsoft)'),
                'SOV-7-02': r('unknown', 'IT-Grundschutz beim Kunden'),
                'SOV-7-03': r('pass', 'BSI C5 (Azure-Stack)'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('unknown', 'ISO 27701 abhängig'),
                'SOV-7-07': r('pass', 'SOC 2'),
                'SOV-7-08': r('partial', 'KRITIS-Eignung mit Aufwand'),
                'SOV-7-09': r('partial', 'NIS2 erreichbar'),
                'SOV-7-10': r('unknown', 'EU-SOC abhängig vom Betreiber')
            },
            sovExplanations: {
                sov1: 'US-Konzern (Microsoft), Hardware beim Kunden',
                sov2: 'MS-Lizenz, aber lokale Daten',
                sov3: 'Lokale Daten, MS-Abhängigkeit',
                sov4: 'Eigener Betrieb möglich',
                sov5: 'MS-Software auf eigener Hardware',
                sov6: 'Proprietäres Azure-Ökosystem',
                sov7: 'Lokale Sicherheit, MS-Updates',
                sov8: 'Eigene RZ-Nachhaltigkeit'
            },
            c3a: {
                'SOV-1-01': r('fail'), 'SOV-1-02': r('fail'), 'SOV-1-03': r('fail'), 'SOV-1-04': r('partial'),
                'SOV-2-01': r('partial'), 'SOV-2-02': r('partial'), 'SOV-2-03': r('partial'),
                'SOV-3-01': r('pass', 'Daten lokal beim Kunden'),
                'SOV-3-02': r('partial'), 'SOV-3-03': r('pass'),
                'SOV-3-04': r('pass'), 'SOV-3-05': r('partial'),
                'SOV-4-01': r('partial'), 'SOV-4-02': r('partial'),
                'SOV-4-03': r('pass'), 'SOV-4-04': r('partial'),
                'SOV-4-05': r('pass'), 'SOV-4-06': r('pass'), 'SOV-4-07': r('partial'),
                'SOV-4-08': r('partial'),
                'SOV-4-09': r('partial', 'Lizenzaktivierung über Azure-Portal nötig'),
                'SOV-4-10': r('partial'),
                'SOV-5-01': r('partial'), 'SOV-5-02': r('partial'),
                'SOV-5-03': r('partial', 'Azure-Cloud-Services teils notwendig'),
                'SOV-5-04': r('partial'),
                'SOV-5-05': r('partial'),
                'SOV-6-01': r('fail'), 'SOV-6-02': r('partial'), 'SOV-6-03': r('fail')
            },
            sources: [
                { title: 'Microsoft – Azure Local (Stack HCI)', url: 'https://learn.microsoft.com/en-us/azure/azure-local/' },
                { title: 'Microsoft Trust Center', url: 'https://www.microsoft.com/en-us/trust-center' }
            ]
        },

        'aws-outpost': {
            sov7: {
                'SOV-7-01': r('pass', 'ISO 27001 (von AWS)'),
                'SOV-7-02': r('unknown', 'IT-Grundschutz beim Kunden'),
                'SOV-7-03': r('pass', 'BSI C5'),
                'SOV-7-04': r('pass', 'ISO 27017'),
                'SOV-7-05': r('pass', 'ISO 27018'),
                'SOV-7-06': r('pass', 'ISO 27701'),
                'SOV-7-07': r('pass', 'SOC 2'),
                'SOV-7-08': r('fail', 'AWS-Lieferkette mit US-Mutter'),
                'SOV-7-09': r('partial', 'NIS2 dokumentiert'),
                'SOV-7-10': r('fail', 'AWS-managed remote, kein lokaler SOC')
            },
            sovExplanations: {
                sov1: 'US-Konzern, AWS-Hardware beim Kunden',
                sov2: 'AWS-Lizenz, CLOUD Act gilt',
                sov3: 'Lokale Daten, aber AWS-Kontrolle',
                sov4: 'AWS-Management, Remote-Zugriff',
                sov5: 'AWS-Hardware, keine Transparenz',
                sov6: 'Proprietäre AWS-Services',
                sov7: 'AWS-Sicherheitsstandards lokal',
                sov8: 'Eigene RZ-Nachhaltigkeit'
            },
            c3a: {
                'SOV-1-01': r('fail'), 'SOV-1-02': r('fail'), 'SOV-1-03': r('fail'), 'SOV-1-04': r('partial'),
                'SOV-2-01': r('partial'), 'SOV-2-02': r('partial'), 'SOV-2-03': r('fail'),
                'SOV-3-01': r('partial', 'Daten lokal, aber Control Plane in AWS-Region'),
                'SOV-3-02': r('partial'), 'SOV-3-03': r('pass'),
                'SOV-3-04': r('pass'), 'SOV-3-05': r('partial'),
                'SOV-4-01': r('fail'), 'SOV-4-02': r('fail'),
                'SOV-4-03': r('partial'), 'SOV-4-04': r('partial'),
                'SOV-4-05': r('pass'), 'SOV-4-06': r('pass'), 'SOV-4-07': r('partial'),
                'SOV-4-08': r('partial'),
                'SOV-4-09': r('fail', 'Outpost benötigt persistente Verbindung zur AWS-Region'),
                'SOV-4-10': r('fail'),
                'SOV-5-01': r('partial'), 'SOV-5-02': r('fail'),
                'SOV-5-03': r('fail', 'AWS-Region als externe Service-Abhängigkeit'),
                'SOV-5-04': r('partial'),
                'SOV-5-05': r('fail'),
                'SOV-6-01': r('fail'), 'SOV-6-02': r('fail'), 'SOV-6-03': r('fail')
            },
            sources: [
                { title: 'AWS Outposts', url: 'https://aws.amazon.com/outposts/' },
                { title: 'AWS Outposts FAQ', url: 'https://aws.amazon.com/outposts/faqs/' }
            ]
        }
    };

    // Provider-SOV-Scores werden dynamisch berechnet.
    //   sov1..sov6  ← BSI C3A Aggregate (mode-abhängig: c1 oder c2)
    //   sov7        ← SOV-7 Compliance-Aggregate (mode-unabhängig)
    //   sov8        ← Experten-Wert (mode-unabhängig)
    function computeProviderSovScores(providerId, mode) {
        const a = ASSESSMENTS[providerId];
        if (!a) return null;
        const c3aAgg = window.SCC_C3A?.aggregateC3A(a.c3a, mode);
        const sov7   = window.SCC_SOV7?.aggregateSov7(a.sov7);
        const sov8   = SOV8_EXPERT_SCORES[providerId] ?? 50;
        if (!c3aAgg || sov7 == null) return null;
        return {
            sov1: c3aAgg.sov1, sov2: c3aAgg.sov2, sov3: c3aAgg.sov3,
            sov4: c3aAgg.sov4, sov5: c3aAgg.sov5, sov6: c3aAgg.sov6,
            sov7, sov8
        };
    }

    // Vorgerechnete C1-Scores (Default) als rückwärtskompatibles Snapshot.
    // C2-Werte werden bei Bedarf via computeProviderSovScores(id, 'c2') berechnet.
    const PROVIDER_SOV_SCORES = Object.freeze(
        Object.fromEntries(
            Object.keys(ASSESSMENTS).map(id => [id, computeProviderSovScores(id, 'c1')])
        )
    );
    const PROVIDER_SOV_EXPLANATIONS = Object.fromEntries(
        Object.entries(ASSESSMENTS).map(([id, a]) => [id, a.sovExplanations])
    );

    function getProviderAssessment(id) { return ASSESSMENTS[id] || null; }
    function getProviderSovScores(id)  { return PROVIDER_SOV_SCORES[id] || null; }
    function getProviderSovExplanations(id) { return PROVIDER_SOV_EXPLANATIONS[id] || null; }
    function getProviderC3A(id)        { return ASSESSMENTS[id]?.c3a || null; }
    function getProviderSov7(id)       { return ASSESSMENTS[id]?.sov7 || null; }
    function getProviderSources(id)    { return ASSESSMENTS[id]?.sources || []; }
    function getProviderES3(providerId) { return ASSESSMENTS[providerId]?.es3 ?? null; }

    window.SCC_ASSESSMENTS = Object.freeze({
        ASSESSMENTS: Object.freeze(ASSESSMENTS),
        PROVIDER_SOV_SCORES,
        PROVIDER_SOV_EXPLANATIONS: Object.freeze(PROVIDER_SOV_EXPLANATIONS),
        SOV8_EXPERT_SCORES,
        computeProviderSovScores,
        getProviderAssessment,
        getProviderSovScores,
        getProviderSovExplanations,
        getProviderC3A,
        getProviderSov7,
        getProviderSources,
        getProviderES3
    });

})();

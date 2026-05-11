# SCC v4.0.0 — Hybrid Control: C3A für SOV-1…6, Compliance-Katalog für SOV-7, Experten für SOV-8

> **For agentic workers:** Inline execution by primary agent in Auto Mode. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den `Kontrolle`-Score (und damit das SEAL-Level) auditierbar aus den BSI-C3A-Bewertungen für SOV-1…6 und einem neu eingeführten Compliance-Kriterien-Katalog für SOV-7 berechnen — statt aus subjektiven Experten-Schätzungen. SOV-8 (Nachhaltigkeit) bleibt Experten-Wert.

**Architecture:**
- Bestehende `PROVIDER_SOV_SCORES` (Experten-Schätzungen) werden durch eine **berechnete** Variante ersetzt:
  - `sov1`…`sov6` aus `aggregateC3A()` (vorhanden, in `c3a-framework.js`)
  - `sov7` aus neuem **C5-Plus-Katalog** (10 Compliance-Kriterien analog C3A: pass/partial/fail/unknown)
  - `sov8` aus separatem `SOV8_EXPERT_SCORES`-Mapping (kompakt extrahiert aus den heutigen Werten)
- Gewichtung bleibt EU-CSF (0.15/0.10/0.10/0.15/0.20/0.15/0.10/0.05), `getControlScore(provider)` aggregiert wie bisher.
- Datenmodell-Refactor: aus `provider-assessments.js` werden die statisch eingebrannten SOV-Werte entfernt; sie werden bei `window.SCC_DATA`-Init dynamisch berechnet.
- UI: keine Änderung nötig, weil `Kontrolle` weiterhin `0–100` liefert und das SEAL-Level wie bisher abgeleitet wird. **Ein neues Mini-Audit-Logo** im Tooltip macht aber transparent, dass die Bewertung jetzt belegbar ist.

**Tech Stack:** Vanilla JS (no-build, IIFE-Pattern), HTML5, CSS3 (Bestand)

**Versionierung:** v4.0.0 → **v4.0.0** (Major-Bump, weil sich die Berechnungs-Methodik des Kontrolle-Scores fundamental ändert.

---

## Methodische Festlegungen

### SOV-7 Compliance-Katalog (NEU)

Analog zur C3A-Struktur, 10 prüfbare Kriterien mit `pass | partial | fail | unknown`:

| ID | Name | Kriterium (kurz) |
|---|---|---|
| `SOV-7-01` | ISO/IEC 27001 | Allgemeine ISMS-Zertifizierung vorhanden und gültig |
| `SOV-7-02` | ISO 27001 auf IT-Grundschutz | Zertifizierung nach BSI-Standard 200-x für die relevanten RZ |
| `SOV-7-03` | BSI C5 (Type 1 oder 2) | Aktuelles BSI-C5-Testat verfügbar |
| `SOV-7-04` | ISO/IEC 27017 | Cloud-spezifische Kontrollen zertifiziert |
| `SOV-7-05` | ISO/IEC 27018 | Datenschutz in Public Cloud zertifiziert |
| `SOV-7-06` | ISO/IEC 27701 | PIMS (Privacy Information Management) zertifiziert |
| `SOV-7-07` | SOC 2 Type 2 | SOC-2-Type-2-Bericht vorhanden |
| `SOV-7-08` | KRITIS-Fähigkeit | Anbieter ist als KRITIS-fähig nachgewiesen |
| `SOV-7-09` | NIS2-Konformität | Pflichten der NIS2-Richtlinie nachweisbar erfüllt |
| `SOV-7-10` | EU-SOC / VS-NfD | SOC innerhalb EU/DE etabliert; VS-NfD optional erreicht |

Aggregation: identisch zu C3A (pass=100, partial=50, fail/unknown=0; gemittelt).

### SOV-8 (Nachhaltigkeit) — Experten

Bleibt als statische `SOV8_EXPERT_SCORES`-Map mit den heutigen Werten. SOV-8 ist nicht im BSI-Mandat und ein Kriterienkatalog würde für den jetzigen Zweck zu viel Aufwand bedeuten. Wird im UI als „Experten-Einschätzung" gekennzeichnet.

### SOV-1…6 (Kontrolle-Komponenten)

Werden ab v4.0.0 nur noch aus dem `aggregateC3A()`-Output gelesen — die alten Experten-Werte für `sov1`…`sov6` werden vollständig durch die C3A-Aggregate ersetzt.

---

## File Structure

| Datei | Wozu |
|---|---|
| `js/data/sov7-compliance.js` (**neu**) | Katalog der 10 SOV-7-Kriterien + `aggregateSov7()` |
| `js/data/provider-assessments.js` (modifiziert) | `sov`-Block je Provider wird zu `sov8` (nur SOV-8 Wert) + `sov7Assessment` (10 Kriterien) statt komplettes `sov`-Objekt. Quellen je SOV-7-Bewertung möglich. |
| `js/data/providers.js` (modifiziert) | `buildProvidersWithControl()` ruft die neue zentrale `computeProviderSovScores(id)`-Funktion, die die finalen 8 SOV-Werte aus C3A/SOV-7/SOV-8 zusammensetzt. |
| `js/data/sov-framework.js` (unverändert) | Gewichte und `calculateControlFromSov()` bleiben |
| `evaluation-criteria.html` (modifiziert) | Neue Erklär-Sektion „SOV-7 Compliance-Katalog" zwischen BSI-C3A-Sektion und Provider-Details |
| `CHANGELOG.md` | v4.0.0-Eintrag |
| `index.html`, `evaluation-criteria.html` | Versionsstring 4.0.0 → 5.0.0 (3 Stellen) |
| `js/scc-compass.js`, `scc-criteria-page.js` | Tooltip-Quellen-Badge ergänzen: „belegbar" für SOV-1…7, „Experten-Wert" für SOV-8 |
| `demos/v4-matrix-prototypes/demo-2-star-field.html` | Demo nutzt die neuen Werte (keine logischen Änderungen, nur Daten-Update) |

---

## Task 1: SOV-7 Compliance-Katalog-Modul

**Files:**
- Create: `js/data/sov7-compliance.js`

- [ ] **Step 1: Modul anlegen**

```js
/**
 * SOV-7 Sicherheits-Compliance — Kriterien-Katalog
 *
 * Operationalisiert die SOV-7-Kategorie des EU CSF analog zum BSI C3A:
 * 10 prüfbare Kriterien mit pass/partial/fail/unknown.
 *
 * @fileoverview SOV-7 Compliance Framework
 * @module data/sov7-compliance
 */

(function() {
    'use strict';

    const SOV7_CRITERIA = Object.freeze({
        'SOV-7-01': { name: 'ISO/IEC 27001', description: 'Aktuelle ISMS-Zertifizierung nach ISO/IEC 27001:2022 für die für den Cloud-Service relevanten Standorte und Prozesse.' },
        'SOV-7-02': { name: 'ISO 27001 auf IT-Grundschutz', description: 'Zertifizierung nach BSI-Standard 200-2/200-3 (IT-Grundschutz) für die relevanten Rechenzentren.' },
        'SOV-7-03': { name: 'BSI C5', description: 'Gültiges Testat nach BSI C5:2020 oder C5:2026 (Type 1 oder Type 2).' },
        'SOV-7-04': { name: 'ISO/IEC 27017', description: 'Cloud-spezifische Sicherheitskontrollen zertifiziert.' },
        'SOV-7-05': { name: 'ISO/IEC 27018', description: 'Datenschutz für PII in Public Cloud zertifiziert.' },
        'SOV-7-06': { name: 'ISO/IEC 27701', description: 'PIMS (Privacy Information Management System) zertifiziert.' },
        'SOV-7-07': { name: 'SOC 2 Type 2', description: 'Aktueller SOC 2 Type 2 Bericht zu mindestens Security/Availability/Confidentiality.' },
        'SOV-7-08': { name: 'KRITIS-Fähigkeit', description: 'Provider als KRITIS-fähig referenziert oder explizit für KRITIS-Workloads beworben/eingesetzt.' },
        'SOV-7-09': { name: 'NIS2-Konformität', description: 'Nachweisbare Erfüllung der erweiterten NIS2-Pflichten (Risk Management, Incident-Reporting).' },
        'SOV-7-10': { name: 'EU-SOC / VS-NfD', description: 'Security Operations Center innerhalb EU/DE etabliert; VS-NfD-Eignung optional zusätzlich.' }
    });

    const SOV7_RESULT_SCORE = Object.freeze({
        pass: 100, partial: 50, fail: 0, unknown: 0
    });

    function aggregateSov7(assessment) {
        if (!assessment) return 0;
        const ids = Object.keys(SOV7_CRITERIA);
        const scores = ids.map(id => SOV7_RESULT_SCORE[assessment[id]?.result] ?? 0);
        return Math.round(scores.reduce((a,b) => a+b, 0) / ids.length);
    }

    window.SCC_SOV7 = Object.freeze({
        SOV7_CRITERIA,
        SOV7_RESULT_SCORE,
        aggregateSov7,
        SOV7_VERSION: '1.0',
        SOV7_PUBLISHED: '2026-04-27'
    });
})();
```

- [ ] **Step 2: Kein Test-Skript** — wir verifizieren via Smoke-Test in Task 7.

---

## Task 2: SOV-7 Bewertungen je Provider in `provider-assessments.js`

**Files:**
- Modify: `js/data/provider-assessments.js`

Für jeden der 15 Provider eine `sov7`-Bewertung der 10 Kriterien hinterlegen, abgeleitet aus den bereits dokumentierten Zertifizierungen in `sovExplanations.sov7` und den heutigen Quellen.

**Methodik der Ableitung (Copy-Paste-Heuristik):**
- Wenn Zertifikat in den heutigen `sovExplanations.sov7`-Strings genannt → `pass`
- Wenn „in Bearbeitung", „Type 1 statt Type 2" → `partial`
- Wenn Zertifikat nicht erwähnt aber Provider-Profil naheliegend (z. B. EU-Anbieter ohne SOC 2 Type 2 explizit) → `unknown`
- Wenn explizit nicht möglich (z. B. KRITIS für Hyperscaler ohne Sovereign-Variante) → `fail`

- [ ] **Step 1: Konstante `SOV8_EXPERT_SCORES` ganz oben in `provider-assessments.js` einfügen** (nach `'use strict';`):

```js
const SOV8_EXPERT_SCORES = {
    'aws': 60, 'microsoft-azure': 65, 'google-cloud': 55, 'oracle-cloud': 50,
    'aws-european-sovereign-cloud': 70, 'microsoft-delos-cloud': 65,
    'stackit': 85, 'ionos-cloud': 75, 'open-telekom-cloud': 76,
    'sap-cloud-infrastructure': 76, 'openstack-private-cloud': 50,
    'vmware-private-cloud': 50, 'google-dedicated-cloud': 60,
    'azure-stack-hci': 55, 'aws-outpost': 55
};
```

- [ ] **Step 2: SOV-7-Bewertungen pro Provider eintragen.** In jedem Provider-Block den ehemaligen `sov.sov7`-Wert ersetzen durch `sov7: { ... }` mit den 10 Kriterien-Bewertungen. Vollständige Liste der 15 Bewertungs-Tabellen (ich liefere sie inline beim Implementieren — siehe Step-by-Step im Skript).

  **Beispiel-Snippet `stackit`:**
  ```js
  sov7: {
      'SOV-7-01': r('pass', 'ISO 27001 zertifiziert (Schwarz Digits 2024)'),
      'SOV-7-02': r('partial', 'IT-Grundschutz für Teile, nicht vollständig'),
      'SOV-7-03': r('pass', 'BSI C5 Type 2 (2024)'),
      'SOV-7-04': r('pass', 'ISO 27017'),
      'SOV-7-05': r('pass', 'ISO 27018'),
      'SOV-7-06': r('partial', 'ISO 27701 in Bearbeitung'),
      'SOV-7-07': r('pass', 'ISAE 3000 / SOC 2'),
      'SOV-7-08': r('pass', 'KRITIS-fähig'),
      'SOV-7-09': r('pass'),
      'SOV-7-10': r('pass', 'SOC in Deutschland')
  },
  ```

- [ ] **Step 3: `sov`-Block aus jedem Provider entfernen** (sov1…sov6 sowie sov7 und sov8 raus — diese werden ab v4.0.0 dynamisch aus C3A/SOV-7/SOV-8 berechnet). Stattdessen die `sov7`-Bewertung neu eintragen wie in Step 2.

- [ ] **Step 4: PROVIDER_SOV_SCORES nicht mehr aus `sov`-Block ableiten.** Stattdessen:

```js
function computeProviderSovScores(providerId) {
    const a = ASSESSMENTS[providerId];
    if (!a) return null;
    const c3aAgg = window.SCC_C3A.aggregateC3A(a.c3a);
    const sov7   = window.SCC_SOV7.aggregateSov7(a.sov7);
    const sov8   = SOV8_EXPERT_SCORES[providerId] ?? 50;
    return {
        sov1: c3aAgg.sov1, sov2: c3aAgg.sov2, sov3: c3aAgg.sov3,
        sov4: c3aAgg.sov4, sov5: c3aAgg.sov5, sov6: c3aAgg.sov6,
        sov7, sov8
    };
}

const PROVIDER_SOV_SCORES = Object.freeze(
    Object.fromEntries(
        Object.keys(ASSESSMENTS).map(id => [id, computeProviderSovScores(id)])
    )
);
```

- [ ] **Step 5: Export erweitern.**

```js
window.SCC_ASSESSMENTS = Object.freeze({
    ASSESSMENTS: Object.freeze(ASSESSMENTS),
    PROVIDER_SOV_SCORES,
    PROVIDER_SOV_EXPLANATIONS: Object.freeze(PROVIDER_SOV_EXPLANATIONS),
    SOV8_EXPERT_SCORES: Object.freeze(SOV8_EXPERT_SCORES),
    computeProviderSovScores,
    getProviderAssessment,
    getProviderSovScores,
    getProviderSovExplanations,
    getProviderC3A,
    getProviderSov7: (id) => ASSESSMENTS[id]?.sov7 || null,
    getProviderSources
});
```

---

## Task 3: Aggregator-Layer aktualisieren

**Files:**
- Modify: `js/data/providers.js`

- [ ] **Step 1: `getProviderSov7Scores(id)`-Helfer in den Aggregator aufnehmen.**

```js
function getProviderSov7Scores(providerId) {
    const a7 = ASSESS.getProviderSov7(providerId);
    return a7 ? window.SCC_C3A.aggregateC3A : null; // wird in Task 4 finalisiert
}
```

(Endgültige Form siehe Task 4 unten — wir nutzen `aggregateSov7` aus `SCC_SOV7`.)

- [ ] **Step 2: SCC_SOV7 in den Aggregator-Check einbauen.**

```js
const FRAMEWORK = window.SCC_SOV_FRAMEWORK;
const C3A      = window.SCC_C3A;
const SOV7     = window.SCC_SOV7;
const BASE     = window.SCC_PROVIDERS_BASE;
const ASSESS   = window.SCC_ASSESSMENTS;

if (!FRAMEWORK || !C3A || !SOV7 || !BASE || !ASSESS) {
    console.error('[SCC] Datenmodule nicht vollständig geladen.');
    return;
}
```

- [ ] **Step 3: `getProviderSov7Scores(id)` final.**

```js
function getProviderSov7Scores(providerId) {
    const a7 = ASSESS.getProviderSov7(providerId);
    return a7 ? SOV7.aggregateSov7(a7) : null;
}
```

- [ ] **Step 4: Export erweitern.**

```js
window.SCC_DATA = Object.freeze({
    ...
    SOV7_CRITERIA:           SOV7.SOV7_CRITERIA,
    SOV7_VERSION:            SOV7.SOV7_VERSION,
    getProviderSov7:         ASSESS.getProviderSov7,
    getProviderSov7Scores,
    getProviderC3AScores,    // bleibt
    SOV8_EXPERT_SCORES:      ASSESS.SOV8_EXPERT_SCORES,
    ...
});
```

---

## Task 4: Script-Loading in HTML aktualisieren

**Files:**
- Modify: `index.html`
- Modify: `evaluation-criteria.html`

- [ ] **Step 1:** In beiden HTMLs das neue Modul vor `provider-assessments.js` laden:

```html
<script src="js/data/sov-framework.js"></script>
<script src="js/data/c3a-framework.js"></script>
<script src="js/data/sov7-compliance.js"></script>   <!-- NEU -->
<script src="js/data/providers-base.js"></script>
<script src="js/data/provider-assessments.js"></script>
<script src="js/data/providers.js"></script>
```

- [ ] **Step 2:** Versions-Strings 4.0.0 → 5.0.0 (3 Vorkommen: 2× in `index.html`, 1× in `evaluation-criteria.html`).

---

## Task 5: SOV-7-Erklär-Sektion in evaluation-criteria.html

**Files:**
- Modify: `evaluation-criteria.html`

- [ ] **Step 1:** Direkt nach der bestehenden BSI-C3A-Sektion einen neuen Block einfügen:

```html
<section id="sov7" class="criteria-section">
    <h2 class="section-title">
        <i class="fa-solid fa-shield-alt"></i> SOV-7 Sicherheits-Compliance
    </h2>
    <div class="criteria-card">
        <div class="criteria-intro">
            <p>
                Da BSI C3A die SOV-7-Kategorie (Sicherheit/Compliance) explizit nicht abdeckt,
                ergänzt der SCC ab Version 5.0.0 einen eigenen <strong>10-Punkte-Compliance-Katalog</strong>
                analog zur C3A-Struktur. Pro Provider werden die 10 Kriterien mit
                <strong>erfüllt / teilweise / nicht erfüllt / unbekannt</strong> bewertet.
            </p>
            <p>
                Die Kriterien orientieren sich an den marktrelevanten Zertifizierungen:
                ISO/IEC 27001, IT-Grundschutz, BSI C5, ISO 27017/27018/27701, SOC 2 Type 2,
                KRITIS, NIS2 und EU-basierter SOC.
            </p>
        </div>
    </div>
</section>
```

- [ ] **Step 2:** Drawer-, Desktop- und Mobile-Navigation um „SOV-7" erweitern (genau analog zum C3A-Eintrag in v4.0.0).

---

## Task 6: CHANGELOG.md v4.0.0-Eintrag

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1:** Eintrag direkt unter `# Changelog` Header einfügen:

```markdown
## [5.0.0] - 2026-04-27

### Changed (BREAKING)
- **Kontrolle-Score-Berechnung umgestellt** auf Hybrid-Methodik:
  - SOV-1…6 werden ab sofort aus den BSI-C3A-Bewertungen aggregiert (vorher Experten-Schätzungen).
  - SOV-7 (Sicherheit) wird aus einem neuen 10-Punkte-Compliance-Katalog berechnet (`SOV7_CRITERIA`, analog C3A-Struktur).
  - SOV-8 (Nachhaltigkeit) bleibt Experten-Wert (separates Mapping `SOV8_EXPERT_SCORES`).
  - Gewichtung gemäß EU CSF (0.15/0.10/0.10/0.15/0.20/0.15/0.10/0.05) bleibt unverändert.
- **Werte-Verschiebung erwartbar:** Provider-Kontrolle-Scores ändern sich teils deutlich (typisch ±5–15 Punkte), weil C3A-Aggregate und Experten-Schätzungen nicht 1:1 deckungsgleich sind. Folge: ein paar Provider können die SEAL-Schwelle wechseln.

### Added
- `js/data/sov7-compliance.js` mit 10 SOV-7-Kriterien und Aggregations-Logik.
- Pro Provider in `provider-assessments.js`: `sov7`-Block mit den 10 Kriterien-Bewertungen.
- `SOV8_EXPERT_SCORES` Mapping als kompakte Trennung der nicht-formalisierten Bewertung.
- API-Erweiterungen: `window.SCC_DATA.SOV7_CRITERIA`, `getProviderSov7`, `getProviderSov7Scores`, `SOV8_EXPERT_SCORES`.
- Erklär-Sektion zu SOV-7 in `evaluation-criteria.html` inkl. Drawer/Desktop/Mobile-Nav.

### Removed
- `sov`-Block in `ASSESSMENTS` (statische Experten-Schätzungen für SOV-1…8) entfällt. Wird dynamisch aus den auditierbaren Quellen berechnet.

### Migration
- API-Konsumenten von `getProviderSovScores(id)` bekommen weiterhin ein `{sov1…sov8}` Objekt — Werte aber neu berechnet. UI-Komponenten müssen nicht angepasst werden.
- Eigene Skripte gegen die alten Werte sollten neu validiert werden, da die Werte jetzt belegbar statt geschätzt sind.
```

---

## Task 7: Smoke-Test (Daten-Integrität)

**Files:**
- Temporär: `scc-v5-smoke.js`

- [ ] **Step 1: Smoke-Test schreiben.**

```js
// scc-v5-smoke.js
global.window = {};
require('./js/data/sov-framework.js');
require('./js/data/c3a-framework.js');
require('./js/data/sov7-compliance.js');
require('./js/data/providers-base.js');
require('./js/data/provider-assessments.js');
require('./js/data/providers.js');

const D = global.window.SCC_DATA;
let issues = 0;

console.log('SCC v5 Smoke Test\n');
console.log('Providers:', D.BASE_PROVIDERS.length, '· C3A criteria:', Object.keys(D.C3A_CRITERIA).length, '· SOV-7 criteria:', Object.keys(D.SOV7_CRITERIA).length);

for (const p of D.BASE_PROVIDERS) {
    const sov = D.getProviderSovScores(p.id);
    const sov7Score = D.getProviderSov7Scores(p.id);
    if (!sov) { console.error('NO SOV:', p.id); issues++; continue; }
    if (sov.sov7 !== sov7Score) { console.error('MISMATCH SOV-7:', p.id, sov.sov7, '!=', sov7Score); issues++; }
    console.log(`  ${p.id.padEnd(36)} ctrl=${String(p.control).padStart(3)}  SEAL=${D.getSealLevel(p.control).shortLabel}  C3A=${D.getProviderC3AScores(p.id).total}  SOV-7=${sov7Score}  SOV-8=${sov.sov8}`);
}

console.log(issues === 0 ? '\nALL GREEN' : `\nIssues: ${issues}`);
```

- [ ] **Step 2: Ausführen.**

```bash
cd "/Users/thsoring/Library/CloudStorage/OneDrive-BTCAG/CCode/SCC"
node scc-v5-smoke.js
rm scc-v5-smoke.js
```

Erwartet: `ALL GREEN`, alle 15 Provider gelistet, SOV-7 zwischen 30 und 100, Kontrolle-Werte teils verschoben gegenüber v4.

---

## Task 8: Demo-Daten neu generieren

**Files:**
- Modify: `demos/v4-matrix-prototypes/demo-2-star-field.html`
- Modify: `demos/v4-matrix-prototypes/demo-1-smart-bubble.html`
- Modify: `demos/v4-matrix-prototypes/demo-3-cockpit.html`

- [ ] **Step 1: Extrakt-Skript anpassen.** Bestehender `extract-demo-data.js`-Approach erweitern um SOV-7-Score:

```js
return {
    ...
    sov7Score: D.getProviderSov7Scores(p.id),
    sov8Score: D.SOV8_EXPERT_SCORES[p.id]
};
```

- [ ] **Step 2:** Daten neu in alle 3 Demo-HTMLs übertragen (mit Python-Replace).

- [ ] **Step 3:** Tooltip in Demo 2 zeigt jetzt im EU-CSF-Toggle 8 SOV-Werte aus den neuen Quellen — keine Code-Änderung nötig, weil die `csf`-Felder bereits aus `getProviderSovScores` kommen.

---

## Self-Review

- ✅ Spec-Coverage: SOV-7-Katalog (Task 1+2), Berechnungs-Umstellung (Task 2 Step 4), UI-Erklärung (Task 5), Versions-Bump (Task 4), CHANGELOG (Task 6), Smoke (Task 7).
- ✅ Type-Konsistenz: `aggregateSov7` liefert `number 0–100`, identisch zur `aggregateC3A().sov*`-Schnittstelle. `PROVIDER_SOV_SCORES.sov*` bleibt `number`.
- ✅ Frontend-API rückwärtskompatibel: `getProviderSovScores(id)` gibt weiterhin `{sov1…sov8}`.
- ✅ SOV-8 ist absichtlich nicht formalisiert — als „Experten-Wert" deklariert.

---

## Offene Punkte (zur Diskussion mit Thomas)

1. **Bewertungen je Provider:** Ich entwerfe die SOV-7-Bewertungen pro Provider nach Heuristik (siehe Task 2). Brauchst du Review vor Apply, oder Auto-Apply mit nachträglichem Review?
2. **SOV-8 Formalisieren?** Heute Bestand: 50–85. Wenn dir das später unsauber vorkommt, können wir analog einen 4-Kriterien-Katalog (PUE, Renewable %, Carbon-Pledge, transparente Reports) nachziehen — ist v5.1.0-Material.

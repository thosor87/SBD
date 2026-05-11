# SCC v4.0.0 — C3A-Integration + Datenmodell-Refactoring

> **For agentic workers:** Inline execution by primary agent in Auto Mode. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** BSI C3A (Criteria enabling Cloud Computing Autonomy, v1.0 vom 27.04.2026) als zweite Bewertungsebene in den SCC integrieren – mit Pro-Provider-Quellenbelegen. Begleitend wird die monolithische `providers.js` (674 LOC) in fokussierte Module aufgeteilt.

**Architecture:**
- `js/data/providers.js` wird in vier Module aufgeteilt:
  - `js/data/sov-framework.js` — EU-CSF: SEAL-Levels, SOV-1…8 Kriterien, Gewichte, `calculateControlFromSov`, `getSealLevel`
  - `js/data/c3a-framework.js` — **NEU:** BSI C3A Kriterien (SOV-1…6) mit C1/C2-Varianten und Additional Criteria
  - `js/data/providers-base.js` — Provider-Stammdaten, Kategorien, Anonymisierung
  - `js/data/provider-assessments.js` — pro Provider: SOV-Scores, SOV-Erklärungen, C3A-Bewertung, Quellen
- `js/data/providers.js` (klein, ~50 LOC) bleibt als Aggregator/Backwards-Compat-Layer für `window.SCC_DATA`
- `index.html` und `evaluation-criteria.html` laden die neuen Skripte in Abhängigkeitsreihenfolge
- C3A-Bewertungen sind parallel zu den SOV-Scores: Pro Kriterium `pass | partial | fail | unknown` plus Quellen-URL

**Tech Stack:** Vanilla JS (no-build, IIFE-Pattern), HTML5, CSS3 (Bestand)

**Versionierung:** v3.2.1 → **v4.0.0** (Major-Bump, da Datenmodell strukturell erweitert)

**Out of scope:** SOV-7 (Security/Compliance) und SOV-8 (Sustainability) sind in C3A bewusst nicht enthalten – C3A verweist hier auf BSI C5:2026 / IT-Grundschutz. Wir behalten SOV-7 und SOV-8 in der bestehenden SCC-Bewertung.

---

## Task 1: Plan-Doku ablegen + Backups verifizieren

**Files:**
- Create: `docs/superpowers/plans/2026-04-27-scc-v4-c3a-integration.md` (diese Datei)
- Verify: `Archive/providers.js.backup-*`, `Archive/CHANGELOG.md.backup-*`, `Archive/index.html.backup-*`, `Archive/evaluation-criteria.html.backup-*`

- [x] **Step 1:** Plan dokumentiert ✓
- [x] **Step 2:** Backups bereits angelegt ✓

---

## Task 2: SOV-Framework-Modul extrahieren

**Files:**
- Create: `js/data/sov-framework.js`

Extrahiert alle EU-CSF-bezogenen Konstanten und Funktionen aus `providers.js`:
- `SEAL_LEVELS`, `SEAL_ZONES`, `getSealLevel()`
- `SOV_CRITERIA`, `SOV_WEIGHTS`, `calculateControlFromSov()`

Exportiert via `window.SCC_SOV_FRAMEWORK`.

---

## Task 3: C3A-Framework-Modul anlegen (neu)

**Files:**
- Create: `js/data/c3a-framework.js`

Vollständige Liste der C3A-Kriterien aus dem BSI-Dokument v1.0 (27.04.2026):

- **SOV-1 Strategic Sovereignty (4 Kriterien):** Jurisdiction (C1/C2), Registered Office (C1/C2), Effective Control (C1/C2), Control Change
- **SOV-2 Legal & Jurisdictional (3 Kriterien):** Extraterritorial Exposure, Audit Rights (C1/C2), State of Defense Takeover (C1/C2)
- **SOV-3 Data Sovereignty (5 Kriterien):** Data Residence (C1–C5), External Key Management (+AC), External Identity Provider (+3 ACs), Logging/Monitoring (+2 ACs), Client-Side Encryption
- **SOV-4 Operational Sovereignty (10 Kriterien):** Operating Personnel (C1/C2/AC), Remote Work (C1/C2), Redundant Connectivity (+AC), SOC (C1/C2), Ingress Data Control (+2 ACs), Update Threat Analysis, Data Exchange Monitoring, Data Exchange Gateways (+AC), Disconnect (+AC), Reconnect
- **SOV-5 Supply Chain (5 Kriterien):** Software Dependencies (+AC), Hardware Dependencies (+AC), External Service Dependencies (+AC), Export Restriction, Capacity Management (C1/C2)
- **SOV-6 Technology (3 Kriterien):** Source Code Availability, Continuous Service Delivery (+AC), Software Development

Struktur:
```js
const C3A_CRITERIA = {
  'SOV-1-01': {
    sov: 'sov1', name: 'Jurisdiction',
    variants: { C1: 'EU jurisdiction', C2: 'German jurisdiction' },
    description: 'Provider operates under EU/DE jurisdiction with contract governance and dispute resolution'
  },
  // … 30 Kriterien
}
```

Bewertungs-Werte: `'pass' | 'partial' | 'fail' | 'unknown'`.

Exportiert via `window.SCC_C3A`.

---

## Task 4: Provider-Stammdaten extrahieren

**Files:**
- Create: `js/data/providers-base.js`

Übernimmt aus `providers.js`:
- `PROVIDER_CATEGORIES`, `CATEGORY_COLORS`, `CATEGORY_LABELS`, `ANONYMOUS_PREFIXES`
- `BASE_PROVIDER_DATA` (das Array mit 15 Provider-Stammsätzen)
- `LEGEND_DATA`
- Hilfsfunktionen: `anonymizeProviders`, `getProviderById`, `getProvidersByCategory`, `getProvidersCopy`

Exportiert via `window.SCC_PROVIDERS_BASE`.

---

## Task 5: Provider-Assessments anlegen (Scores + Erklärungen + C3A + Quellen)

**Files:**
- Create: `js/data/provider-assessments.js`

Pro Provider:
```js
'aws': {
  sov: { sov1: 15, sov2: 20, sov3: 55, … },
  sovExplanations: { sov1: 'US-Konzern…', … },
  c3a: {
    'SOV-1-01': { result: 'fail', variant: 'C1', note: 'US jurisdiction' },
    'SOV-1-02': { result: 'fail', variant: 'C1', note: 'HQ Seattle' },
    // … alle 30 Kriterien
  },
  sources: [
    { title: 'AWS Global Infrastructure', url: 'https://aws.amazon.com/about-aws/global-infrastructure/' },
    { title: 'AWS Compliance Programs', url: 'https://aws.amazon.com/compliance/programs/' },
    // 2-5 Quellen pro Provider
  ]
}
```

Pro Provider 2–5 Pflicht-Quellen (Provider-Webseite, Compliance-Page, Pressemitteilung, Whitepaper). Alle 15 Provider abdecken.

Exportiert via `window.SCC_ASSESSMENTS`.

---

## Task 6: providers.js in Aggregator-Layer reduzieren

**Files:**
- Modify: `js/data/providers.js` (von 674 LOC auf ~80 LOC reduziert)

Re-exportiert die zusammengeführten Daten unter dem etablierten `window.SCC_DATA`-Namespace, damit die bestehenden Komponenten (`scc-compass.js`, `chart.js`, `scc-criteria-page.js`) nicht angefasst werden müssen.

```js
window.SCC_DATA = Object.freeze({
  ...window.SCC_PROVIDERS_BASE,
  ...window.SCC_SOV_FRAMEWORK,
  ...window.SCC_C3A,
  ...window.SCC_ASSESSMENTS,
  // Aggregierte Provider mit control-Score
  BASE_PROVIDERS: buildProvidersWithControl(),
  // Backwards-compat-API
  PROVIDER_SOV_SCORES, PROVIDER_SOV_EXPLANATIONS, getProviderSovScores, getProviderSovExplanations
});
```

---

## Task 7: Script-Loading in HTML aktualisieren

**Files:**
- Modify: `index.html` (Script-Tags + Versions-String)
- Modify: `evaluation-criteria.html` (Script-Tags + Versions-String)

Lade-Reihenfolge der Datenmodule (vor `scc-compass.js` bzw. `scc-criteria-page.js`):
```html
<script src="js/data/sov-framework.js"></script>
<script src="js/data/c3a-framework.js"></script>
<script src="js/data/providers-base.js"></script>
<script src="js/data/provider-assessments.js"></script>
<script src="js/data/providers.js"></script>
```

Versions-Strings: `Version 3.2.1` → `Version 4.0.0` (jeweils 2 Stellen in `index.html`).

---

## Task 8: C3A-Sektion in evaluation-criteria.html

**Files:**
- Modify: `evaluation-criteria.html`

Neue Sektion „BSI C3A — Operationalisierung der Souveränität" zwischen den bestehenden SOV-1…8-Beschreibungen und dem Disclaimer. Inhalt:
- Erklärung: was C3A ist, Verhältnis zu EU CSF / SEAL / C5
- Hinweis auf 6 SOV-Kategorien (kein SOV-7/8 in C3A)
- C1/C2 Variantenkonzept (EU vs. Deutschland)
- Hinweis auf CADA als möglicher Verbindlichkeits-Trigger
- Quellenangabe: Link zum BSI-PDF

---

## Task 9: CHANGELOG-Eintrag

**Files:**
- Modify: `CHANGELOG.md`

Eintrag direkt unter `# Changelog` Header:

```markdown
## [4.0.0] - 2026-04-27

### Added
- **BSI C3A Integration:** Vollständige Operationalisierung des EU Cloud Sovereignty Framework gemäß BSI C3A v1.0 (27.04.2026). 30 prüfbare Kriterien aus SOV-1 bis SOV-6, mit C1/C2-Varianten (EU vs. Deutschland).
- **Pro-Provider-Quellen:** Belegbare URL-Quellen je Provider (Provider-Compliance-Seiten, Pressemitteilungen, Zertifikate) als first-class Daten.
- **C3A-Sektion** in `evaluation-criteria.html` mit Erläuterung zum Verhältnis C3A ↔ EU CSF / SEAL / BSI C5:2026.

### Changed
- **Refactoring `providers.js`:** Monolithische 674-Zeilen-Datei aufgeteilt in 4 fokussierte Module (`sov-framework.js`, `c3a-framework.js`, `providers-base.js`, `provider-assessments.js`) plus Aggregator-Layer (`providers.js`). Frontend-API `window.SCC_DATA` bleibt rückwärtskompatibel.
- Script-Loading-Reihenfolge in `index.html` und `evaluation-criteria.html` an neue Modulstruktur angepasst.

### Migration
- Keine Breaking Changes für Konsumenten der API – `window.SCC_DATA` exportiert weiterhin alle alten Felder.
```

---

## Task 10: Smoke-Test

- [ ] **Step 1:** Lokal öffnen: `index.html` und `evaluation-criteria.html`
- [ ] **Step 2:** Browser-Konsole prüfen: keine Fehler, `window.SCC_DATA.BASE_PROVIDERS.length === 15`, `window.SCC_DATA.C3A_CRITERIA` existiert
- [ ] **Step 3:** Versions-Footer zeigt "Version 4.0.0"

---

## Self-Review

- ✅ Spec-Coverage: C3A-Datenmodell (Task 3,5), Quellen je Provider (Task 5), Refactoring (Task 2,4,6), HTML-Updates (Task 7,8), Changelog/Versionsbump (Task 9)
- ✅ Type-Konsistenz: Bewertungs-Enum (`'pass'|'partial'|'fail'|'unknown'`) konsistent
- ✅ Frontend-API rückwärtskompatibel (`window.SCC_DATA`)
- ✅ Kein Breaking Change für `scc-compass.js`, `chart.js`, `scc-criteria-page.js`

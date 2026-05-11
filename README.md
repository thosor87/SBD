# Sovereign Cloud Compass (SCC)

Ein interaktives Tool zur Bewertung und Auswahl von Cloud-Anbietern basierend auf der Balance zwischen Kontrolle/Souveränität und Leistungsfähigkeit. Ab v4.0.0 vollständig auditierbar gemäß **BSI C3A v1.0** (*Criteria enabling Cloud Computing Autonomy*, 27.04.2026) und dem **EU Cloud Sovereignty Framework**.

## Highlights

- **BSI C3A v1.0 Operationalisierung**: ~30 prüfbare Einzelkriterien aus SOV-1…6 mit pass/partial/fail/unknown-Bewertung pro Provider, inklusive C1/C2-Varianten (EU vs. Deutschland)
- **SOV-7 Compliance-Katalog**: 10 prüfbare Sicherheitskriterien (ISO 27001/17/18/27701, BSI C5/IT-Grundschutz, SOC 2 Type 2, KRITIS, NIS2, EU-/DE-SOC), die die SOV-7-Lücke des BSI-C3A-Mandats schließen
- **Audit-Strenge-Toggle**: Wechsel zwischen **EU (C1)** und **Deutschland (C2)** mit BSI-konformer Score-Anpassung — optimal für KRITIS- und Bundesausschreibungen
- **EU SEAL-Integration**: Souveränitätsbewertung nach EU Cloud Sovereignty Framework (SEAL-0 bis SEAL-4) mit EU-konformer Gewichtung der SOV-1…8
- **Pro-Provider-Quellenbelege**: Belastbare URL-Quellen je Provider (Compliance-Seiten, Pressemitteilungen, Zertifikate)
- **Spider-Chart-Hover** auf Matrix-Punkten: Sofort sichtbare 6-Speichen-Visualisierung der C3A-Werte
- **Sov-Detail-Panel** mit konsolidierter Drilldown-Liste (8 SOV-Reihen ausklappbar mit Einzelkriterien)
- **Strategie-Slider**: Dynamische Gewichtung zwischen Kontrolle und Leistung
- **Matrix-Visualisierung**: 2D-Darstellung mit SEAL-Zonen als Hintergrund-Bändern
- **Kategorie-Filter**: Hyperscaler / Souveräne Clouds / EU-Anbieter / Private / Hybrid
- **Public & Full Access Modus**: Anonymisierte Ansicht oder Vollzugriff mit Anbieter-Namen
- **Editierbare Scores**: Bewertungen können individuell angepasst werden
- **Responsive Design** & **Dark Mode**: Optimiert für Desktop, Tablet und Mobile

## Unterstützte Cloud-Anbieter (16)

### Hyperscaler (4)
- Amazon Web Services (AWS)
- Microsoft Azure
- Google Cloud Platform (GCP)
- Oracle Cloud

### Souveräne Clouds (3)
- AWS European Sovereign Cloud (ESC) — GA seit Januar 2026, RZ Brandenburg
- Microsoft DELOS Cloud — Treuhänder-Modell mit SAP/Arvato für deutsche Verwaltung
- Oracle EU Sovereign Cloud — GA seit 2023, RZ Frankfurt + Madrid

### EU-Anbieter (4)
- STACKIT (Schwarz Gruppe)
- IONOS Cloud (United Internet)
- T Cloud Public (Deutsche Telekom, ehem. Open Telekom Cloud)
- SAP Cloud Infrastructure (SAP SE, RZ Walldorf/St. Leon-Rot)

### Private Cloud (2)
- OpenStack Private Cloud
- VMware Private Cloud

### Hybrid-Lösungen (3)
- Google Dedicated Cloud (Treuhänder-Modell)
- Azure Stack HCI
- AWS Outpost

## Funktionen

### 1. Strategie-Slider
- Kontinuierliche Anpassung der Gewichtung zwischen Kontrolle (0-100%) und Leistung (0-100%)
- Vordefinierte Labels: Kontrolle-fokussiert, Ausgewogen, Leistungs-fokussiert
- Echtzeit-Aktualisierung der Rankings und Visualisierung

### 2. Matrix-Visualisierung
- 2D-Darstellung aller Anbieter nach Kontrolle (Y-Achse) und Leistung (X-Achse)
- **SEAL-Zonen**: Horizontale Bänder zeigen SEAL-Level-Bereiche (SEAL-0 bis SEAL-4)
- Farbcodierung nach Anbieter-Kategorie
- Größenbasiertes Ranking (größere Punkte = bessere Position)
- Hover-Tooltips mit Score-Details und SEAL-Level
- Quadranten-Labels: Souverän, Autarkiefokussiert, Starter, Leistungsfokussiert

### 3. Kategorie-Filter
- Selektive Anzeige nach Anbieter-Kategorien
- Multi-Select-Funktionalität
- Dynamische Zähler für sichtbare Anbieter
- Persistente Filtereinstellungen

### 4. Ranking & Ergebnisse
- Top 8 Anbieter basierend auf gewählter Strategie
- Detailkarten mit Beschreibung, Kontrolle, Leistung und Score
- Visueller Score-Balken
- Hervorhebung des Gewinners

### 5. Bewertungskriterien-Dokumentation
- Separate Seite (`evaluation-criteria.html`) mit vollständiger Dokumentation
- Detaillierte Erklärung aller Bewertungsfaktoren für Kontrolle und Leistung
- Transparente Darstellung der Scoring-Methodik und Berechnungsformel
- Editierbare Provider-Scores mit Echtzeit-Aktualisierung

### 6. EU SEAL-Integration
- **SEAL-Level (0-4)**: Basierend auf dem EU Cloud Sovereignty Framework
  - SEAL-4: Vollständige Souveränität (Kontrolle ≥90)
  - SEAL-3: Digital Resilience (Kontrolle 75-89)
  - SEAL-2: Data Sovereignty (Kontrolle 55-74)
  - SEAL-1: Basistransparenz (Kontrolle 40-54)
  - SEAL-0: Keine Souveränität (Kontrolle <40)
- **SOV-Kriterien (SOV-1 bis SOV-8)**: 8 Souveränitätsziele mit EU-Gewichtung
- **SOV-Panel**: Klick auf Provider-Card öffnet Detail-Ansicht mit allen SOV-Scores
- **SEAL-Badges**: Kompakte Level-Anzeige in Cards und Tooltips

### 7. Passwortschutz
- Public Access: Anonymisierte Anbieter-Namen (H1, H2, S1, E1, etc.)
- Full Access: Vollständige Anbieter-Namen nach Passwort-Eingabe
- Session-basierte Authentifizierung
- Beratungstermin-Buchung direkt aus dem Login

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 mit CSS Custom Properties und Glass-Morphism Design
- **Icons**: Font Awesome 6.5
- **Architektur**: Single-Page Application ohne Build-Prozess
- **Authentifizierung**: Client-seitige SHA-256-Hash-Validierung
- **Persistenz**: LocalStorage für Custom Scores und Theme-Präferenzen
- **Mobile**: Responsive Design mit Safe-Area-Support für moderne Smartphones

## Setup

### Voraussetzungen
- Moderner Webbrowser (Chrome, Firefox, Safari, Edge)
- Keine Server-Installation erforderlich

### Lokale Nutzung
1. Repository klonen oder ZIP entpacken
2. `index.html` im Browser öffnen für das Haupt-Tool
3. Optional: `evaluation-criteria.html` öffnen für die Bewertungskriterien-Dokumentation
4. Fertig!

### Dateistruktur
```
SCC/
├── index.html                        # Haupt-HTML (Compass mit Audit-Toggle)
├── evaluation-criteria.html          # Bewertungskriterien & Methodik-Seite
├── styles.css                        # Haupt-Styling (~4.200 Zeilen)
├── criteria-styles.css               # Zusätzliche Styles für Kriterien-Seite
├── js/
│   ├── scc-compass.js                # UI-Controller (Sov-Panel, Hover-Popup, Toggle)
│   ├── data/
│   │   ├── sov-framework.js          # EU CSF: SEAL-Levels, SOV-1…8, Gewichte
│   │   ├── c3a-framework.js          # BSI C3A v1.0: 30 Kriterien + aggregateC3A
│   │   ├── sov7-compliance.js        # SOV-7 Compliance-Katalog (10 Kriterien)
│   │   ├── providers-base.js         # Provider-Stammdaten & Kategorien
│   │   ├── provider-assessments.js   # Pro Provider: C3A, SOV-7, SOV-8, Quellen
│   │   └── providers.js              # Aggregator (window.SCC_DATA)
│   ├── components/
│   │   └── chart.js                  # Matrix-Visualisierung mit SEAL-Zonen
│   └── core/
│       ├── auth.js                   # Login (SHA-256)
│       ├── storage.js                # LocalStorage-Wrapper
│       ├── theme.js                  # Dark Mode
│       ├── mobile-nav.js             # Mobile Navigation
│       └── utils.js                  # Hilfsfunktionen
├── scc-criteria-page.js              # Bewertungskriterien-Logik
├── docs/superpowers/plans/           # Plan-Dokumente (v4 C3A, v4 Hybrid Control)
├── favicon.svg                       # Favicon
├── btc-logo.png / btc-logo-white.png # BTC AG Logo
├── og-image.png                      # OpenGraph Bild
├── LICENSE                           # Dual-License (AGPL v3 / kommerziell)
├── CHANGELOG.md                      # Änderungsprotokoll
└── README.md                         # Diese Datei
```

## Verwendung

1. **Access-Modus wählen**: Public Mode (anonymisiert) oder Vollzugriff (mit Passwort)
2. **Strategie anpassen**: Slider zwischen Kontrolle und Leistung verschieben
3. **Kategorien filtern**: Gewünschte Anbieter-Typen ein-/ausblenden
4. **Ergebnisse analysieren**: Matrix und Ranking zeigen passende Anbieter
5. **Details erkunden**: Klick auf "Bewertungskriterien" für vollständige Dokumentation

## Bewertungsmethodik

Ab v4.0.0 erfolgt die Bewertung in **vier Aggregations-Stufen**:

### Stufe 1 — Einzelkriterium
Jedes der ~30 BSI-C3A-Kriterien und der 10 SOV-7-Compliance-Kriterien wird mit `pass` (100), `partial` (50), `fail` (0) oder `unknown` (0) bewertet. Pro Bewertung wird eine textliche Begründung und (wo zutreffend) die Variante (C1 / C2 / C3 / C4) hinterlegt.

### Stufe 2 — SOV-Score
Der Score je SOV-Kategorie ist der **arithmetische Mittelwert** aller zugehörigen Kriterien.

### Stufe 3 — Kontrolle und C3A-Total
- **C3A-Total** (BSI-Methodik) = ungewichteter Mittelwert über die **6 SOV-Buckets** SOV-1…6
- **Kontrolle** (EU-CSF-Methodik) = gewichteter Mittelwert über alle **8 SOV-Dimensionen**:

| SOV | Kriterium | Gewicht | Datenquelle |
|-----|-----------|---------|-------------|
| SOV-1 | Strategische Souveränität | 15% | BSI C3A (4 Kriterien) |
| SOV-2 | Rechtliche Souveränität | 10% | BSI C3A (3 Kriterien) |
| SOV-3 | Daten- & KI-Souveränität | 10% | BSI C3A (5 Kriterien) |
| SOV-4 | Operative Souveränität | 15% | BSI C3A (10 Kriterien) |
| SOV-5 | Lieferketten-Souveränität | 20% | BSI C3A (5 Kriterien) |
| SOV-6 | Technologie-Souveränität | 15% | BSI C3A (3 Kriterien) |
| SOV-7 | Sicherheits-Souveränität | 10% | SCC SOV-7 Katalog (10 Kriterien) |
| SOV-8 | Ökologische Nachhaltigkeit | 5% | Experten-Wert |

### Stufe 4 — Gesamt-Score
```
Gesamt = Kontrolle × (1 - s) + Leistung × s        (s = Slider-Wert 0…1)
```

### Audit-Strenge C1 / C2 (BSI-konform)
Im **DE-Modus (C2)** werden Kriterien, die nur die EU-Variante (C1) erfüllen, auf 50 Punkte reduziert. Damit lässt sich die Strenge für KRITIS- oder Bundesausschreibungen anpassen, ohne die Datenbasis zu duplizieren.

### Leistung & Performance (0–100 Punkte)
Service-Portfolio · Service-Reife · Skalierbarkeit & Verfügbarkeit · Innovation & KI/ML · Ökosystem · Performance & Latenz

## Datenquellen

Die Bewertungen basieren auf:
- **BSI C3A v1.0** (27.04.2026) — 30 prüfbare Kriterien je Provider
- **EU Cloud Sovereignty Framework** — Referenz-Dokument der EU-Kommission
- **Öffentliche Provider-Quellen** — Compliance-Seiten, Pressemitteilungen, Zertifikate (URL-belegt je Provider)
- **Experten-Einschätzungen der BTC AG** (10+ Jahre Cloud-Erfahrung) für SOV-8 (Nachhaltigkeit) und Leistungs-Bewertung
- Stand: April 2026

**Hinweis**: Die Bewertungen sind transparent dokumentiert und können in der Methodik-Seite eingesehen werden. SOV-1…7 sind audit-tauglich aus den prüfbaren Kriterien aggregiert; SOV-8 bleibt eine Experten-Einschätzung, da SOV-8 nicht im BSI-Mandat liegt.

## Erweiterung

### Neue Anbieter hinzufügen
Im JavaScript-Bereich von `index.html` unter `baseFullProviders` einen neuen Eintrag anlegen:

```javascript
{
    name: 'Neuer Anbieter',
    control: 75,
    performance: 80,
    color: '#3b82f6',
    category: 'eu',
    description: 'Beschreibung des Anbieters und seiner Stärken.'
}
```

### Scores anpassen
- Öffne `evaluation-criteria.html`
- Klicke auf den Edit-Button bei einem Anbieter
- Passe Kontrolle- und Leistungs-Scores an
- Änderungen werden in LocalStorage gespeichert und im Compass übernommen

## Lizenz

Dieses Projekt steht unter einer **Dual-License** (AGPL v3 / Kommerziell). Details siehe [LICENSE](LICENSE).

- **AGPL v3**: Kostenlose Nutzung mit Quellcode-Offenlegungspflicht
- **Kommerzielle Lizenz**: Für proprietäre Nutzung ohne Offenlegungspflicht

## Kontakt & Support

Bei Fragen, Feedback oder Erweiterungswünschen:

**BTC Business Technology Consulting AG**
E-Mail: cloud@btc-ag.com

---

*Entwickelt mit Unterstützung von Claude (Anthropic)*

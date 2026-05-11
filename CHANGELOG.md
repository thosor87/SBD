# Changelog

All notable changes to the Sovereignty by Design Platform (SBD) are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] – 2026-05-11

Initial release – Sovereignty by Design Platform.

### Added

**3-Schritt-Flow**
- **3-Step-Navigation**: Geführter Flow Provider wählen → Organisation bewerten → Ergebnis
- **Co-Branding**: BTC AG × STACKIT Header mit offiziellem STACKIT Brand-Kit Logo

**Step 1 – Provider-Vergleich (ES³/SEAL-Integration)**
- **ES³/SEAL View Toggle**: Umschalter im Card-Header, Default ES³. Im ES³-Modus zeigt jede Provider-Card ein abgeleitetes ES³-SML-Level (BTC-Einschätzung aus SOV-1…8-Scores, Weakest-Link-Prinzip). Im SEAL-Modus: EU CSF SEAL-Level + BSI-C3A-Score wie gewohnt.
- **ES³-Legenden-Karte**: Erklärt Initial / Managed / Advanced / Future-Proof mit Schwellenwerten und Weakest-Link-Hinweis; erscheint automatisch wenn ES³-Modus aktiv, SEAL-Karte wenn SEAL-Modus aktiv.
- **ES³-Matrix-Zonen**: Hintergrundbänder in der Scatter-Matrix wechseln je nach View-Mode (ES³ oder SEAL).
- **ES³-certified Filter**: Button „Nur ES³ certified" – blendet alle nicht-zertifizierten Provider aus (aktuell: nur STACKIT ist BDO-auditiert zertifiziert).
- **ES³-Badge**: STACKIT erhält „ES³ certified"-Badge in Result-Card, Hover-Popup und SOV-Panel.
- **`getProviderES3DerivedLevel(id)`**, **`getViewMode()` / `setViewMode()`** in `window.SCC_DATA`
- **SOV-Panel ES³-Modus**: Im ES³-Modus zeigt das Detail-Panel jeden Provider mit ES³-Perspektive: ES³ SML-Level prominent im Header, Hero-Metrik zeigt ES³ SML + Weakest-Link-Score, aufgeklappter Formel-Block mit Dimension-Score-Tabelle (D1–D8 mit Scores, Level, Weakest-Link-Markierung), jede SOV-Zeile erhält ES³-Dimensions-Tag (z. B. „ES³ D5") und orange Weakest-Link-Badge bei der schwächsten Dimension. Im SEAL-Modus bleibt die bisherige Ansicht (SEAL + C3A + Gewichtungsformel) unverändert.
- **Mobile-Optimierung**: Vollständig responsiv für alle Steps und Seiten. Step-Navigation kompakt ab 768px, Labels ab 400px ausgeblendet. Step-2-Fragebogen wechselt auf einspaltiges Layout, Touch-Targets mind. 36–44px. Step-3-Ergebnis mit scrollbarer Tabelle, gestapeltem Footer und Touch-freundlichem CTA. Schwebende Auswahl-Bar mit iOS safe-area-inset. evaluation-criteria.html kompakter ab 480px.
- **ES³-certified Badge**: Grüner Checkmark (`✓ ES³ certified`) ohne Rahmen — dezent neben SEAL/C3A-Badges.
- **Umlaute**: Alle Umlaut-Ersetzungen (ae/oe/ue) in `provider-match.js` und `es3-questions.js` korrigiert.

**Step 2 – Organisations-Assessment**
- **ES³-Assessment**: 9 Souveränitätsdimensionen × 3 Ebenen (Regulatorisch / Organisatorisch / Technisch), 27 Fragen
- **SML-Scoring** mit Weakest-Link-Prinzip: Initial / Managed / Advanced / Future-Proof

**Step 3 – Ergebnis & Empfehlung**
- **Provider-Match**: STACKIT → positiv (ES³ certified, BDO-auditiert), andere Provider → neutrale Einschätzung
- **Reifegrad-Tabelle**: Alle 9 Dimensionen mit Scores, schwächste Dimension hervorgehoben

**Qualität**
- **29 Unit-Tests** (TDD) für alle Logik-Module (`sml-assessment`, `es3-questions`, `provider-match`)

### Based on

Sovereign Cloud Compass (SCC) v4.0.0 – EU SEAL, BSI C3A v1.0, SOV-7, 16 Cloud-Anbieter.

---

## Ältere SCC-Versionen

Dieses Projekt ist ein Fork des Sovereign Cloud Compass (SCC).
Den ursprünglichen Changelog findest du unter: https://github.com/btc-ag/SCC/blob/main/CHANGELOG.md

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2026-04-27

Diese Major-Release stellt den Sovereign Cloud Compass auf eine vollständig **auditierbare**
Bewertungsbasis um — kein Wert im Kontrolle-Score ist mehr eine subjektive Experten-Schätzung.

### Added — Datenmodell & Methodik
- **BSI C3A Integration:** Vollständige Operationalisierung des EU Cloud Sovereignty Framework gemäß BSI-Publikation *Criteria enabling Cloud Computing Autonomy (C3A) v1.0* vom 27.04.2026. Rund 30 prüfbare Kriterien aus den Kategorien SOV-1 bis SOV-6, mit C1/C2-Varianten (EU vs. Deutschland) sowie Additional Criteria (AC).
- **SOV-7 Compliance-Katalog** (`js/data/sov7-compliance.js`): 10 prüfbare Sicherheits-/Compliance-Kriterien (`SOV-7-01` bis `SOV-7-10`) analog zur C3A-Struktur — schließt die Lücke, die BSI C3A bei SOV-7 (Security & Compliance) bewusst lässt. Kriterien orientieren sich an ISO/IEC 27001, BSI IT-Grundschutz, BSI C5, ISO 27017/27018/27701, SOC 2 Type 2, KRITIS, NIS2 und EU-/DE-SOC.
- **Pro-Provider-Quellenbelege:** Belastbare URL-Quellen je Provider (Compliance-Seiten, Pressemitteilungen, Zertifikate) als first-class Daten unter `getProviderSources(id)`.
- **Pro-Provider-C3A-Bewertung:** Pro Kriterium `pass | partial | fail | unknown`, optional inkl. Hinweis und gewählter Variante (C1/C2). Aggregation nach SOV-Bucket über `aggregateC3A()` und `getProviderC3AScores(id)`.
- **Pro-Provider-SOV-7-Bewertung:** Pro Kriterium `pass | partial | fail | unknown` mit Begründungstext, Aggregation über `aggregateSov7()` und `getProviderSov7Scores(id)`.
- **Oracle EU Sovereign Cloud** als 16. Provider hinzugefügt (Frankfurt + Madrid, Oracle EMEA als operative Tochter mit vertraglichem CLOUD-Act-Schutz).
- **`deVariant`-Mechanik in C3A-Kriterien:** SOV-3-01 hat 5 Varianten (C1–C5); C4 (DE customer data) ist die korrekte DE-Variante, nicht C2. `meta.deVariant: 'C4'` macht das explizit, sodass deutsche Provider mit C4-Annotation im C2-Modus nicht fälschlich heruntergestuft werden.

### Added — UI & Interaktion
- **Audit-Strenge-Toggle** im Card-Header der Hauptseite: Wechsel zwischen **EU (C1)** und **Deutschland (C2)** mit `localStorage`-Persistenz. Bei C2 werden Kriterien ohne DE-Variante auf 50 Punkte reduziert (BSI-konform). Komplett-Re-Render aller Visualisierungen bei Wechsel.
- **Hover-Popup auf Matrix-Punkten:** Spider-Chart-Karte mit 6-Speichen-Stern (SOV-1…6) plus SEAL-Badge, C3A-Badge, Kontrolle/Leistung-Metriken. Smartes Positioning (rechts/links/oben/unten je nach Platz). Klick auf Punkt öffnet Sov-Panel.
- **Sov-Panel komplett neu aufgebaut** (`openSovPanel`):
  - Hero mit Spider-Grafik + Kontrolle/Leistung-Boxen
  - Statischer Header mit SEAL-, C3A- und Gesamt-Score-Badges
  - Ausklappbarer Erklär-Block „Wie unterscheiden sich Kontrolle und C3A?" mit verlinkter BSI- und EU-CSF-Methodik plus Gewichtungs-Tabelle
  - **Konsolidierte SOV-Liste**: 8 ausklappbare Reihen statt zwei separater Drilldown-Blöcke. Pro Zeile Quellen-Tag (`C3A` / `SOV-7` / `Experten`). SOV-1…6 zeigen die zugehörigen C3A-Einzelkriterien, SOV-7 zeigt den Compliance-Katalog, SOV-8 zeigt einen Experten-Hinweis.
  - **C2-Downgrade-Visualisierung pro Kriterium**: durchgestrichene C1-Badge, orange Note-Box mit Score-Effekt-Hinweis (z. B. „C1 reicht für DE nicht — dieses Kriterium: 50 statt 100").
  - Quellen-Block mit allen Provider-URLs am Ende
- **Berechnungsmethodik in evaluation-criteria.html** ausführlich dokumentiert mit 4-Stufen-Pyramide (Einzelkriterium → SOV-Score → Kontrolle/C3A → Gesamt-Score), konkreter Beispiel-Tabelle (AWS ESC SOV-1: 88 vs. 75) und C1/C2-Erklärblock.
- **Glossar-Box auf beiden Seiten** mit drei Frameworks (EU CSF, SEAL, BSI C3A) — auf der Hauptseite zugeklappt, auf der Methodik-Seite aufgeklappt.
- **Hinweis-Footer im Sov-Panel** mit zwei Quellen-Links (EU CSF + BSI C3A v1.0).

### Erweiterte JavaScript-Modul-API (`window.SCC_DATA`)
Reine Browser-Inkapsulation der Daten-Module — keine HTTP/REST-Schnittstelle. Wird von den UI-Komponenten konsumiert (`scc-compass.js`, `chart.js`, `scc-criteria-page.js`).
- `C3A_CRITERIA`, `C3A_RESULTS`, `C3A_VERSION`, `getProviderC3A`, `getProviderC3AScores`, `getProviderSources`, `getProviderAssessment`
- `SOV7_VERSION`, `SOV7_CRITERIA`, `SOV7_RESULT_SCORE`, `SOV8_EXPERT_SCORES`, `getProviderSov7`, `getProviderSov7Scores`, `computeProviderSovScores`
- `getAuditMode`, `setAuditMode`, `getProviders` für mode-abhängige Provider-Listen
- `window.SCC_HOVER` und `window.SCC_OPEN_PANEL` als globale Hooks für `chart.js` (Hover-/Klick-Integration)
- **Plan-Dokumentation:** `docs/superpowers/plans/2026-04-27-scc-v4-c3a-integration.md` und `docs/superpowers/plans/2026-04-27-scc-v4-hybrid-control.md`.

### Changed (BREAKING — methodisch)
- **Kontrolle-Score-Berechnung umgestellt.** Bisher waren SOV-1…8 subjektive Experten-Schätzungen; ab v4.0.0:
  - **SOV-1…6** werden aus der **BSI-C3A**-Aggregation berechnet (`aggregateC3A()`).
  - **SOV-7** wird aus dem **neuen 10-Punkte-Compliance-Katalog** berechnet (`aggregateSov7()`).
  - **SOV-8** (Nachhaltigkeit) bleibt Experten-Wert in `SOV8_EXPERT_SCORES` — BSI-Mandat deckt SOV-8 nicht ab.
  - Gewichtung gemäß EU CSF (0.15/0.10/0.10/0.15/0.20/0.15/0.10/0.05) bleibt unverändert.
- **Werte verschieben sich** durch die methodische Umstellung. Auswahl beobachteter Wechsel:
  - AWS European Sovereign Cloud: 69 → 77 (SEAL-2 → **SEAL-3**)
  - Microsoft DELOS Cloud: 72 → 76 (SEAL-2 → **SEAL-3**)
  - IONOS Cloud: 79 → 87 (SEAL-3, deutlich höhere Position)
  - Google Dedicated Cloud: 64 → 53 (SEAL-2 → **SEAL-1**)
  - AWS Outpost: 43 → 32 (SEAL-1 → **SEAL-0**)
  - VMware Private Cloud: 74 → 67 (SEAL-2, niedriger)

### Changed (Refactoring)
- **Refactoring `js/data/providers.js`:** Die monolithische Datei (674 LOC) wurde in fokussierte Module aufgeteilt:
  - `js/data/sov-framework.js` – EU CSF, SEAL-Levels, SOV-1…8 Kriterien, Gewichte
  - `js/data/c3a-framework.js` – BSI C3A v1.0 (~30 Kriterien, Aggregation)
  - `js/data/sov7-compliance.js` – SOV-7 Compliance-Katalog (10 Kriterien, Aggregation)
  - `js/data/providers-base.js` – Provider-Stammdaten und Kategorisierung
  - `js/data/provider-assessments.js` – pro Provider: C3A-Bewertung, SOV-7-Bewertung, Quellen, Erklärungen + zentrale `computeProviderSovScores()`-Funktion
  - `js/data/providers.js` – schlanker Aggregator-Layer, bündelt alles unter `window.SCC_DATA`
- **Script-Loading-Reihenfolge** in `index.html` und `evaluation-criteria.html` an die neue Modulstruktur angepasst.

### Removed
- Statische `sov: { sov1..sov8 }`-Blöcke in `ASSESSMENTS` (Experten-Schätzungen) entfallen vollständig. SOV-Werte werden ausschließlich dynamisch aus den auditierbaren Quellen (C3A + SOV-7 + SOV-8) berechnet.

### Migration
- **Keine Breaking Changes für UI-Konsumenten:** `window.SCC_DATA` exportiert weiterhin alle bisherigen Felder und Funktionen. `scc-compass.js`, `chart.js` und `scc-criteria-page.js` mussten nicht angepasst werden — der Vertrag von `getProviderSovScores(id)` bleibt `{sov1…sov8}`.
- Eigene Skripte gegen die alten Experten-Werte sollten neu validiert werden, da die Werte jetzt belegbar statt geschätzt sind.

### Notes
- **Methodische Begründung:** Das BSI hat die Trennung explizit so vorgesehen: *„C3A presupposes that the cloud service provider meets the C5 criteria"* — Sicherheits-/Compliance-Aspekte werden ausdrücklich nicht in C3A geprüft, sondern über C5/IT-Grundschutz. Der neue SOV-7-Katalog schließt diese Lücke konsistent.
- Der angekündigte **EU Cloud and AI Development Act (CADA)** könnte Teile von C3A im Mai 2026 in verbindliche Rechtsnormen überführen.

## [3.2.1] - 2026-04-16

### Changed
- **SAP Cloud Infrastructure**: SOV-7-Text um neu erworbene Zertifizierungen ergänzt: ISO 27001 auf Basis IT-Grundschutz (BSI-zertifiziert April 2026, RZs Walldorf/St. Leon-Rot), SOC 1 Typ II, SOC 2 Typ II – Quelle: SAP-Pressemitteilung April 2026

## [3.2.0] - 2026-03-19

### Changed
- **AWS ESC**: Beschreibung auf GA-Status (15.01.2026) aktualisiert; SOV-7-Text um vollständiges Zertifizierungspaket ergänzt (SOC 2 Type 1, BSI C5, ISO 27001/17/18/27701/22301/20000/9001)
- **Microsoft DELOS Cloud**: SOV-4-Text um zweites Ops-Center Leipzig ergänzt (Geo-Redundanz vollständig seit Frühjahr 2026)
- **T Cloud Public** (ehem. Open Telekom Cloud): Umbenennung zum 02.02.2026 nachgezogen; Beschreibung auf Industrial AI Cloud (Feb 2026, NVIDIA Blackwell, größte souveräne AI-Infrastruktur Europas) und Feature-Parity-Roadmap aktualisiert

## [3.1.3] - 2026-02-20

### Fixed
- **CSS-Ladevorgang auf der Kriterienseite**: `criteria-styles.css` wird nun lokal aus dem SCC-Repo geladen statt über eine externe GitHub-Pages-URL des SAA-Repos (behebt 404-Fehler)

## [3.1.2] - 2026-02-18

### Changed
- **Framework-Bezeichnung präzisiert**: "gemäß EU-Spezifikation gewichtet" ersetzt durch "orientiert sich an diesem Referenz-Dokument der EU-Kommission"
- **SEAL-Legend-Hint aktualisiert**: Klarstellung, dass das EU Cloud Sovereignty Framework ein Referenz-Dokument ist, kein formeller Standard
- **Disclaimer ergänzt** (evaluation-criteria.html): Hinweis auf den ursprünglichen Ausschreibungskontext, laufende BSI/ANSSI-Interpretationen und Empfehlung zur eigenen Anforderungsdefinition bei Beschaffungen

## [3.1.1] - 2026-02-18

### Changed
- **Azure SOV-6 Begründung präzisiert**: `.NET-zentriert` ersetzt durch `Lock-in liegt im Ökosystem (M365, Entra, Power Platform), nicht der Runtime – .NET ist vollständig OSS`
- **STACKIT SOV-6 Begründung erweitert**: Hinweis ergänzt, dass bei einzelnen Managed Services (z.B. Dremio Enterprise statt Trino) das Potenzial für echte Souveränität noch ungenutzt bleibt
- **SOV-6 Kriteriendefinition geschärft**: Prinzip ergänzt – Technologie-Souveränität bedeutet nicht, proprietäre Software auf EU-Infrastruktur zu hosten; echte Souveränität entsteht durch offene Technologien ohne Vendor-Abhängigkeit

## [3.1.0] - 2026-02-18

### Added
- **SAP Cloud Infrastructure (SCI)**: Neuer Provider in der Kategorie EU/Deutsche Anbieter
  - Ehemals „SAP Converged Cloud" – OpenStack-basierte IaaS für hochsensible und hochskalierbare Workloads
  - Deutsche Rechenzentren (SAP-Eigentum), 3 Availability Zonen auf SAP-eigenen Leitungswegen
  - Multi-Tenant, offen für Non-SAP-Workloads
  - **Einschränkung**: Aktuell kein vollständiger NIST-Public-Cloud-Status (kein öffentlicher Service-Katalog, keine Preisliste, kein Self-Service) – in Bewertung entsprechend berücksichtigt
  - Kontrolle: 76 (SEAL-3), Leistung: 55
  - Zertifizierungen: C5 Typ II, KRITIS, Schutzziel HOCH, EN 50600 VK3, TSI3+, VS-NfD BSI-Komponentenzulassung in Bearbeitung
  - Quelle: Inoffizielle Produktinformationen (SAP SE); begrenzte öffentliche Dokumentation

### Changed
- **Open Telekom Cloud SOV-Scores korrigiert** – Konsistenzüberarbeitung:
  - SOV-1: 75 → 87 (KfW-Staatsanteil bietet strukturellen Übernahmeschutz – Huawei-Risiko betrifft Lieferkette/Betrieb, nicht strategisch-rechtliche Ebene)
  - SOV-2: 85 → 90 (kein US-Mutterkonzern, CLOUD Act nicht anwendbar – T-Mobile US als Restrisiko)
  - SOV-3: 80 → 83 (BYOK bestätigt; Huawei-Netzzugriff als Restrisiko für Datenisolation explizit dokumentiert)
  - SOV-8: 65 → 76 (100% Ökostrom in deutschen Betrieben seit 2021, starkes DAX-Nachhaltigkeitsreporting)
  - OTC Kontrolle: ~67 → 70 (bleibt SEAL-2)
- **Microsoft DELOS Cloud korrigiert**:
  - SOV-4: 90 → 82 (kein NIST-Public-Cloud-Zugang – nur für Verwaltung zugänglich, kein Self-Service, Exit-Planung außerhalb des Verwaltungskontexts eingeschränkt)
  - Leistung: 65 → 60 (eingeschränkte öffentliche Verfügbarkeit, analog zur SAP SCI-Bewertungslogik)
  - DELOS Kontrolle: ~74 → 72 (bleibt SEAL-2)

### Fixed
- OTC SOV-Erklärungen präzisiert: SOV-1/2 unterscheiden nun klar zwischen strategisch-rechtlicher und operativer Ebene; SOV-8 mit konkreten Nachhaltigkeitsdaten belegt
- DELOS SOV-4 Erklärung: Einschränkung durch fehlenden öffentlichen Zugang explizit dokumentiert

## [3.0.2] - 2026-01-30

### Changed
- **Kriterien-Seite Restrukturierung**: SOV-Sektion in Kontrolle-Sektion integriert
  - Separate SOV-Navigation entfernt (4 statt 5 Tabs)
  - **Neues SOV-Accordion**: Provider-Tabelle und SOV-Details in einer aufklappbaren Ansicht kombiniert
  - Jeder Provider-Eintrag zeigt: Name, Kategorie, Kontrolle-Score, SEAL-Badge
  - Klick auf Provider klappt SOV-Detail-Grid mit allen 8 Kriterien auf
  - 8 SOV-Kriterien als Factor-Cards mit EU-Gewichtungen dargestellt
  - Bewertungsfaktoren durch SOV-basierte Bewertungskriterien ersetzt
  - EU Framework Link in Kontrolle-Sektion integriert

## [3.0.1] - 2026-01-30

### Changed
- **Open Telekom Cloud SOV-Scores angepasst**: Konsistentere Bewertung im Vergleich zu IONOS und STACKIT
  - SOV-1: 70 → 75 (Staatsanteil schützt vor Übernahmen)
  - SOV-2: 75 → 85 (Deutsches Recht, DSGVO-konform)
  - SOV-3: 65 → 80 (EU-Datenresidenz, BYOK verfügbar)
  - SOV-4: 55 → 65 (Telekom-Betrieb, aber Huawei-Support)
  - SOV-5: 35 → 40 (Huawei bleibt kritisch für Lieferkette)
  - SOV-6: 50 → 65 (OpenStack-basiert, offene APIs)
  - SOV-7: 65 → 85 (C5-Testat, ISO 27001, BSI-konform)
  - SOV-8: 55 → 65 (Telekom-Nachhaltigkeitsstandards)
- **OTC Kontrolle-Score**: ~57 → ~67 (bleibt SEAL-2)
- **OTC SOV-Erklärungen**: Detailliertere Begründungen

## [3.0.0] - 2026-01-30

### Major Release - EU SEAL-Integration & SOV-Framework

Diese Version integriert die EU SEAL-Kriterien (Sovereignty Effective Assurance Levels) basierend auf dem EU Cloud Sovereignty Framework.

### Added
- **SEAL-Level System**: 5-stufige Souveränitätsbewertung (SEAL-0 bis SEAL-4) basierend auf Kontrolle-Score
- **SEAL-Zonen in Matrix**: Visuelle Hintergrundbänder zeigen SEAL-Level-Bereiche
- **SEAL-Badges**: Kompakte Level-Anzeige in Provider-Cards und Tooltips
- **SOV-Kriterien (SOV-1 bis SOV-8)**: Detaillierte Souveränitätsziele gem. EU Framework
- **SOV-Panel**: Slide-in Panel mit detaillierter SOV-Aufschlüsselung pro Provider
- **SOV-Gewichtung**: EU-konforme Gewichtung der 8 Souveränitätsziele
- **Provider SOV-Scores**: Individuelle SOV-Bewertungen für alle 14 Provider
- **Provider SOV-Erklärungen**: Begründungen für jeden SOV-Score pro Provider
- **Custom Scores Hinweis**: Anzeige auf Compass-Seite wenn individuelle Kriterien angewendet wurden
- **EU Framework Links**: Direktlinks zum offiziellen EU Cloud Sovereignty Framework Dokument

### Changed
- **Kontrolle-Berechnung**: Basiert nun auf gewichteten SOV-Scores statt statischen Werten
- **Tooltip-Design**: Erweitert um SEAL-Level Anzeige mit Icon
- **Result-Cards**: Header mit SEAL-Badge ergänzt
- **Kriterien-Seite**: SOV-Sektion mit Provider-Auswahl und Detail-Ansicht

### Technical
- Neue Datenstruktur: `SOV_WEIGHTS`, `SOV_CRITERIA`, `PROVIDER_SOV_SCORES`, `PROVIDER_SOV_EXPLANATIONS`
- `calculateControlFromSov()` Funktion für gewichtete Kontrolle-Berechnung
- `getSealLevel()` Funktion für SEAL-Level Ermittlung
- `renderSealZones()` in ChartComponent für Matrix-Visualisierung
- SOV-Panel mit `openSovPanel()` / `closeSovPanel()` Funktionen

## [2.4.0] - 2026-01-29

### Changed
- **Event-Handler Modernisierung**: Alle inline `onclick` Handler zu `addEventListener` migriert
- **Keyboard-Accessibility**: Enter/Space Support für alle interaktiven Elemente hinzugefügt
- **Tabellen-Rendering refactored**: Helper-Methoden für DRY-Prinzip (`renderProviderNameCell`, `renderScoreCell`, `renderCategoryBadge`, `renderEditButton`)
- **Input-Validierung**: Score-Werte werden auf Bereich 0-100 validiert und begrenzt

### Technical
- Inline Event-Handler aus HTML entfernt (24 onclick Handler)
- Event-Binding via `data-provider-id` Attribute statt globaler Funktionen
- `validateScore()` und `validateCustomScores()` für robuste Datenvalidierung
- Slider `oninput` Handler programmatisch gebunden
- Duplizierten Code in evaluation-criteria.html entfernt (~60 Zeilen)

### Fixed
- Mobile Navigation Event-Handler funktionieren jetzt korrekt
- Theme-Toggles reagieren auf Keyboard-Events (Accessibility)

## [2.3.1] - 2026-01-29

### Changed
- **Image Optimization**: Kontextspezifische Alt-Texte für alle Bilder
- **Layout Stability**: Width/Height Attribute zur Vermeidung von CLS (Cumulative Layout Shift)
- **Performance**: Lazy Loading für Footer-Logos hinzugefügt

## [2.3.0] - 2026-01-29

### Added
- **SEO Meta Tags**: Description, Keywords, Author, Robots
- **Open Graph**: Facebook/LinkedIn Sharing-Optimierung
- **Twitter Cards**: Twitter Sharing-Optimierung
- **Schema.org**: Strukturierte Daten (WebApplication, Organization, BreadcrumbList)
- **Critical CSS**: Above-the-fold Styles inline für schnelleres Rendering
- **Skip-Links**: Accessibility-Verbesserung für Screenreader
- **sitemap.xml**: Sitemap für Suchmaschinen
- **robots.txt**: Crawler-Anweisungen

### Changed
- Font Awesome async geladen für bessere Performance

## [2.2.0] - 2026-01-29

### Added
- Initiale SEO-Grundlagen implementiert
- Canonical URLs hinzugefügt
- Preconnect für CDN-Performance

## [2.1.0] - 2026-01-25

### Added
- **Mobile Burger Menu**: Modern hamburger menu with animated icon transition for mobile devices
- **Mobile Navigation Drawer**: Slide-out drawer with glass-morphism design and smooth animations
- **Mobile Criteria Navigation**: Tab-based navigation (tablet) and dropdown selector (phone) for criteria page sections
- **Scroll Spy**: Automatic navigation state updates based on scroll position
- **Safe Area Support**: Proper padding for iPhone notch and home indicator
- **Login Page Footer**: Standard footer with Impressum link and version number on login page
- **Impressum Link**: Added legal notice link to criteria page footer

### Changed
- Header navigation now responsive with burger menu on screens ≤992px
- Dark Mode toggle moved to drawer header for better accessibility
- Improved touch targets (min. 44px) for mobile usability
- Enhanced responsive breakpoints (992px, 768px, 480px)
- Login page now uses consistent footer layout with main pages

### Technical
- Added Font Awesome 6.5.1 for menu icons
- Implemented keyboard navigation (Escape to close menu)
- Auto-close drawer on window resize to desktop
- Flexbox column layout for login overlay with footer positioning

## [2.0.1] - 2026-01-24

### Added
- Added CHANGELOG.md file to track project changes
- Added version numbers to all HTML pages (footer, bottom right)

### Changed
- Improved project documentation with version tracking

## [2.0.0] - 2026-01-23

### Major Release - Editable Criteria & Design Optimization

This is a significant release with major improvements to functionality and user experience.

### Added
- **Editable Provider Scores**: Users can now customize control and performance scores for each provider
- **Custom Score Persistence**: All score adjustments are saved in localStorage and synchronized across pages
- **Score Reset Functionality**: Ability to reset all customizations back to default values
- **Enhanced Criteria Documentation**: Comprehensive evaluation criteria page with detailed methodology
- **Real-time Score Updates**: Changes in criteria page immediately reflect in the main compass
- **Provider Edit Modal**: User-friendly interface for adjusting individual provider scores
- **Floating Action Buttons**: Quick access to "Back to Compass" and "Reset to Default" functions

### Changed
- **Complete Design Overhaul**: Modernized UI with improved visual hierarchy and spacing
- **Enhanced Color Scheme**: Refined color palette for better contrast and accessibility
- **Optimized Layout**: Better responsive behavior and improved grid systems
- **Improved Typography**: Enhanced readability with better font sizing and line heights
- **Refined Animations**: Smoother transitions and hover effects throughout
- **Better Dark Mode**: Improved dark theme with better color balance

### Technical Improvements
- Updated cross-references to use GitHub Pages URLs
- Renamed main file to `index.html` for GitHub Pages support
- Fixed broken internal links and references
- Improved code organization and documentation

### Fixed
- Fixed broken internal links and references
- Resolved layout issues in mobile viewport
- Corrected color inconsistencies in dark mode

## [1.0.0] - Initial Release

### Added
- Initial release of Sovereign Cloud Compass v3.0
- Interactive strategy slider for balancing control vs. performance
- Matrix visualization with cloud provider positioning
- Category filtering (Hyperscaler, Sovereign Clouds, EU Providers, Private Cloud, Hybrid)
- Public access mode with anonymized provider names
- Full access mode with detailed provider information (password-protected)
- Evaluation criteria documentation page (`evaluation-criteria.html`)
- Editable provider scores with localStorage persistence
- Dark mode support
- Responsive design for desktop and tablet
- Support for 14 cloud providers across 5 categories:
  - Hyperscaler: AWS, Azure, Google Cloud, Oracle Cloud
  - Sovereign Clouds: AWS European Sovereign Cloud, Microsoft DELOS Cloud
  - EU Providers: STACKIT, IONOS Cloud, Open Telekom Cloud
  - Private Cloud: OpenStack, VMware
  - Hybrid Solutions: Google Dedicated Cloud, Azure Stack HCI, AWS Outpost

### Features
- Real-time score calculation based on control/performance weighting
- Top 8 provider ranking with detailed cards
- Transparent scoring methodology documentation
- Custom score adjustments via criteria page
- Session-based authentication
- Theme persistence (light/dark mode)

---

## Version History

- **3.1.1** (2026-02-18) - SOV-6 Begründungen präzisiert: Azure Runtime vs. Ökosystem; STACKIT Dremio-Hinweis; Prinzip in Kriterien-Seite
- **3.1.0** (2026-02-18) - SAP Cloud Infrastructure hinzugefügt; OTC + DELOS Scores korrigiert
- **3.0.2** (2026-01-30) - Kriterien-Seite: SOV-Sektion in Kontrolle integriert
- **3.0.1** (2026-01-30) - OTC SOV-Scores Anpassung: Konsistentere Bewertung
- **3.0.0** (2026-01-30) - EU SEAL-Integration: SOV-Framework, SEAL-Level, SOV-Panel
- **2.4.0** (2026-01-29) - Code-Modernisierung: Event-Handler, Tabellen-Refactoring, Input-Validierung
- **2.3.1** (2026-01-29) - Image Optimization: Alt-Texte, Width/Height, Lazy Loading
- **2.3.0** (2026-01-29) - SEO: Meta Tags, Open Graph, Schema.org, Critical CSS
- **2.2.0** (2026-01-29) - SEO-Grundlagen und Canonical URLs
- **2.1.0** (2026-01-25) - Mobile optimization with burger menu navigation
- **2.0.1** (2026-01-24) - Added changelog and version tracking
- **2.0.0** (2026-01-23) - GitHub Pages optimization and documentation updates
- **1.0.0** - Initial public release with full feature set

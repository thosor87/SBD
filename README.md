# Sovereignty by Design Platform (SBD)

**BTC AG × STACKIT** – Ein geführtes 3-Schritt-Tool zur Cloud-Souveränitätsbewertung.

Basierend auf dem [Sovereign Cloud Compass (SCC)](https://github.com/btc-ag/SCC) erweitert diese Plattform den Provider-Vergleich um ein ES³-kompatibles Organisations-Assessment und gibt eine provider-spezifische Empfehlung.

---

## Was ist SBD?

Drei Schritte, eine klare Empfehlung:

1. **Provider wählen** – Vollständiger SCC-Provider-Vergleich (16 Anbieter, EU SEAL, BSI C3A v1.0)
2. **Organisation bewerten** – ES³-kompatibles Self-Assessment in 9 Souveränitätsdimensionen
3. **Ergebnis & Empfehlung** – Reifegrad-Auswertung mit provider-spezifischer Einschätzung

### Das ES³-Assessment

Das Organisations-Assessment basiert auf dem **European Sovereign Stack Standard (ES³)** – dem ersten europäischen Standard für digitale Souveränität, entwickelt von Schwarz Digits/STACKIT und BDO-auditiert.

9 Dimensionen × 3 Ebenen (Regulatorisch / Organisatorisch / Technisch):

| Dimension | Beschreibung |
|---|---|
| Strategic Sovereignty | Strategische Verankerung digitaler Souveränität |
| Legal & Jurisdictional | Schutz vor Fremdrechtsrisiken (US CLOUD Act etc.) |
| Data | Kontrolle über Daten und Speicherort |
| Operational | Betrieb ohne Hersteller-Lock-in |
| Supply Chain | Transparenz kritischer Abhängigkeiten |
| Technology | Offene Standards, Portabilität |
| Security & Compliance | EU-konforme Sicherheitsoperationen |
| Environmental Sustainability | Ressourceneffizienz und Resilienz |
| Artificial Intelligence | KI-Governance und Kontrolle über KI-Systeme |

**Scoring:** Weakest-Link-Prinzip – das Gesamt-Level bestimmt die schwächste Dimension.

**Reifegrade (SML):**
- Initial (0–25)
- Managed (26–50)
- Advanced (51–75)
- Future-Proof (76–100)

---

## Schnellstart (lokal)

Kein Build-Prozess, kein npm install – einfach die `index.html` im Browser öffnen:

```bash
open index.html
```

Oder per lokalen Server (empfohlen für ES-Module):

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

---

## Tests

```bash
node --test tests/*.mjs
```

Erwartung: 29 Tests grün (SML-Scoring, Fragebogen-Validierung, Provider-Match-Logik).

---

## Technologie

- Vanilla JS, ES Modules (kein Build-Prozess, offline-fähig)
- Node.js `node --test` für Unit-Tests der Logik-Module
- Basiert auf SCC v4.0.0 (EU SEAL, BSI C3A v1.0, SOV-7)

## Architektur (neue Module)

| Datei | Verantwortung |
|---|---|
| `js/modules/sml-assessment.js` | SML-Scoring-Logik (Dimension-Scores, Weakest-Link) |
| `js/data/es3-questions.js` | Fragebogen: 9 Dimensionen × 3 Fragen |
| `js/modules/provider-match.js` | Match-Logik: Provider + SML-Level → Empfehlung |
| `js/sbd-assessment-ui.js` | Assessment-UI (Step 2) |
| `js/sbd-result-ui.js` | Ergebnis-UI (Step 3) |

---

## Lizenz

Dual-License: **AGPL v3** (Open Source) oder kommerzielle Lizenz.
Kontakt für kommerzielle Lizenzanfragen: **cloud@btc-ag.com**

Basiert auf dem Sovereign Cloud Compass (SCC) © 2025 BTC Business Technology Consulting AG.

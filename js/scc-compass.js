/**
 * Sovereign Cloud Compass - Haupt-Controller
 *
 * @fileoverview Orchestriert alle Komponenten der Hauptanwendung
 * @module scc-compass
 */

(function() {
    'use strict';

    // Abhängigkeiten prüfen
    const { BASE_PROVIDERS, LEGEND_DATA, PROVIDER_CATEGORIES, anonymizeProviders } = window.SCC_DATA || {};

    /**
     * Strategie-Labels basierend auf Slider-Wert
     * @readonly
     */
    const STRATEGY_LABELS = Object.freeze({
        CONTROL_FOCUSED: 'Kontrolle-fokussiert',
        CONTROL_ORIENTED: 'Kontrolle-orientiert',
        BALANCED: 'Ausgewogen',
        PERFORMANCE_ORIENTED: 'Leistungs-orientiert',
        PERFORMANCE_FOCUSED: 'Leistungs-fokussiert'
    });

    /**
     * Schwellenwerte für Strategie-Labels
     * @readonly
     */
    const STRATEGY_THRESHOLDS = Object.freeze({
        CONTROL_FOCUSED: 20,
        CONTROL_ORIENTED: 40,
        BALANCED: 60,
        PERFORMANCE_ORIENTED: 80
    });

    // State
    let currentProviders = [];
    let isPublicAccess = false;
    let activeCategories = new Set(Object.values(PROVIDER_CATEGORIES));
    let es3OnlyFilter = false;
    let rafId = null;

    // DOM-Element-Cache
    const elements = {};

    /**
     * Initialisiert DOM-Element-Cache
     * @private
     */
    function cacheElements() {
        elements.slider = document.getElementById('strategySlider');
        elements.sliderThumb = document.getElementById('sliderThumb');
        elements.valueDisplay = document.getElementById('valueDisplay');
        elements.chartCanvas = document.getElementById('chartCanvas');
        elements.resultsGrid = document.getElementById('resultsGrid');
        elements.legendGrid = document.getElementById('legendGrid');
        elements.passwordOverlay = document.getElementById('passwordOverlay');
        elements.protectedContent = document.getElementById('protectedContent');
        elements.accessBadge = document.getElementById('accessBadge');
        elements.passwordInput = document.getElementById('passwordInput');
        elements.passwordError = document.getElementById('passwordError');
        // Event-Handler Elemente
        elements.loginThemeToggle = document.getElementById('loginThemeToggle');
        elements.publicButton = document.getElementById('publicButton');
        elements.passwordButton = document.getElementById('passwordButton');
        elements.drawerThemeToggle = document.getElementById('drawerThemeToggle');
        elements.desktopThemeToggle = document.getElementById('desktopThemeToggle');
        elements.customScoresHint = document.getElementById('customScoresHint');
    }

    /**
     * Wendet Custom Scores auf Provider an
     * @param {Array} providers - Basis-Provider
     * @returns {Array} Provider mit angewendeten Custom Scores
     */
    function applyCustomScores(providers) {
        const customScores = StorageManager.loadCustomScores();

        return providers.map(provider => {
            // Versuche sowohl ID als auch Name-basierte Keys
            const custom = customScores[provider.id] ||
                          customScores[provider.name.toLowerCase().replace(/\s+/g, '-')];

            if (custom) {
                return {
                    ...provider,
                    control: custom.control !== undefined ? custom.control : provider.control,
                    performance: custom.performance !== undefined ? custom.performance : provider.performance
                };
            }
            return { ...provider };
        });
    }

    /**
     * Prüft ob Custom Scores vorhanden sind und zeigt/versteckt Hinweis
     */
    function updateCustomScoresHint() {
        if (!elements.customScoresHint) return;

        const customScores = StorageManager.loadCustomScores();
        const hasCustomScores = Object.keys(customScores).length > 0;

        elements.customScoresHint.style.display = hasCustomScores ? 'flex' : 'none';
    }

    /**
     * Berechnet den gewichteten Score
     * @param {Object} provider
     * @param {number} sliderValue - 0 (Kontrolle) bis 100 (Leistung)
     * @returns {number}
     */
    function calculateScore(provider, sliderValue) {
        const controlWeight = (100 - sliderValue) / 100;
        const performanceWeight = sliderValue / 100;
        return (provider.control * controlWeight) + (provider.performance * performanceWeight);
    }

    /**
     * Gibt den Strategie-Text zurück
     * @param {number} value - Slider-Wert
     * @returns {string}
     */
    function getStrategyText(value) {
        const controlWeight = 100 - value;

        let label;
        if (value < STRATEGY_THRESHOLDS.CONTROL_FOCUSED) {
            label = STRATEGY_LABELS.CONTROL_FOCUSED;
        } else if (value < STRATEGY_THRESHOLDS.CONTROL_ORIENTED) {
            label = STRATEGY_LABELS.CONTROL_ORIENTED;
        } else if (value < STRATEGY_THRESHOLDS.BALANCED) {
            label = STRATEGY_LABELS.BALANCED;
        } else if (value < STRATEGY_THRESHOLDS.PERFORMANCE_ORIENTED) {
            label = STRATEGY_LABELS.PERFORMANCE_ORIENTED;
        } else {
            label = STRATEGY_LABELS.PERFORMANCE_FOCUSED;
        }

        return `${label} (${controlWeight}:${value})`;
    }

    /**
     * Aktualisiert die Visualisierung
     * @param {number} sliderValue
     */
    function updateVisualization(sliderValue) {
        // Thumb-Position aktualisieren
        if (elements.sliderThumb) {
            elements.sliderThumb.style.left = `${sliderValue}%`;
        }

        // Strategie-Text aktualisieren
        if (elements.valueDisplay) {
            elements.valueDisplay.textContent = getStrategyText(sliderValue);
        }

        // Scores berechnen und sortieren
        const scoredProviders = currentProviders
            .filter(p => activeCategories.has(p.category))
            .filter(p => !es3OnlyFilter || SCC_DATA.getProviderES3?.(p.id)?.certified)
            .map(p => ({ ...p, score: calculateScore(p, sliderValue) }))
            .sort((a, b) => b.score - a.score);

        // Chart und Results aktualisieren
        ChartComponent.render(elements.chartCanvas, scoredProviders);
        renderResults(scoredProviders);
    }

    // ========================================
    // Hover-Popup mit Stern-Spider auf Result-Cards
    // ========================================
    let cardHoverPopupEl = null;

    function ensureCardHoverPopup() {
        if (cardHoverPopupEl) return cardHoverPopupEl;
        cardHoverPopupEl = document.createElement('div');
        cardHoverPopupEl.className = 'card-hover-popup';
        cardHoverPopupEl.setAttribute('aria-hidden', 'true');
        document.body.appendChild(cardHoverPopupEl);
        return cardHoverPopupEl;
    }

    function showCardHoverPopup(provider, anchorEl) {
        const popup = ensureCardHoverPopup();
        const seal = SCC_DATA.getSealLevel ? SCC_DATA.getSealLevel(provider.control) : null;
        const c3aScores = SCC_DATA.getProviderC3AScores ? SCC_DATA.getProviderC3AScores(provider.id) : null;
        const c3aCls = c3aScores && c3aScores.total >= 75 ? 'high' : (c3aScores && c3aScores.total >= 50 ? 'medium' : 'low');
        const es3Data = SCC_DATA.getProviderES3 ? SCC_DATA.getProviderES3(provider.id) : null;

        popup.innerHTML = `
            <div class="chp-card">
                <div class="chp-star">${renderStarSvg(provider.id, 50)}</div>
                <div class="chp-info">
                    <div class="chp-name">
                        <span class="chp-name-dot" style="background:${provider.color}"></span>${provider.name}
                    </div>
                    <div class="chp-cat">${provider.category}</div>
                    <div class="chp-badges">
                        ${seal ? `<span class="chp-badge seal-badge seal-badge-${seal.level}"><i class="fa-solid fa-shield-halved"></i> ${seal.shortLabel}</span>` : ''}
                        ${c3aScores ? `<span class="chp-badge c3a-badge c3a-badge-${c3aCls}"><i class="fa-solid fa-circle-check"></i> C3A ${c3aScores.total}</span>` : ''}
                        ${es3Data?.certified ? `<span class="chp-badge es3-badge es3-badge-certified" title="${es3Data.note}"><i class="fa-solid fa-star"></i> ES³ certified</span>` : ''}
                    </div>
                    <div class="chp-metrics">
                        <div class="chp-metric">
                            <div class="chp-metric-label">Kontrolle</div>
                            <div class="chp-metric-value">${provider.control}</div>
                        </div>
                        <div class="chp-metric">
                            <div class="chp-metric-label">Leistung</div>
                            <div class="chp-metric-value">${provider.performance}</div>
                        </div>
                    </div>
                    <div class="chp-cta"><i class="fa-solid fa-arrow-right"></i> Klick für vollständige Details</div>
                </div>
            </div>
        `;
        popup.classList.add('visible');
        positionCardHoverPopup(anchorEl);
    }

    function positionCardHoverPopup(anchorEl) {
        const popup = ensureCardHoverPopup();
        const rect = anchorEl.getBoundingClientRect();
        const ttW = popup.offsetWidth || 400;
        const ttH = popup.offsetHeight || 220;
        const margin = 12;

        // Default: rechts neben Karte, vertikal mittig auf Karten-Top
        let left = rect.right + margin;
        let top = rect.top;

        // Falls rechts kein Platz: links
        if (left + ttW > window.innerWidth - 12) {
            left = rect.left - margin - ttW;
        }
        // Falls auch links kein Platz: oberhalb der Karte
        if (left < 12) {
            left = Math.max(12, Math.min(rect.left, window.innerWidth - ttW - 12));
            top = rect.top - ttH - margin;
            // Falls oben kein Platz: unten
            if (top < 12) {
                top = rect.bottom + margin;
            }
        }
        top = Math.max(12, Math.min(top, window.innerHeight - ttH - 12));

        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
    }

    function hideCardHoverPopup() {
        if (cardHoverPopupEl) cardHoverPopupEl.classList.remove('visible');
    }

    /**
     * Rendert die Ergebnis-Cards
     * @param {Array} scoredProviders
     */
    function renderResults(scoredProviders) {
        if (!elements.resultsGrid) return;

        const topProviders = scoredProviders.slice(0, 8);
        const rankings = [];

        // Rankings berechnen (mit Gleichstand)
        topProviders.forEach((provider, index) => {
            if (index === 0) {
                rankings.push(1);
            } else {
                const isTied = Math.abs(provider.score - topProviders[index - 1].score) < 0.01;
                rankings.push(isTied ? rankings[index - 1] : index + 1);
            }
        });

        // HTML generieren
        const fragment = document.createDocumentFragment();

        topProviders.forEach((provider, index) => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.dataset.providerId = provider.id;
            card.style.cursor = 'pointer';
            if (rankings[index] === 1) card.classList.add('winner');

            // View-Mode: ES³-Einschätzung oder EU CSF SEAL
            const viewMode = SCC_DATA.getViewMode ? SCC_DATA.getViewMode() : 'es3';

            // ES³-Daten
            const es3Data = SCC_DATA.getProviderES3 ? SCC_DATA.getProviderES3(provider.id) : null;
            const es3DerivedLevel = SCC_DATA.getProviderES3DerivedLevel ? SCC_DATA.getProviderES3DerivedLevel(provider.id) : null;

            // SEAL-Level ermitteln
            const seal = SCC_DATA.getSealLevel ? SCC_DATA.getSealLevel(provider.control) : null;
            const sealBadge = seal ? `
                <div class="seal-badge seal-badge-${seal.level}" title="${seal.label}">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span>${seal.shortLabel}</span>
                </div>
            ` : '';

            // C3A-Badge ermitteln (BSI Operationalisierung)
            const c3aScores = SCC_DATA.getProviderC3AScores ? SCC_DATA.getProviderC3AScores(provider.id) : null;
            const c3aBadge = c3aScores ? `
                <span class="c3a-badge c3a-badge-${c3aScores.total >= 75 ? 'high' : c3aScores.total >= 50 ? 'medium' : 'low'}" title="BSI C3A v1.0 – aggregierter Score">
                    <i class="fa-solid fa-circle-check"></i> C3A ${c3aScores.total}
                </span>
            ` : '';

            // ES³-Certified Badge (immer, unabhängig vom View-Mode)
            const es3CertBadge = es3Data?.certified ? `
                <span class="es3-badge es3-badge-certified" title="${es3Data.note}">
                    <i class="fa-solid fa-star"></i> ES³ certified
                </span>` : '';

            // ES³-Derived Badge (BTC-Einschätzung via SOV-Scores)
            const es3DerivedBadge = es3DerivedLevel ? `
                <div class="seal-badge seal-badge-es3 es3-sml-${es3DerivedLevel.id}"
                     title="BTC-Einschätzung nach ES³ (kein offizielles ES³-Audit) — ${es3DerivedLevel.label}">
                    <i class="fa-solid fa-star"></i>
                    <span>${es3DerivedLevel.shortLabel}</span>
                </div>
            ` : '';

            // Badges je View-Mode zusammensetzen
            const primaryBadge = viewMode === 'es3' ? es3DerivedBadge : sealBadge;
            const secondaryBadge = viewMode === 'es3' ? es3CertBadge : c3aBadge;

            card.innerHTML = `
                <div class="result-header">
                    <div class="result-rank">#${rankings[index]}</div>
                    <div class="result-badges">${primaryBadge}${secondaryBadge}</div>
                </div>
                <div class="result-name">${provider.name}</div>
                <div class="result-description">${provider.description}</div>
                <div class="result-metrics">
                    <span>Kontrolle: ${provider.control}</span>
                    <span>Leistung: ${provider.performance}</span>
                </div>
                <div class="result-score">Score: ${provider.score.toFixed(1)}</div>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${provider.score}%"></div>
                </div>
                <div class="result-card-hint">
                    <i class="fa-solid fa-arrow-right"></i> Klicken für SOV-Details
                </div>
            `;

            // Klick öffnet Sov-Panel (Hover-Popup nur in der Matrix, nicht hier auf den Cards)
            card.addEventListener('click', () => {
                window._selectedProvider = provider.id;
                openSovPanel(provider);
            });

            fragment.appendChild(card);
        });

        elements.resultsGrid.innerHTML = '';
        elements.resultsGrid.appendChild(fragment);
    }

    /**
     * Initialisiert die Legende
     * @param {boolean} isPublic
     */
    function initializeLegend(isPublic) {
        if (!elements.legendGrid) return;

        const legends = isPublic ? LEGEND_DATA.anonymous : LEGEND_DATA.full;

        elements.legendGrid.innerHTML = legends.map(item => `
            <div class="legend-item">
                <div class="legend-dot" style="background: ${item.color};"></div>
                <span class="legend-text">${item.text}</span>
            </div>
        `).join('');
    }

    // ========================================
    // SOV Panel Functions
    // ========================================

    /**
     * Öffnet das SOV-Detail-Panel für einen Provider
     * @param {Object} provider - Provider-Objekt
     */
    /**
     * Rendert den C3A-Block (BSI-Operationalisierung) für einen Provider
     * @param {string} providerId
     * @returns {string} HTML
     */
    function renderC3ABlock(providerId) {
        const c3aCriteria   = SCC_DATA.C3A_CRITERIA;
        const c3aResultsMeta = SCC_DATA.C3A_RESULTS;
        const assessment    = SCC_DATA.getProviderC3A ? SCC_DATA.getProviderC3A(providerId) : null;
        const scores        = SCC_DATA.getProviderC3AScores ? SCC_DATA.getProviderC3AScores(providerId) : null;
        if (!c3aCriteria || !assessment || !scores) return '';

        const sovGroups = {};
        for (const [id, meta] of Object.entries(c3aCriteria)) {
            if (!sovGroups[meta.sov]) sovGroups[meta.sov] = [];
            sovGroups[meta.sov].push({ id, ...meta });
        }
        const sovLabels = {
            sov1: 'Strategic', sov2: 'Legal', sov3: 'Data',
            sov4: 'Operational', sov5: 'Supply Chain', sov6: 'Technology'
        };

        const groupBlocks = Object.entries(sovGroups).map(([sovKey, criteria]) => {
            const aggScore = scores[sovKey] ?? 0;
            const cls = aggScore >= 75 ? 'high' : aggScore >= 50 ? 'medium' : 'low';
            const criteriaList = criteria.map(c => {
                const a = assessment[c.id];
                if (!a) return '';
                const meta = c3aResultsMeta[a.result.toUpperCase()] || c3aResultsMeta.UNKNOWN;
                const variantBadge = a.variant ? `<span class="c3a-variant">${a.variant}</span>` : '';
                const note = a.note ? `<span class="c3a-criterion-note">${a.note}</span>` : '';
                return `
                    <li class="c3a-criterion c3a-criterion-${a.result}">
                        <i class="fa-solid ${meta.icon}" style="color: ${meta.color}"></i>
                        <span class="c3a-criterion-id">${c.id}</span>
                        <span class="c3a-criterion-name">${c.name}</span>
                        ${variantBadge}
                        ${note}
                    </li>
                `;
            }).join('');
            return `
                <details class="c3a-sov-group" data-sov="${sovKey}">
                    <summary class="c3a-sov-summary">
                        <span class="c3a-sov-label">${sovKey.toUpperCase()} ${sovLabels[sovKey]}</span>
                        <span class="c3a-sov-count">${criteria.length} Kriterien</span>
                        <span class="c3a-sov-score c3a-sov-score-${cls}">${aggScore}</span>
                        <i class="fa-solid fa-chevron-down c3a-chevron"></i>
                    </summary>
                    <ul class="c3a-criteria-list">${criteriaList}</ul>
                </details>
            `;
        }).join('');

        const totalCls = scores.total >= 75 ? 'high' : scores.total >= 50 ? 'medium' : 'low';
        return `
            <div class="c3a-block">
                <div class="c3a-block-header">
                    <h4 class="c3a-block-title">
                        <i class="fa-solid fa-shield-halved"></i>
                        BSI C3A v1.0 — Operationalisierung
                    </h4>
                    <div class="c3a-block-total c3a-block-total-${totalCls}">
                        <span class="c3a-block-total-label">Gesamt</span>
                        <span class="c3a-block-total-value">${scores.total}</span>
                        <span class="c3a-block-total-of">/ 100</span>
                    </div>
                </div>
                <div class="c3a-block-groups">${groupBlocks}</div>
                <p class="c3a-block-hint">
                    <i class="fa-solid fa-info-circle"></i>
                    Operationalisierung des EU CSF gemäß
                    <a href="${SCC_DATA.C3A_SOURCE.url}" target="_blank" rel="noopener">${SCC_DATA.C3A_SOURCE.title}</a>.
                </p>
            </div>
        `;
    }

    /**
     * Rendert die 6-Speichen-Sternsgrafik (BSI C3A) für einen Provider als SVG-String.
     * Klein und kompakt für den Sov-Panel-Header oder Hover-Popups.
     * @param {string} providerId
     * @param {number} radius - Stern-Radius in Pixeln (Default 50)
     * @returns {string} HTML/SVG
     */
    function renderStarSvg(providerId, radius = 50) {
        const provider = SCC_DATA.getProviderById ? SCC_DATA.getProviderById(providerId) : null;
        const c3aScores = SCC_DATA.getProviderC3AScores ? SCC_DATA.getProviderC3AScores(providerId) : null;
        if (!provider || !c3aScores) return '';

        const r = radius;
        const sovs = [c3aScores.sov1, c3aScores.sov2, c3aScores.sov3, c3aScores.sov4, c3aScores.sov5, c3aScores.sov6];
        const labels = ['Strategie', 'Recht', 'Daten', 'Betrieb', 'Lieferkette', 'Technologie'];
        const n = sovs.length;

        const points = sovs.map((val, i) => {
            const angle = (-Math.PI / 2) + (i / n) * 2 * Math.PI;
            const radiusVal = (val / 100) * r;
            return [Math.cos(angle) * radiusVal, Math.sin(angle) * radiusVal];
        });
        const path = points.map((pt, i) => (i === 0 ? 'M' : 'L') + pt[0].toFixed(1) + ',' + pt[1].toFixed(1)).join(' ') + ' Z';

        const refRings = [25, 50, 75, 100].map(pct =>
            `<circle r="${(pct/100) * r}" fill="none" stroke="rgba(127,127,127,0.18)" stroke-width="1" stroke-dasharray="${pct === 100 ? '0' : '2 3'}"/>`
        ).join('');

        const axes = sovs.map((_, i) => {
            const a = (-Math.PI/2) + (i/n) * 2 * Math.PI;
            const x2 = (Math.cos(a) * r).toFixed(1);
            const y2 = (Math.sin(a) * r).toFixed(1);
            return `<line x1="0" y1="0" x2="${x2}" y2="${y2}" stroke="rgba(127,127,127,0.15)" stroke-width="1"/>`;
        }).join('');

        const dots = sovs.map((val, i) => {
            const a = (-Math.PI/2) + (i/n) * 2 * Math.PI;
            const radiusVal = (val/100) * r;
            const dx = Math.cos(a) * radiusVal;
            const dy = Math.sin(a) * radiusVal;
            return `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="3" fill="white" stroke="${provider.color}" stroke-width="1.5"/>`;
        }).join('');

        const axisLabels = sovs.map((_, i) => {
            const a = (-Math.PI/2) + (i/n) * 2 * Math.PI;
            const lr = r + 14;
            const lx = Math.cos(a) * lr;
            const ly = Math.sin(a) * lr;
            return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="700" fill="var(--text-secondary)">${labels[i]}</text>`;
        }).join('');

        const padding = 40; // Platz für längste Labels („Technologie", „Lieferkette")
        const vb = -(r + padding);
        const sz = (r + padding) * 2;
        return `
            <svg viewBox="${vb} ${vb} ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg" class="provider-star-svg">
                ${refRings}
                ${axes}
                <path d="${path}" fill="${provider.color}" fill-opacity="0.45" stroke="${provider.color}" stroke-width="2" stroke-linejoin="round"/>
                ${dots}
                ${axisLabels}
                <text x="0" y="4" text-anchor="middle" font-size="14" font-weight="800" fill="${provider.color}">${c3aScores.total}</text>
            </svg>
        `;
    }

    /**
     * Rendert den SOV-7-Compliance-Drilldown-Block (analog renderC3ABlock)
     * @param {string} providerId
     * @returns {string} HTML
     */
    function renderSov7Block(providerId) {
        const sov7Criteria = SCC_DATA.SOV7_CRITERIA;
        const c3aResultsMeta = SCC_DATA.C3A_RESULTS;
        const assessment = SCC_DATA.getProviderSov7 ? SCC_DATA.getProviderSov7(providerId) : null;
        const aggScore = SCC_DATA.getProviderSov7Scores ? SCC_DATA.getProviderSov7Scores(providerId) : null;
        if (!sov7Criteria || !assessment || aggScore == null) return '';

        const items = Object.entries(sov7Criteria).map(([id, meta]) => {
            const a = assessment[id];
            if (!a) return '';
            const resultMeta = c3aResultsMeta[a.result.toUpperCase()] || c3aResultsMeta.UNKNOWN;
            const note = a.note ? `<span class="c3a-criterion-note">${a.note}</span>` : '';
            return `
                <li class="c3a-criterion c3a-criterion-${a.result}">
                    <i class="fa-solid ${resultMeta.icon}" style="color: ${resultMeta.color}"></i>
                    <span class="c3a-criterion-id">${id}</span>
                    <span class="c3a-criterion-name">${meta.name}</span>
                    ${note}
                </li>
            `;
        }).join('');

        const totalCls = aggScore >= 75 ? 'high' : aggScore >= 50 ? 'medium' : 'low';
        return `
            <div class="c3a-block">
                <div class="c3a-block-header">
                    <h4 class="c3a-block-title">
                        <i class="fa-solid fa-shield-alt"></i>
                        SOV-7 Sicherheits-Compliance
                    </h4>
                    <div class="c3a-block-total c3a-block-total-${totalCls}">
                        <span class="c3a-block-total-label">Gesamt</span>
                        <span class="c3a-block-total-value">${aggScore}</span>
                        <span class="c3a-block-total-of">/ 100</span>
                    </div>
                </div>
                <ul class="c3a-criteria-list" style="border-top:none; padding:0.4rem 0 0">
                    ${items}
                </ul>
                <p class="c3a-block-hint">
                    <i class="fa-solid fa-info-circle"></i>
                    Eigener 10-Punkte-Compliance-Katalog des SCC. SOV-7 wird von BSI C3A bewusst nicht abgedeckt
                    (das BSI verweist hier auf C5:2026 / IT-Grundschutz).
                </p>
            </div>
        `;
    }

    /**
     * Rendert den Quellen-Block für einen Provider
     * @param {string} providerId
     * @returns {string} HTML
     */
    function renderSourcesBlock(providerId) {
        const sources = SCC_DATA.getProviderSources ? SCC_DATA.getProviderSources(providerId) : [];
        if (!sources.length) return '';
        const items = sources.map(s => `
            <li class="provider-source-item">
                <i class="fa-solid fa-link"></i>
                <a href="${s.url}" target="_blank" rel="noopener noreferrer"
                   data-source-provider="${providerId}"
                   data-source-host="${(() => { try { return new URL(s.url).host; } catch (e) { return ''; } })()}">${s.title}</a>
            </li>
        `).join('');
        return `
            <div class="provider-sources-block">
                <h4 class="provider-sources-title">
                    <i class="fa-solid fa-book-bookmark"></i>
                    Quellen
                </h4>
                <ul class="provider-sources-list">${items}</ul>
            </div>
        `;
    }

    function openSovPanel(provider) {
        const panel = document.getElementById('sovPanel');
        const overlay = document.getElementById('sovPanelOverlay');
        const providerName = document.getElementById('sovPanelProviderName');
        const sealBadge = document.getElementById('sovPanelSealBadge');
        const content = document.getElementById('sovPanelContent');

        if (!panel || !overlay) return;

        // Track: welche Provider werden geöffnet?
        const sealForTrack = SCC_DATA.getSealLevel ? SCC_DATA.getSealLevel(provider.control) : null;
        track('open-sov-panel', {
            provider: provider.id,
            seal: sealForTrack ? sealForTrack.level : null,
            mode: SCC_DATA.getAuditMode ? SCC_DATA.getAuditMode() : 'c1'
        });

        // Header aktualisieren
        providerName.textContent = provider.name;

        // SEAL- + C3A- + Gesamt-Badge im statischen Panel-Header
        const seal = SCC_DATA.getSealLevel ? SCC_DATA.getSealLevel(provider.control) : null;
        const c3aScoresHeader = SCC_DATA.getProviderC3AScores ? SCC_DATA.getProviderC3AScores(provider.id) : null;
        const c3aClsHeader = c3aScoresHeader && c3aScoresHeader.total >= 75 ? 'high'
            : (c3aScoresHeader && c3aScoresHeader.total >= 50 ? 'medium' : 'low');
        const gesamtScore = (typeof provider.score === 'number') ? provider.score.toFixed(1) : null;
        const es3DataHeader = SCC_DATA.getProviderES3 ? SCC_DATA.getProviderES3(provider.id) : null;
        sealBadge.innerHTML = `
            ${seal ? `<span class="seal-badge seal-badge-${seal.level}">
                <i class="fa-solid fa-shield-halved"></i> ${seal.shortLabel}
            </span>` : ''}
            ${c3aScoresHeader ? `<span class="c3a-badge c3a-badge-${c3aClsHeader}" title="BSI C3A v1.0 — ungewichteter Mittelwert über die 6 SOV-Buckets (SOV-1…6 aus C3A-Aggregation)">
                <i class="fa-solid fa-circle-check"></i> C3A ${c3aScoresHeader.total}
            </span>` : ''}
            ${gesamtScore !== null ? `<span class="overall-badge" title="Gesamt-Score gemäß aktuellem Slider (Kontrolle vs. Leistung gewichtet)">
                <i class="fa-solid fa-chart-line"></i> Gesamt ${gesamtScore}
            </span>` : ''}
            ${es3DataHeader?.certified ? `<span class="es3-badge es3-badge-certified" title="${es3DataHeader.note}"><i class="fa-solid fa-star"></i> ES³ certified (BDO)</span>` : ''}
        `;

        // SOV-Scores und Erklärungen laden
        const sovScores = SCC_DATA.getProviderSovScores ? SCC_DATA.getProviderSovScores(provider.id) : null;
        const sovExplanations = SCC_DATA.getProviderSovExplanations ? SCC_DATA.getProviderSovExplanations(provider.id) : null;
        const sovCriteria = SCC_DATA.SOV_CRITERIA;

        if (sovScores && sovCriteria) {
            const kontrolle = provider.control;
            const c3aScores = SCC_DATA.getProviderC3AScores ? SCC_DATA.getProviderC3AScores(provider.id) : null;
            const c3aAssessment = SCC_DATA.getProviderC3A ? SCC_DATA.getProviderC3A(provider.id) : null;
            const c3aResultsMeta = SCC_DATA.C3A_RESULTS;
            const c3aCriteria = SCC_DATA.C3A_CRITERIA;
            const sov7Assessment = SCC_DATA.getProviderSov7 ? SCC_DATA.getProviderSov7(provider.id) : null;
            const sov7Criteria = SCC_DATA.SOV7_CRITERIA;

            // Quelle pro SOV
            const SOV_SOURCE = {
                sov1: { tag: 'C3A', title: 'Aus BSI C3A v1.0 aggregiert (4 Kriterien)' },
                sov2: { tag: 'C3A', title: 'Aus BSI C3A v1.0 aggregiert (3 Kriterien)' },
                sov3: { tag: 'C3A', title: 'Aus BSI C3A v1.0 aggregiert (5 Kriterien)' },
                sov4: { tag: 'C3A', title: 'Aus BSI C3A v1.0 aggregiert (10 Kriterien)' },
                sov5: { tag: 'C3A', title: 'Aus BSI C3A v1.0 aggregiert (5 Kriterien)' },
                sov6: { tag: 'C3A', title: 'Aus BSI C3A v1.0 aggregiert (3 Kriterien)' },
                sov7: { tag: 'SOV-7', title: 'Aus eigenem SOV-7 Compliance-Katalog aggregiert (10 Kriterien)' },
                sov8: { tag: 'Experten', title: 'Experten-Einschätzung (BSI-Mandat deckt SOV-8 nicht ab)' }
            };

            // Aktueller Audit-Mode (C1/C2) für Drilldown-Logik
            const auditMode = SCC_DATA.getAuditMode ? SCC_DATA.getAuditMode() : 'c1';

            // Hilfsfunktion: Liste der C3A-Einzelkriterien einer SOV-Kategorie
            function buildC3ACriteriaList(sovKey) {
                if (!c3aAssessment || !c3aCriteria) return '';
                const items = Object.entries(c3aCriteria)
                    .filter(([_, meta]) => meta.sov === sovKey)
                    .map(([id, meta]) => {
                        const a = c3aAssessment[id];
                        if (!a) return '';

                        // Effective Result je nach Audit-Mode (C1/C2)
                        // DE-Variante: meta.deVariant (z. B. 'C4' bei SOV-3-01) oder Default 'C2'
                        let effectiveResult = a.result;
                        let downgraded = false;          // Score wurde reduziert (pass → partial)
                        let c1NotEnough = false;         // Variante reicht im C2-Modus nicht (informativ)
                        const deVariant = meta.deVariant || 'C2';

                        if (auditMode === 'c2' && meta.variants && a.variant && a.variant !== deVariant) {
                            c1NotEnough = true;
                            if (a.result === 'pass') {
                                effectiveResult = 'partial';
                                downgraded = true;
                            }
                        }

                        const resultMeta = c3aResultsMeta[effectiveResult.toUpperCase()] || c3aResultsMeta.UNKNOWN;
                        const variantBadge = a.variant
                            ? `<span class="c3a-variant${c1NotEnough ? ' c3a-variant-downgraded' : ''}" title="${c1NotEnough ? a.variant + ' reicht im DE-Modus (C2) nicht aus' : ''}">${a.variant}</span>`
                            : '';
                        const note = a.note ? `<span class="c3a-criterion-note">${a.note}</span>` : '';
                        const downgradeNote = c1NotEnough
                            ? `<span class="c3a-criterion-downgrade-note">
                                 <i class="fa-solid fa-arrow-down"></i>
                                 ${
                                    downgraded
                                        ? `${a.variant} reicht für DE nicht — dieses Kriterium: 50 statt 100`
                                        : `${a.variant} reicht für DE nicht`
                                 }
                               </span>`
                            : '';

                        return `
                            <li class="c3a-criterion c3a-criterion-${effectiveResult}${c1NotEnough ? ' c3a-criterion-downgraded' : ''}">
                                <i class="fa-solid ${resultMeta.icon}" style="color: ${resultMeta.color}"></i>
                                <span class="c3a-criterion-id">${id}</span>
                                <span class="c3a-criterion-name">${meta.name}</span>
                                ${variantBadge}
                                ${note}
                                ${downgradeNote}
                            </li>
                        `;
                    }).join('');
                return `<ul class="c3a-criteria-list">${items}</ul>`;
            }

            // Hilfsfunktion: SOV-7-Drilldown-Liste
            function buildSov7CriteriaList() {
                if (!sov7Assessment || !sov7Criteria) return '';
                const items = Object.entries(sov7Criteria).map(([id, meta]) => {
                    const a = sov7Assessment[id];
                    if (!a) return '';
                    const resultMeta = c3aResultsMeta[a.result.toUpperCase()] || c3aResultsMeta.UNKNOWN;
                    const note = a.note ? `<span class="c3a-criterion-note">${a.note}</span>` : '';
                    return `
                        <li class="c3a-criterion c3a-criterion-${a.result}">
                            <i class="fa-solid ${resultMeta.icon}" style="color: ${resultMeta.color}"></i>
                            <span class="c3a-criterion-id">${id}</span>
                            <span class="c3a-criterion-name">${meta.name}</span>
                            ${note}
                        </li>
                    `;
                }).join('');
                return `<ul class="c3a-criteria-list">${items}</ul>`;
            }

            // SOV-8 Erklär-Block (kein Drilldown-Katalog)
            function buildSov8Note() {
                return `
                    <div class="sov-row-note">
                        <i class="fa-solid fa-circle-info"></i>
                        Experten-Einschätzung. Nachhaltigkeit liegt nicht im BSI-Mandat;
                        ein formaler SCC-Kriterien-Katalog für SOV-8 ist als Erweiterung vorgesehen.
                    </div>
                `;
            }

            // Hero mit Stern-Spider und Metriken
            let html = `
                <div class="sov-panel-hero">
                    <div class="sov-panel-star">${renderStarSvg(provider.id, 50)}</div>
                    <div class="sov-panel-hero-info">
                        <div class="sov-panel-hero-metrics">
                            <div class="sov-panel-hero-metric" title="Y-Achse der Matrix · gewichtet aus EU CSF SOV-1…8">
                                <div class="sov-panel-hero-metric-label">Kontrolle</div>
                                <div class="sov-panel-hero-metric-value">${kontrolle}</div>
                                <div class="sov-panel-hero-metric-hint">EU CSF</div>
                            </div>
                            <div class="sov-panel-hero-metric" title="X-Achse der Matrix · BTC-Bewertung von Service-Portfolio &amp; Reife">
                                <div class="sov-panel-hero-metric-label">Leistung</div>
                                <div class="sov-panel-hero-metric-value">${provider.performance}</div>
                                <div class="sov-panel-hero-metric-hint">BTC</div>
                            </div>
                        </div>
                        <a href="https://commission.europa.eu/document/09579818-64a6-4dd5-9577-446ab6219113_en" target="_blank" rel="noopener" class="sov-panel-hero-hint">
                            <i class="fa-solid fa-circle-info"></i> Gewichtung gem. EU Cloud Sovereignty Framework
                        </a>
                    </div>
                </div>
                <details class="sov-panel-formula">
                    <summary>
                        <i class="fa-solid fa-calculator"></i>
                        Wie unterscheiden sich <strong>Kontrolle</strong> und <strong>C3A</strong>?
                        <i class="fa-solid fa-chevron-down sov-panel-formula-chevron"></i>
                    </summary>
                    <div class="sov-panel-formula-body">
                        <p>
                            <strong>C3A</strong> folgt der
                            <a href="https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/CloudComputing/C3A_Cloud_Computing_Autonomy.pdf" target="_blank" rel="noopener">BSI-Methodik</a>:
                            ungewichteter Mittelwert über die 6 SOV-Buckets aus BSI <strong>C3A</strong> v1.0
                            (SOV-1…6). SOV-7 und SOV-8 sind laut BSI-Mandat ausgenommen.
                        </p>
                        <p>
                            <strong>Kontrolle</strong> folgt der
                            <a href="https://commission.europa.eu/document/09579818-64a6-4dd5-9577-446ab6219113_en" target="_blank" rel="noopener">EU-<strong>CSF</strong>-Methodik</a>:
                            gewichteter Mittelwert über alle 8 SOV-Dimensionen mit folgenden Gewichten:
                        </p>
                        <ul class="sov-panel-formula-weights">
                            <li><span>SOV-1 Strategie</span><span>15 %</span></li>
                            <li><span>SOV-2 Recht</span><span>10 %</span></li>
                            <li><span>SOV-3 Daten</span><span>10 %</span></li>
                            <li><span>SOV-4 Betrieb</span><span>15 %</span></li>
                            <li><span>SOV-5 Lieferkette</span><span>20 %</span></li>
                            <li><span>SOV-6 Technologie</span><span>15 %</span></li>
                            <li><span>SOV-7 Sicherheit</span><span>10 %</span></li>
                            <li><span>SOV-8 Nachhaltigkeit</span><span>5 %</span></li>
                        </ul>
                        <p class="sov-panel-formula-note">
                            Daher kann Kontrolle vom <strong>C3A</strong>-Score abweichen — wegen der
                            zusätzlichen SOV-7/SOV-8 und der EU-<strong>CSF</strong>-spezifischen Gewichtung
                            der gemeinsamen SOV-1…6.
                        </p>
                    </div>
                </details>
            `;

            // Konsolidierte SOV-Liste mit ausklappbarem Drilldown je SOV
            Object.entries(sovCriteria).forEach(([key, criteria]) => {
                const scoreKey = criteria.id;
                const score = sovScores[scoreKey] || 0;
                const explanation = sovExplanations ? sovExplanations[scoreKey] : null;
                const scoreClass = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
                const sourceMeta = SOV_SOURCE[scoreKey];
                const sourceTag = sourceMeta
                    ? `<span class="sov-row-source sov-row-source-${sourceMeta.tag.toLowerCase().replace(/[^a-z0-9]/g,'')}" title="${sourceMeta.title}">${sourceMeta.tag}</span>`
                    : '';

                // Drilldown-Inhalt je nach Quelle
                let drilldown = '';
                if (scoreKey === 'sov7') {
                    drilldown = buildSov7CriteriaList();
                } else if (scoreKey === 'sov8') {
                    drilldown = buildSov8Note();
                } else {
                    drilldown = buildC3ACriteriaList(scoreKey);
                }

                html += `
                    <details class="sov-row sov-row-${scoreClass}">
                        <summary class="sov-row-summary">
                            <div class="sov-row-icon"><i class="fa-solid ${criteria.icon}"></i></div>
                            <div class="sov-row-titles">
                                <div class="sov-row-name">${criteria.name} ${sourceTag}</div>
                                <div class="sov-row-meta">${criteria.shortName}</div>
                            </div>
                            <div class="sov-row-score sov-row-score-${scoreClass}">${score}</div>
                            <i class="fa-solid fa-chevron-down sov-row-chevron"></i>
                        </summary>
                        <div class="sov-row-content">
                            <div class="sov-row-bar"><div class="sov-row-bar-fill sov-row-bar-${scoreClass}" style="width:${score}%"></div></div>
                            ${explanation ? `<p class="sov-row-explanation">${explanation}</p>` : ''}
                            ${drilldown}
                        </div>
                    </details>
                `;
            });

            // Quellen-Block bleibt am Ende
            html += renderSourcesBlock(provider.id);

            content.innerHTML = html;
        } else {
            content.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Keine SOV-Daten verfügbar</p>';
        }

        // Panel öffnen
        panel.classList.add('visible');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Schließt das SOV-Panel
     */
    function closeSovPanel() {
        const panel = document.getElementById('sovPanel');
        const overlay = document.getElementById('sovPanelOverlay');

        if (panel) panel.classList.remove('visible');
        if (overlay) overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    /**
     * Initialisiert SOV-Panel Event-Listener
     */
    function initSovPanel() {
        const closeBtn = document.getElementById('sovPanelClose');
        const overlay = document.getElementById('sovPanelOverlay');

        if (closeBtn) {
            closeBtn.addEventListener('click', closeSovPanel);
        }
        if (overlay) {
            overlay.addEventListener('click', closeSovPanel);
        }

        // ESC-Taste zum Schließen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSovPanel();
        });
    }

    /**
     * Initialisiert den ES³-only Filter (zeigt nur ES³-zertifizierte Provider)
     */
    function initES3Filter() {
        const btn = document.getElementById('es3FilterBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            es3OnlyFilter = !es3OnlyFilter;
            btn.classList.toggle('is-active', es3OnlyFilter);
            btn.setAttribute('aria-pressed', es3OnlyFilter ? 'true' : 'false');
            track('es3-filter', { active: es3OnlyFilter });
            updateVisualization(parseInt(elements.slider?.value || 50));
        });
    }

    /**
     * Initialisiert Kategorie-Filter
     */
    function initializeFilters() {
        const filterOptions = document.querySelectorAll('.filter-option');

        filterOptions.forEach(option => {
            option.addEventListener('click', () => {
                const category = option.getAttribute('data-category');
                const checkbox = option.querySelector('.filter-checkbox');

                if (activeCategories.has(category)) {
                    activeCategories.delete(category);
                    checkbox.classList.remove('active');
                } else {
                    activeCategories.add(category);
                    checkbox.classList.add('active');
                }

                updateVisualization(parseInt(elements.slider.value));
            });
        });
    }

    /**
     * Entsperrt den geschützten Inhalt
     * @param {boolean} isPublicMode
     */
    function unlockContent(isPublicMode) {
        if (elements.passwordOverlay) {
            elements.passwordOverlay.classList.add('hidden');
        }
        if (elements.protectedContent) {
            elements.protectedContent.classList.add('unlocked');
        }

        if (elements.accessBadge) {
            if (isPublicMode) {
                elements.accessBadge.innerHTML = 'Public Access - Anonymisierte Ansicht';
                elements.accessBadge.style.background = 'var(--gray-100)';
                elements.accessBadge.style.borderColor = 'var(--gray-300)';
            } else {
                elements.accessBadge.innerHTML = 'Full Access - Vollständige Ansicht';
                elements.accessBadge.style.background = 'var(--gray-100)';
                elements.accessBadge.style.borderColor = 'var(--btc-primary)';
            }
        }

        initializeCompass(isPublicMode);
    }

    /**
     * Initialisiert den Compass
     * @param {boolean} isPublic
     */
    function initializeCompass(isPublic) {
        isPublicAccess = isPublic;

        const fullProviders = applyCustomScores(SCC_DATA.getProvidersCopy());
        currentProviders = isPublic ? anonymizeProviders(fullProviders) : fullProviders;

        initializeLegend(isPublic);
        initializeFilters();
        updateVisualization(50);
        updateCustomScoresHint();
    }

    /**
     * Initialisiert den View-Mode-Toggle (ES³-Einschätzung vs. EU CSF SEAL)
     */
    function initViewModeToggle() {
        const container = document.getElementById('viewModeToggle');
        if (!container) return;
        const buttons = container.querySelectorAll('.audit-mode-btn');
        const currentMode = SCC_DATA.getViewMode ? SCC_DATA.getViewMode() : 'es3';

        const applyLegendVisibility = (mode) => {
            const sealCard = document.getElementById('sealLegendCard');
            const es3Card  = document.getElementById('es3LegendCard');
            if (sealCard) sealCard.style.display = mode === 'seal' ? '' : 'none';
            if (es3Card)  es3Card.style.display  = mode === 'es3'  ? '' : 'none';
        };

        buttons.forEach(btn => {
            const isActive = btn.dataset.mode === currentMode;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
        applyLegendVisibility(currentMode);

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                if (!SCC_DATA.setViewMode || !SCC_DATA.setViewMode(mode)) return;
                buttons.forEach(b => {
                    const active = b.dataset.mode === mode;
                    b.classList.toggle('is-active', active);
                    b.setAttribute('aria-checked', active ? 'true' : 'false');
                });
                applyLegendVisibility(mode);
                track('view-mode', { mode });
                reloadProviders();
            });
        });
    }

    /**
     * Initialisiert den Audit-Strenge-Toggle (BSI C3A: C1 = EU, C2 = DE)
     */
    function initAuditModeToggle() {
        const container = document.getElementById('auditModeToggle');
        if (!container) return;
        const buttons = container.querySelectorAll('.audit-mode-btn');
        const currentMode = SCC_DATA.getAuditMode ? SCC_DATA.getAuditMode() : 'c1';

        // Initialen Zustand setzen (aus localStorage)
        buttons.forEach(btn => {
            const isActive = btn.dataset.mode === currentMode;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                if (!SCC_DATA.setAuditMode || !SCC_DATA.setAuditMode(mode)) return;
                buttons.forEach(b => {
                    const active = b.dataset.mode === mode;
                    b.classList.toggle('is-active', active);
                    b.setAttribute('aria-checked', active ? 'true' : 'false');
                });
                // Track: BSI Audit-Strenge gewechselt
                track('audit-mode', { mode });
                // Komplett-Neuberechnung: Provider-Liste, Chart, Result-Cards
                reloadProviders();
                // Falls SOV-Panel offen ist, schließen — Werte könnten verschoben sein
                const panel = document.getElementById('sovPanel');
                if (panel && panel.classList.contains('visible')) {
                    closeSovPanel();
                }
            });
        });
    }

    /**
     * Provider neu laden (nach Score-Änderung)
     */
    function reloadProviders() {
        const fullProviders = applyCustomScores(SCC_DATA.getProvidersCopy());
        currentProviders = isPublicAccess ? anonymizeProviders(fullProviders) : fullProviders;
        updateVisualization(parseInt(elements.slider?.value || 50));
        updateCustomScoresHint();
    }

    /**
     * Passwort prüfen
     */
    async function checkPassword() {
        const password = elements.passwordInput?.value || '';
        const isValid = await AuthManager.authenticateWithPassword(password);

        if (isValid) {
            if (elements.passwordError) {
                elements.passwordError.classList.remove('show');
            }
            unlockContent(false);
        } else {
            if (elements.passwordError) {
                elements.passwordError.classList.add('show');
            }
            if (elements.passwordInput) {
                elements.passwordInput.value = '';
                elements.passwordInput.focus();
            }
            setTimeout(() => {
                if (elements.passwordError) {
                    elements.passwordError.classList.remove('show');
                }
            }, 3000);
        }
    }

    /**
     * Public Mode aktivieren
     */
    function skipPassword() {
        AuthManager.enablePublicMode();
        unlockContent(true);
    }

    /**
     * Session prüfen (beim Laden)
     */
    function checkSession() {
        const session = AuthManager.checkSession();

        if (session.authenticated) {
            unlockContent(false);
        } else if (session.publicMode) {
            unlockContent(true);
        }
    }

    /**
     * Event-Listener Setup
     */
    // Umami-Tracking-Helfer (no-op falls Umami nicht geladen)
    function track(eventName, data) {
        if (typeof window.umami !== 'undefined' && typeof window.umami.track === 'function') {
            try { window.umami.track(eventName, data); } catch (e) { /* ignore */ }
        }
    }

    function setupEventListeners() {
        // Slider mit RAF-Throttling + debounced Tracking
        if (elements.slider) {
            let sliderTrackTimeout = null;
            elements.slider.addEventListener('input', (e) => {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    updateVisualization(parseInt(e.target.value));
                });
                // Tracking nur 800ms nach letztem Input (sonst zu viel Rauschen)
                clearTimeout(sliderTrackTimeout);
                sliderTrackTimeout = setTimeout(() => {
                    track('slider-change', { value: parseInt(e.target.value) });
                }, 800);
            });
        }

        // Passwort-Eingabe (Enter-Taste)
        if (elements.passwordInput) {
            elements.passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') checkPassword();
            });
        }

        // Storage-Events (für Sync zwischen Tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === StorageManager.KEYS.CUSTOM_SCORES) {
                reloadProviders();
            }
        });

        // === Login-Bereich ===
        // Theme-Toggle auf Login-Seite
        if (elements.loginThemeToggle) {
            elements.loginThemeToggle.addEventListener('click', () => ThemeManager.toggle());
            elements.loginThemeToggle.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    ThemeManager.toggle();
                }
            });
        }

        // Public-Button (Ohne Passwort starten)
        if (elements.publicButton) {
            elements.publicButton.addEventListener('click', skipPassword);
        }

        // Passwort-Button
        if (elements.passwordButton) {
            elements.passwordButton.addEventListener('click', checkPassword);
        }

        // === Geschützter Bereich ===
        // Theme-Toggle im Drawer
        if (elements.drawerThemeToggle) {
            elements.drawerThemeToggle.addEventListener('click', () => ThemeManager.toggle());
            elements.drawerThemeToggle.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    ThemeManager.toggle();
                }
            });
        }

        // Theme-Toggle Desktop
        if (elements.desktopThemeToggle) {
            elements.desktopThemeToggle.addEventListener('click', () => ThemeManager.toggle());
            elements.desktopThemeToggle.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    ThemeManager.toggle();
                }
            });
        }

        // Access-Badge (Logout)
        if (elements.accessBadge) {
            elements.accessBadge.addEventListener('click', logout);
            elements.accessBadge.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    logout();
                }
            });
        }
    }

    /**
     * Hauptinitialisierung
     */
    function init() {
        // Theme initialisieren
        ThemeManager.init();

        // Mobile Nav initialisieren
        MobileNav.init();

        // DOM-Elemente cachen
        cacheElements();

        // Event-Listener einrichten
        setupEventListeners();

        // SOV-Panel initialisieren
        initSovPanel();

        // ES³-only Filter initialisieren
        initES3Filter();

        // View-Mode-Toggle (ES³ / SEAL) initialisieren
        initViewModeToggle();

        // Audit-Strenge-Toggle (BSI C3A C1/C2) initialisieren
        initAuditModeToggle();

        // Outbound-Klicks auf Provider-Quellen tracken (Event-Delegation)
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a.provider-source-item, .provider-source-item a, a[data-source-provider]');
            if (a && a.dataset.sourceProvider) {
                track('source-click', {
                    provider: a.dataset.sourceProvider,
                    host: a.dataset.sourceHost || ''
                });
            }
        });

        // Direkt Vollversion initialisieren (Login deaktiviert)
        initializeCompass(false);
    }

    /**
     * Logout - zurück zur Login-Seite
     */
    function logout() {
        AuthManager.logout();

        if (elements.passwordOverlay) {
            elements.passwordOverlay.classList.remove('hidden');
        }
        if (elements.protectedContent) {
            elements.protectedContent.classList.remove('unlocked');
        }
        if (elements.passwordInput) {
            elements.passwordInput.value = '';
        }
    }

    // Globale Funktionen für onclick-Handler (Rückwärtskompatibilität)
    window.checkPassword = checkPassword;
    window.skipPassword = skipPassword;
    window.logout = logout;

    // Auto-Init bei DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    window.SCCCompass = Object.freeze({
        init,
        updateVisualization,
        reloadProviders,
        checkPassword,
        skipPassword,
        logout
    });

    // Hooks für Chart-Komponente (Hover-Popup auf Provider-Punkten in der Matrix)
    window.SCC_HOVER = Object.freeze({
        show: showCardHoverPopup,
        hide: hideCardHoverPopup
    });
    window.SCC_OPEN_PANEL = openSovPanel;

})();

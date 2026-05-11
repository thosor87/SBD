import { DIMENSIONS } from './data/es3-questions.js';
import { getSMLLevel } from './modules/sml-assessment.js';
import { getMatchMessage } from './modules/provider-match.js';

export function renderResult(container, smlResult, providerId) {
    var match = getMatchMessage(providerId, smlResult.smlLevel.id);
    container.innerHTML = `
        <div class="es3-result">
            <div class="es3-result-header">
                <h2>Ihr Souveränitäts-Reifegrad</h2>
                <div class="es3-sml-badge es3-sml-${smlResult.smlLevel.id}">
                    ${smlResult.smlLevel.label}
                </div>
                <p class="es3-weakest-hint">
                    Gesamt-Level = schwächste Dimension (Weakest-Link-Prinzip)
                </p>
            </div>

            <div class="es3-dim-table-wrap">
                ${renderSpiderTable(smlResult)}
            </div>

            <div class="es3-match-box ${match.positive ? 'es3-match-positive' : 'es3-match-neutral'}">
                <h3>${match.headline}</h3>
                <p>${match.body}</p>
                <a href="${match.cta.url}" class="es3-cta-btn" target="_blank" rel="noopener">
                    ${match.cta.label} →
                </a>
            </div>

            <div class="es3-result-footer">
                <p>Erstellt mit <strong>Sovereignty by Design</strong> – BTC AG × STACKIT</p>
                <button class="es3-btn-secondary" onclick="document.querySelector('[data-step=\\'1\\']').click()" type="button">
                    ← Provider erneut vergleichen
                </button>
            </div>
        </div>`;
}

function renderSpiderTable(smlResult) {
    var rows = DIMENSIONS.map(function(d) {
        var score = smlResult[d.id] != null ? smlResult[d.id] : 0;
        var level = getSMLLevel(score);
        var isWeakest = score === smlResult.overall;
        return '<tr class="' + (isWeakest ? 'es3-weakest-row' : '') + '">' +
            '<td>' + d.label + '</td>' +
            '<td>' + score + '</td>' +
            '<td style="color:' + level.color + '">' + level.label + (isWeakest ? ' ⚠' : '') + '</td>' +
            '</tr>';
    }).join('');
    return '<table class="es3-dim-table">' +
        '<thead><tr><th>Dimension</th><th>Score</th><th>Level</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '<tfoot><tr>' +
            '<td><strong>Gesamt</strong></td>' +
            '<td><strong>' + smlResult.overall + '</strong></td>' +
            '<td style="color:' + smlResult.smlLevel.color + '"><strong>' + smlResult.smlLevel.label + '</strong></td>' +
        '</tr></tfoot>' +
    '</table>';
}

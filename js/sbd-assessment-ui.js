import { DIMENSIONS, getQuestions } from './data/es3-questions.js';
import { scoreAllDimensions } from './modules/sml-assessment.js';

export function renderAssessment(container) {
    container.innerHTML = `
        <div class="es3-assessment">
            <div class="es3-assessment-header">
                <h2>Organisations-Assessment</h2>
                <p class="es3-assessment-desc">Bewerten Sie Ihre Organisation in 9 Souveränitätsdimensionen.
                   Basis: EU Cloud Sovereignty Framework + BSI C3A. Das Gesamt-Level bestimmt die schwächste Dimension (Weakest-Link-Prinzip).</p>
            </div>
            <div class="es3-dimensions">
                ${DIMENSIONS.map(d => renderDimension(d)).join('')}
            </div>
            <div class="es3-assessment-footer">
                <button class="es3-btn-primary" id="es3-calculate-btn" type="button">
                    Ergebnis berechnen →
                </button>
            </div>
        </div>`;

    document.getElementById('es3-calculate-btn').addEventListener('click', function() {
        var answers = collectAnswers();
        var result = scoreAllDimensions(answers);
        window._smlResult = result;
        // Step 3 aktivieren
        document.querySelectorAll('.step-section').forEach(function(s) { s.hidden = true; });
        var step3 = document.getElementById('step-3');
        if (step3) step3.hidden = false;
        document.querySelectorAll('.step-btn').forEach(function(b) {
            b.classList.remove('step-btn-active');
        });
        var btn2 = document.querySelector('[data-step="2"]');
        if (btn2) btn2.classList.add('done');
        var btn3 = document.querySelector('[data-step="3"]');
        if (btn3) btn3.classList.add('step-btn-active');
        window.dispatchEvent(new CustomEvent('sml-result-ready', { detail: result }));
    });
}

function renderDimension(dim) {
    var questions = getQuestions(dim.id);
    return `
        <details class="es3-dim-block">
            <summary class="es3-dim-summary">
                <span class="es3-dim-label">${dim.label}</span>
                <span class="es3-dim-desc">${dim.description}</span>
                <span class="es3-dim-score" id="score-${dim.id}">–</span>
            </summary>
            <div class="es3-dim-questions">
                ${questions.map(function(q) { return renderQuestion(q, dim.id); }).join('')}
            </div>
        </details>`;
}

function renderQuestion(q, dimId) {
    var levelLabel = q.level === 'reg' ? 'Regulatorisch' : q.level === 'org' ? 'Organisatorisch' : 'Technisch';
    return `
        <div class="es3-question" data-dim="${dimId}" data-qid="${q.id}">
            <span class="es3-q-level">${levelLabel}</span>
            <span class="es3-q-text">${q.text}</span>
            <div class="es3-q-options">
                <label><input type="radio" name="${q.id}" value="ja"> Ja</label>
                <label><input type="radio" name="${q.id}" value="teilweise"> Teilweise</label>
                <label><input type="radio" name="${q.id}" value="nein" checked> Nein</label>
            </div>
        </div>`;
}

function collectAnswers() {
    var answers = {};
    DIMENSIONS.forEach(function(dim) {
        var qs = getQuestions(dim.id);
        answers[dim.id] = {};
        qs.forEach(function(q) {
            var checked = document.querySelector('input[name="' + q.id + '"]:checked');
            answers[dim.id][q.level] = checked ? checked.value : 'nein';
        });
    });
    return answers;
}

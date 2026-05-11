import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { answerScore } from '../js/modules/sml-assessment.js';
import { scoreDimension } from '../js/modules/sml-assessment.js';
import { getSMLLevel } from '../js/modules/sml-assessment.js';
import { weakestLink, scoreAllDimensions } from '../js/modules/sml-assessment.js';

test('answerScore: Ja = 2', () => {
  assert.equal(answerScore('ja'), 2);
});
test('answerScore: Teilweise = 1', () => {
  assert.equal(answerScore('teilweise'), 1);
});
test('answerScore: Nein = 0', () => {
  assert.equal(answerScore('nein'), 0);
});
test('answerScore: unbekannt = 0', () => {
  assert.equal(answerScore(undefined), 0);
});

test('scoreDimension: alle Ja = 100', () => {
  const answers = { reg: 'ja', org: 'ja', tech: 'ja' };
  assert.equal(scoreDimension(answers), 100);
});
test('scoreDimension: alle Nein = 0', () => {
  const answers = { reg: 'nein', org: 'nein', tech: 'nein' };
  assert.equal(scoreDimension(answers), 0);
});
test('scoreDimension: gemischt = 67', () => {
  const answers = { reg: 'ja', org: 'nein', tech: 'ja' };
  assert.equal(scoreDimension(answers), 67);
});
test('scoreDimension: alle Teilweise = 50', () => {
  const answers = { reg: 'teilweise', org: 'teilweise', tech: 'teilweise' };
  assert.equal(scoreDimension(answers), 50);
});

test('getSMLLevel: 0 = Initial', () => {
  assert.equal(getSMLLevel(0).id, 'initial');
});
test('getSMLLevel: 25 = Initial', () => {
  assert.equal(getSMLLevel(25).id, 'initial');
});
test('getSMLLevel: 26 = Managed', () => {
  assert.equal(getSMLLevel(26).id, 'managed');
});
test('getSMLLevel: 50 = Managed', () => {
  assert.equal(getSMLLevel(50).id, 'managed');
});
test('getSMLLevel: 51 = Advanced', () => {
  assert.equal(getSMLLevel(51).id, 'advanced');
});
test('getSMLLevel: 75 = Advanced', () => {
  assert.equal(getSMLLevel(75).id, 'advanced');
});
test('getSMLLevel: 76 = Future-Proof', () => {
  assert.equal(getSMLLevel(76).id, 'future-proof');
});
test('getSMLLevel: 100 = Future-Proof', () => {
  assert.equal(getSMLLevel(100).id, 'future-proof');
});

test('weakestLink: niedrigste Dimension bestimmt Gesamt', () => {
  const scores = { d1: 90, d2: 80, d3: 20, d4: 70, d5: 85, d6: 60, d7: 75, d8: 90, d9: 65 };
  assert.equal(weakestLink(scores), 20);
});

test('scoreAllDimensions: berechnet alle 9 Dimensionen', () => {
  const answers = {
    d1: { reg: 'ja', org: 'ja', tech: 'ja' },
    d2: { reg: 'nein', org: 'nein', tech: 'nein' },
    d3: { reg: 'ja', org: 'ja', tech: 'ja' },
    d4: { reg: 'ja', org: 'ja', tech: 'ja' },
    d5: { reg: 'ja', org: 'ja', tech: 'ja' },
    d6: { reg: 'ja', org: 'ja', tech: 'ja' },
    d7: { reg: 'ja', org: 'ja', tech: 'ja' },
    d8: { reg: 'ja', org: 'ja', tech: 'ja' },
    d9: { reg: 'ja', org: 'ja', tech: 'ja' },
  };
  const result = scoreAllDimensions(answers);
  assert.equal(result.d1, 100);
  assert.equal(result.d2, 0);
  assert.equal(result.overall, 0);
  assert.equal(result.smlLevel.id, 'initial');
});

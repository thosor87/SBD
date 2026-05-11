import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { DIMENSIONS, getQuestions } from '../js/data/es3-questions.js';

test('DIMENSIONS hat genau 9 Eintraege', () => {
  assert.equal(DIMENSIONS.length, 9);
});
test('Jede Dimension hat id, label, description', () => {
  for (const d of DIMENSIONS) {
    assert.ok(d.id, `${d.id} fehlt id`);
    assert.ok(d.label, `${d.id} fehlt label`);
    assert.ok(d.description, `${d.id} fehlt description`);
  }
});
test('getQuestions gibt 3 Fragen pro Dimension zurueck', () => {
  for (const d of DIMENSIONS) {
    const q = getQuestions(d.id);
    assert.equal(q.length, 3, `${d.id} hat nicht 3 Fragen`);
  }
});
test('Jede Frage hat level (reg/org/tech), text, id', () => {
  for (const d of DIMENSIONS) {
    for (const q of getQuestions(d.id)) {
      assert.ok(['reg', 'org', 'tech'].includes(q.level), `${q.id} hat ungueltiges level`);
      assert.ok(q.text, `${q.id} fehlt text`);
      assert.ok(q.id, `Frage fehlt id`);
    }
  }
});
test('Frage-IDs sind eindeutig', () => {
  const ids = DIMENSIONS.flatMap(d => getQuestions(d.id).map(q => q.id));
  assert.equal(ids.length, new Set(ids).size);
});

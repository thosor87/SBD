import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { isES3Certified, getMatchMessage } from '../js/modules/provider-match.js';

test('isES3Certified: stackit = true', () => {
  assert.equal(isES3Certified('stackit'), true);
});
test('isES3Certified: aws = false', () => {
  assert.equal(isES3Certified('aws'), false);
});
test('isES3Certified: ionos = false', () => {
  assert.equal(isES3Certified('ionos'), false);
});

test('getMatchMessage: stackit positive Nachricht', () => {
  const msg = getMatchMessage('stackit', 'advanced');
  assert.equal(msg.positive, true);
  assert.ok(msg.headline.includes('STACKIT'), 'Headline erwaehnt STACKIT');
});
test('getMatchMessage: aws neutrale Nachricht', () => {
  const msg = getMatchMessage('aws', 'advanced');
  assert.equal(msg.positive, false);
  assert.ok(msg.headline.length > 0);
});
test('getMatchMessage: kein Provider neutrale Nachricht', () => {
  const msg = getMatchMessage(null, 'initial');
  assert.equal(msg.positive, false);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const interactions = require('../mobile-interactions.js');

test('clampIndex keeps carousel indices within loaded items', () => {
  assert.equal(interactions.clampIndex(-1, 4), 0);
  assert.equal(interactions.clampIndex(8, 4), 3);
  assert.equal(interactions.clampIndex(2, 4), 2);
  assert.equal(interactions.clampIndex(2, 0), 0);
});

test('moveIndex moves one item without wrapping', () => {
  assert.equal(interactions.moveIndex(1, 1, 4), 2);
  assert.equal(interactions.moveIndex(0, -1, 4), 0);
  assert.equal(interactions.moveIndex(3, 1, 4), 3);
});

test('upcomingDays starts today and crosses the Sunday boundary', () => {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((name) => ({ name }));
  assert.deepEqual(interactions.upcomingDays(days, 6, 3).map((day) => day.name), ['SAT', 'SUN', 'MON']);
  assert.deepEqual(interactions.upcomingDays(days, 0, 3).map((day) => day.name), ['SUN', 'MON', 'TUE']);
});

test('upcomingDays can expose the full rotated week', () => {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((name) => ({ name }));
  assert.equal(interactions.upcomingDays(days, 3, 7).length, 7);
});

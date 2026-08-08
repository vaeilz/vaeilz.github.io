const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const randomizer = require('../random-selection.js');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('dedupeByUrl removes invalid and duplicate image URLs', () => {
  const result = randomizer.dedupeByUrl([
    { img: 'a.jpg' },
    { img: 'a.jpg' },
    { img: '' },
    { img: 'b.jpg' }
  ]);

  assert.deepEqual(result.map((item) => item.img), ['a.jpg', 'b.jpg']);
});

test('selectFresh prioritizes unseen images', () => {
  const items = ['a', 'b', 'c'].map((img) => ({ img }));
  const result = randomizer.selectFresh(items, 2, ['a'], () => 0);

  assert.deepEqual(new Set(result.map((item) => item.img)), new Set(['b', 'c']));
});

test('selectFresh fills from seen images when unseen images are exhausted', () => {
  const items = ['a', 'b', 'c'].map((img) => ({ img }));
  const result = randomizer.selectFresh(items, 3, ['a', 'b'], () => 0);

  assert.equal(result.length, 3);
  assert.equal(result[0].img, 'c');
});

test('storage failures return an empty history and do not throw on write', () => {
  const storage = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); }
  };

  assert.deepEqual(randomizer.readRecent(storage, 'key'), []);
  assert.doesNotThrow(() => randomizer.writeRecent(storage, 'key', ['a'], 10));
});

test('malformed storage values return an empty history', () => {
  const invalidJson = { getItem() { return '{'; } };
  const invalidShape = { getItem() { return JSON.stringify(['a', 2]); } };

  assert.deepEqual(randomizer.readRecent(invalidJson, 'key'), []);
  assert.deepEqual(randomizer.readRecent(invalidShape, 'key'), []);
});

test('writeRecent deduplicates and caps saved URLs', () => {
  let saved = null;
  const storage = { setItem(key, value) { saved = { key, value }; } };

  randomizer.writeRecent(storage, 'history', ['a', 'b', 'a', 'c'], 2);

  assert.equal(saved.key, 'history');
  assert.deepEqual(JSON.parse(saved.value), ['a', 'b']);
});

test('pickDifferentIndex never returns the current index when alternatives exist', () => {
  assert.equal(randomizer.pickDifferentIndex(3, 1, () => 0), 0);
  assert.notEqual(randomizer.pickDifferentIndex(3, 1, () => 0.99), 1);
  assert.equal(randomizer.pickDifferentIndex(1, 0, () => 0.5), 0);
});

test('page loads the image randomizer before the component runtime', () => {
  const helperPosition = html.indexOf('<script src="./random-selection.js"></script>');
  const runtimePosition = html.indexOf('<script src="./support.js"></script>');

  assert.notEqual(helperPosition, -1);
  assert.ok(helperPosition < runtimePosition);
});

test('fan art uses site-specific recent-aware selection', () => {
  assert.match(html, /neurosama\.dev:recent-fan-art/);
  assert.match(html, /ImageRandomizer\.selectFresh/);
  assert.match(html, /ImageRandomizer\.writeRecent/);
});

test('hero selection avoids the currently displayed image', () => {
  assert.match(html, /ImageRandomizer\.pickDifferentIndex/);
});

test('fan art binds a failed-image callback', () => {
  assert.match(html, /onError="\{\{ art\.onError \}\}"/);
});

test('page exposes mobile navigation and carousel hooks', () => {
  assert.match(html, /class="[^"]*mobile-nav-links/);
  assert.match(html, /class="[^"]*mobile-quote-track/);
  assert.match(html, /class="[^"]*mobile-art-track/);
});

test('page defines tablet and phone responsive breakpoints', () => {
  assert.match(html, /@media \(max-width: 900px\)/);
  assert.match(html, /@media \(max-width: 600px\)/);
});

test('mobile media uses clipped animated tracks and manual controls', () => {
  assert.match(html, /class="carousel-viewport mobile-quote-viewport"/);
  assert.match(html, /class="carousel-controls"/);
  assert.match(html, /transform:\s*translate3d\(calc\(var\(--carousel-index\)/);
  assert.doesNotMatch(html, /scroll-snap-type:\s*x mandatory/);
});

test('mobile carousels expose swipe and accessible arrow controls', () => {
  assert.match(html, /onPointerDown="\{\{ onQuotePointerDown \}\}"/);
  assert.match(html, /aria-label="Previous quote clip"/);
  assert.match(html, /aria-label="Next fan art"/);
});

test('mobile schedule exposes compact expandable content', () => {
  assert.match(html, /class="mobile-schedule-grid"/);
  assert.match(html, /aria-expanded="\{\{ scheduleExpanded \}\}"/);
  assert.match(html, /View full week/);
  assert.match(html, /inline-size:\s*fit-content/);
});

test('mobile about section clips transformed artwork without widening the page', () => {
  assert.match(html, /#about\s*\{\s*overflow:\s*hidden/);
});

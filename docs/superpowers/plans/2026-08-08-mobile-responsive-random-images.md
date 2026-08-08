# Mobile Responsive Random Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make both Neuro-sama fan sites comfortable on phones and provide fresh, non-repeating hero and fan-art images across page loads.

**Architecture:** Preserve the existing single-page DC components and add narrowly scoped class hooks plus responsive CSS. Put deterministic, testable random-selection behavior in a dependency-free UMD helper copied into each standalone repository, then call it from each component with site-specific history keys.

**Tech Stack:** Static HTML/CSS, DC custom component runtime, browser JavaScript, `localStorage`, Node.js built-in test runner.

## Global Constraints

- Apply equivalent behavior to `C:\Users\Admin\vs\Web dev\Neurosama.dev` and `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev`.
- Preserve current desktop styling, content, colors, APIs, and character-specific behavior.
- Mobile navigation is a horizontally scrollable link row, not a hamburger or fixed bottom bar.
- Mobile video and fan-art sections show one complete item at a time and scroll horizontally for more.
- Images reshuffle only on page refresh and explicit interaction; there is no timed rotation.
- Store only public image URLs and never allow storage failures to prevent rendering.
- Add no runtime package, framework, analytics service, or server component.

---

### Task 1: Neuro random-selection helper

**Files:**
- Create: `random-selection.js`
- Create: `tests/random-selection.test.cjs`

**Interfaces:**
- Produces: `ImageRandomizer.shuffle(items, random)`, `ImageRandomizer.dedupeByUrl(items)`, `ImageRandomizer.selectFresh(items, count, recentUrls, random)`, `ImageRandomizer.readRecent(storage, key)`, `ImageRandomizer.writeRecent(storage, key, urls, maxEntries)`, and `ImageRandomizer.pickDifferentIndex(length, currentIndex, random)`.

- [ ] **Step 1: Write failing tests for deduplication and unseen-first selection**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const randomizer = require('../random-selection.js');

test('dedupeByUrl removes invalid and duplicate image URLs', () => {
  const result = randomizer.dedupeByUrl([
    { img: 'a.jpg' }, { img: 'a.jpg' }, { img: '' }, { img: 'b.jpg' }
  ]);
  assert.deepEqual(result.map((item) => item.img), ['a.jpg', 'b.jpg']);
});

test('selectFresh prioritizes unseen images', () => {
  const items = ['a', 'b', 'c'].map((img) => ({ img }));
  const result = randomizer.selectFresh(items, 2, ['a'], () => 0);
  assert.deepEqual(new Set(result.map((item) => item.img)), new Set(['b', 'c']));
});
```

- [ ] **Step 2: Run the tests and verify they fail because the helper is missing**

Run: `node --test tests/random-selection.test.cjs`

Expected: FAIL with `Cannot find module '../random-selection.js'`.

- [ ] **Step 3: Add tests for safe storage and different hero selection**

```js
test('storage failures return an empty history and do not throw on write', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(randomizer.readRecent(storage, 'key'), []);
  assert.doesNotThrow(() => randomizer.writeRecent(storage, 'key', ['a'], 10));
});

test('pickDifferentIndex never returns the current index when alternatives exist', () => {
  assert.equal(randomizer.pickDifferentIndex(3, 1, () => 0), 0);
  assert.notEqual(randomizer.pickDifferentIndex(3, 1, () => 0.99), 1);
  assert.equal(randomizer.pickDifferentIndex(1, 0, () => 0.5), 0);
});
```

- [ ] **Step 4: Implement the dependency-free UMD helper**

Use an IIFE that assigns the same API to `module.exports` in Node and `globalThis.ImageRandomizer` in the browser. Fisher-Yates must accept an injectable random function. `selectFresh` must deduplicate, shuffle unseen items first, fill from seen items only if needed, and return at most `count` items. Storage parsing must accept only arrays of strings; writes must deduplicate and cap the saved list.

- [ ] **Step 5: Run the helper tests**

Run: `node --test tests/random-selection.test.cjs`

Expected: all tests PASS.

- [ ] **Step 6: Commit the helper and tests**

```powershell
git add -- random-selection.js tests/random-selection.test.cjs
git commit -m "feat: add recent-aware image randomizer"
```

### Task 2: Integrate randomized images into Neuro

**Files:**
- Modify: `index.html:5-6, 84, 308-325, 381-386, 445-495, 623-645`
- Test: `tests/random-selection.test.cjs`

**Interfaces:**
- Consumes: `window.ImageRandomizer` from Task 1.
- Produces: site history under `neurosama.dev:recent-fan-art`, randomized initial hero source, non-repeating hero clicks, and failed-image removal.

- [ ] **Step 1: Add a failing static integration test**

Extend the test file to read `index.html` and assert that it loads `random-selection.js`, references `neurosama.dev:recent-fan-art`, uses `selectFresh`, uses `pickDifferentIndex`, and binds an image error callback.

- [ ] **Step 2: Run the test and verify the new assertions fail**

Run: `node --test tests/random-selection.test.cjs`

Expected: FAIL because `index.html` does not yet integrate the helper.

- [ ] **Step 3: Load the helper and initialize the hero randomly**

Add `<script src="./random-selection.js"></script>` before `support.js`. Choose the initial `heroGifIndex` in `componentDidMount`, update the hero ref to the selected GIF, and keep state synchronized.

- [ ] **Step 4: Replace fan-art selection with recent-aware selection**

Deduplicate the mapped API items, safely read the site-specific history, call `selectFresh(..., 16, ...)`, and safely write the selected URLs back with a bounded history of 48 URLs.

- [ ] **Step 5: Remove failed art and randomize hero clicks**

Expose `onError` per rendered art item that filters the failed URL out of component state and sets `artFailed` if no items remain. Replace sequential hero incrementing with `pickDifferentIndex`.

- [ ] **Step 6: Run unit and integration tests**

Run: `node --test tests/random-selection.test.cjs`

Expected: all tests PASS.

- [ ] **Step 7: Commit Neuro image integration**

```powershell
git add -- index.html tests/random-selection.test.cjs
git commit -m "feat: vary Neuro images across visits"
```

### Task 3: Make Neuro responsive

**Files:**
- Modify: `index.html:17-39, 46-303`
- Test: `tests/random-selection.test.cjs`

**Interfaces:**
- Produces: semantic CSS hooks for navigation, hero, live area, quote carousel, art carousel, schedule, about section, and footer; responsive behavior at 900px and 600px breakpoints.

- [ ] **Step 1: Add failing static assertions for responsive hooks**

Assert that `index.html` includes `mobile-nav-links`, `mobile-quote-track`, `mobile-art-track`, `scroll-snap-type: x mandatory`, an `@media (max-width: 900px)` block, and an `@media (max-width: 600px)` block.

- [ ] **Step 2: Run the test and verify responsive assertions fail**

Run: `node --test tests/random-selection.test.cjs`

Expected: FAIL because the hooks and breakpoints do not exist.

- [ ] **Step 3: Add stable class hooks to existing markup**

Add classes without removing existing inline styles. Cover the navigation wrapper and links, hero and both hero columns, section headers, live player/chat grid, quote grid/cards, fan-art grid/cards, schedule grid/cards, about grid/image, and footer rows.

- [ ] **Step 4: Add tablet responsive overrides**

At 900px: allow the nav to wrap into brand and horizontally scrolling links; stack hero and live/about grids; constrain embeds; reduce section padding; make schedule cards use fewer columns; and stack footer content cleanly.

- [ ] **Step 5: Add phone carousel and touch overrides**

At 600px: give navigation and controls at least 44-pixel targets; make quote and art tracks horizontal `display:flex` scrollers with `scroll-snap-type:x mandatory`, `overscroll-behavior-inline:contain`, and `-webkit-overflow-scrolling:touch`; size each card to one complete viewport card with a small next-card cue; prevent document overflow; and reduce oversized decorative text and spacing.

- [ ] **Step 6: Run static tests and validate HTML syntax markers**

Run: `node --test tests/random-selection.test.cjs`

Run: `rg -n "mobile-nav-links|mobile-quote-track|mobile-art-track|@media \(max-width" index.html`

Expected: tests PASS and all responsive hooks appear.

- [ ] **Step 7: Commit Neuro responsive layout**

```powershell
git add -- index.html tests/random-selection.test.cjs
git commit -m "feat: improve Neuro mobile layout"
```

### Task 4: Port and integrate random selection into Evil Neuro

**Files:**
- Create: `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev\random-selection.js`
- Create: `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev\tests\random-selection.test.cjs`
- Modify: `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev\index.html:5-14, 91, 315-332, 388-393, 452-508, 636-658`

**Interfaces:**
- Consumes: the tested helper behavior from Task 1.
- Produces: Evil-specific history under `evil.neurosama.dev:recent-fan-art`, randomized initial hero source, non-repeating hero clicks, and failed-image removal.

- [ ] **Step 1: Copy the tested helper and adapt the integration test to Evil paths and key**

The Evil test must run the same behavioral cases and assert the Evil history namespace instead of the Neuro namespace.

- [ ] **Step 2: Run Evil tests and verify integration assertions fail**

Run from the Evil repository: `node --test tests/random-selection.test.cjs`

Expected: helper behavior passes and HTML integration assertions fail.

- [ ] **Step 3: Integrate the helper into Evil HTML**

Load the helper, randomize the initial hero, select recent-aware fan art with a 48-URL history cap, remove broken art entries, and use a random different GIF on hero clicks.

- [ ] **Step 4: Run Evil tests**

Run: `node --test tests/random-selection.test.cjs`

Expected: all tests PASS.

- [ ] **Step 5: Commit Evil image integration**

```powershell
git add -- random-selection.js index.html tests/random-selection.test.cjs
git commit -m "feat: vary Evil Neuro images across visits"
```

### Task 5: Make Evil Neuro responsive

**Files:**
- Modify: `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev\index.html:17-46, 53-310`
- Test: `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev\tests\random-selection.test.cjs`

**Interfaces:**
- Consumes: the responsive hook naming and breakpoint behavior from Task 3.
- Produces: equivalent responsive behavior using Evil Neuro's existing palette and content.

- [ ] **Step 1: Add failing responsive static assertions to Evil tests**

Assert the same navigation, carousel, scroll-snap, and breakpoint markers used by the Neuro site.

- [ ] **Step 2: Run Evil tests and verify responsive assertions fail**

Run: `node --test tests/random-selection.test.cjs`

Expected: FAIL because responsive hooks are absent.

- [ ] **Step 3: Add matching class hooks and Evil-specific responsive CSS**

Use the same class contracts and layout behavior as Neuro while retaining Evil's current red/purple backgrounds, borders, and hover colors.

- [ ] **Step 4: Run Evil tests and inspect responsive markers**

Run: `node --test tests/random-selection.test.cjs`

Run: `rg -n "mobile-nav-links|mobile-quote-track|mobile-art-track|@media \(max-width" index.html`

Expected: tests PASS and all responsive hooks appear.

- [ ] **Step 5: Commit Evil responsive layout**

```powershell
git add -- index.html tests/random-selection.test.cjs
git commit -m "feat: improve Evil Neuro mobile layout"
```

### Task 6: Cross-site visual and regression verification

**Files:**
- Verify: both repositories' `index.html`, `random-selection.js`, and `tests/random-selection.test.cjs`

**Interfaces:**
- Consumes: completed sites from Tasks 1-5.
- Produces: verified behavior at 320, 375, 768, and 1440 pixel viewport widths.

- [ ] **Step 1: Run both test suites**

Run from each repository: `node --test tests/random-selection.test.cjs`

Expected: both suites PASS.

- [ ] **Step 2: Run whitespace and repository checks**

Run from each repository: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only intentional files appear.

- [ ] **Step 3: Serve each site locally**

Run a local static HTTP server for each repository on separate loopback ports. Do not use `file://`, because the sites load scripts and remote embeds.

- [ ] **Step 4: Verify responsive layouts at four widths**

At 320, 375, 768, and 1440 pixels confirm no document-level horizontal overflow; navigation link scrolling; correctly stacked hero, live, schedule, about, and footer content; one-card mobile video and art tracks; readable text; and intact desktop grids.

- [ ] **Step 5: Verify image behavior**

Reload each site multiple times and confirm the initial hero is not fixed, fan-art selections change while recent URLs are deprioritized, hero clicks never repeat the current GIF when alternatives exist, and failed-image removal does not leave a broken card.

- [ ] **Step 6: Stop local servers and report results**

Stop only the server processes started for this verification. Summarize test results, viewport checks, and any external API behavior that could not be deterministically exercised.

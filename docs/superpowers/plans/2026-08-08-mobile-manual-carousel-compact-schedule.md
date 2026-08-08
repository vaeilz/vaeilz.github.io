# Mobile Manual Carousel and Compact Schedule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give both sites manually controlled, animated mobile media carousels and a compact mobile schedule that initially shows the next three days.

**Architecture:** Add a small CommonJS/browser helper in each repository for carousel index clamping and upcoming-day selection, then bind those pure results into the existing `DCLogic` component state. Mobile-only CSS turns the existing media grids into clipped transform-based tracks; desktop retains its grids. The schedule renders separate desktop and mobile lists so desktop stays Monday-through-Sunday while mobile can start from the current day.

**Tech Stack:** HTML, CSS, JavaScript, React-style `DCLogic` bindings, Node.js built-in test runner.

## Global Constraints

- Apply identical behavior to `Neurosama.dev` and `Evil.Neurosama.dev`, preserving their separate color themes and copy.
- Media navigation is manual only: swipe or previous/next buttons, with no timer or autoplay.
- Show one media card at a time on screens up to 600 px wide.
- Respect `prefers-reduced-motion: reduce`.
- Mobile schedule initially shows three days; `View full week` reveals seven and changes to `Show less`.
- Mobile schedule cards use intrinsic widths, compact padding, no fixed height, and wrap long titles within the viewport.
- Desktop media grids and Monday-through-Sunday schedule stay unchanged.
- Preserve existing API fallbacks, link behavior, shuffle behavior, and recent-aware image randomization.

---

### Task 1: Add Tested Mobile Interaction Helpers to Both Sites

**Files:**
- Create: `C:\Users\Admin\vs\Web dev\Neurosama.dev\mobile-interactions.js`
- Create: `C:\Users\Admin\vs\Web dev\Neurosama.dev\tests\mobile-interactions.test.cjs`
- Modify: `C:\Users\Admin\vs\Web dev\Neurosama.dev\index.html:6-8`
- Create: `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev\mobile-interactions.js`
- Create: `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev\tests\mobile-interactions.test.cjs`
- Modify: `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev\index.html:6-8`

**Interfaces:**
- Produces: `MobileInteractions.clampIndex(index: number, length: number): number`
- Produces: `MobileInteractions.moveIndex(index: number, delta: number, length: number): number`
- Produces: `MobileInteractions.upcomingDays(days: Array<{name: string}>, today: number, limit: number): Array<object>`
- `today` follows `Date#getDay()`: Sunday is `0`, Monday is `1`.

- [ ] **Step 1: Write the failing helper tests in both repositories**

```js
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
```

- [ ] **Step 2: Run the focused test in each repository and verify it fails**

Run: `node --test tests/mobile-interactions.test.cjs`

Expected: FAIL because `../mobile-interactions.js` does not exist.

- [ ] **Step 3: Implement the same helper file in each repository**

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MobileInteractions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const namesByDay = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  function clampIndex(index, length) {
    if (!Number.isFinite(length) || length <= 0) return 0;
    const safeIndex = Number.isFinite(index) ? Math.trunc(index) : 0;
    return Math.min(Math.max(safeIndex, 0), length - 1);
  }

  function moveIndex(index, delta, length) {
    return clampIndex((Number(index) || 0) + (Number(delta) || 0), length);
  }

  function upcomingDays(days, today, limit) {
    if (!Array.isArray(days) || days.length === 0) return [];
    const todayName = namesByDay[clampIndex(today, namesByDay.length)];
    const start = Math.max(0, days.findIndex((day) => day && day.name === todayName));
    const ordered = [...days.slice(start), ...days.slice(0, start)];
    return ordered.slice(0, Math.max(0, Math.min(Number(limit) || 0, ordered.length)));
  }

  return { clampIndex, moveIndex, upcomingDays };
});
```

- [ ] **Step 4: Load the helper before the component runtime on both sites**

Add `<script src="./mobile-interactions.js"></script>` after `random-selection.js` and before `support.js` in `index.html`.

- [ ] **Step 5: Run all unit tests in both repositories**

Run: `node --test tests/*.test.cjs`

Expected: all tests PASS.

- [ ] **Step 6: Commit the helper separately in each repository**

```powershell
git add -- mobile-interactions.js tests/mobile-interactions.test.cjs index.html
git commit -m "test: add mobile interaction helpers"
```

---

### Task 2: Build Both Sites’ Manual Mobile Carousels and Compact Schedules

**Files:**
- Modify: `C:\Users\Admin\vs\Web dev\Neurosama.dev\index.html`
- Modify: `C:\Users\Admin\vs\Web dev\Neurosama.dev\tests\random-selection.test.cjs`
- Modify: `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev\index.html`
- Modify: `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev\tests\random-selection.test.cjs`

**Interfaces:**
- Consumes: `MobileInteractions.clampIndex`, `MobileInteractions.moveIndex`, and `MobileInteractions.upcomingDays` from Task 1.
- Produces component state: `quoteIndex`, `artIndex`, and `showFullSchedule`.
- Produces render bindings: `quoteTrackStyle`, `artTrackStyle`, navigation handlers/disabled flags, `mobileSchedule`, `scheduleToggleLabel`, and `onToggleSchedule`.

- [ ] **Step 1: Replace obsolete scroll-snap assertions with these failing controlled-carousel assertions in both repositories**

```js
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
```

- [ ] **Step 2: Run both repositories' tests and verify the new assertions fail**

Run: `node --test tests/*.test.cjs`

Expected: FAIL on the new carousel and schedule assertions.

- [ ] **Step 3: Add carousel state and safe navigation methods to both components**

Add `quoteIndex: 0`, `artIndex: 0`, and `showFullSchedule: false` to component state. Add `quoteSwipeStart` and `artSwipeStart` instance fields and handlers that record `event.clientX`, compare pointer-up movement against a 40 px threshold, and call `MobileInteractions.moveIndex`. Reset `quoteIndex` to `0` after quote shuffle/load and `artIndex` to `0` after art load. Clamp each index whenever failed art removal changes the item count.

Use these exact state transitions:

```js
moveQuote = (delta) => this.setState((state) => ({
  quoteIndex: MobileInteractions.moveIndex(state.quoteIndex, delta, state.quotes.length)
}));

moveArt = (delta) => this.setState((state) => ({
  artIndex: MobileInteractions.moveIndex(state.artIndex, delta, state.artItems.length)
}));
```

- [ ] **Step 4: Wrap each media track and add manual navigation controls on both sites**

Wrap each existing track in a `.carousel-viewport`, bind `style="--carousel-index: {{ quoteIndex }}"` or `artIndex`, and add previous/next buttons below it. Bind pointer-down/pointer-up to the viewport, use `touch-action: pan-y`, and keep card click behavior intact. Buttons must use native `disabled`, a minimum 44 px hit target, and exact accessible labels `Previous quote clip`, `Next quote clip`, `Previous fan art`, and `Next fan art`.

- [ ] **Step 5: Replace mobile overflow with the same transform transition on both sites**

At `max-width: 600px`, clip `.carousel-viewport`, make each track `display:flex`, size each card to `flex: 0 0 100%`, and apply:

```css
.mobile-quote-track,
.mobile-art-track {
  transform: translate3d(calc(var(--carousel-index) * (-100% - 1rem)), 0, 0);
  transition: transform 340ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}
```

At larger widths, hide `.carousel-controls` and leave each track’s existing grid/columns layout intact. Under reduced motion, set the carousel transition duration to `0.01ms`.

- [ ] **Step 6: Render separate desktop and mobile schedule lists on both sites**

Keep `.schedule-grid.desktop-schedule-grid` bound to the full Monday-through-Sunday `schedule`. Add `.mobile-schedule-grid` bound to:

```js
const mobileSchedule = MobileInteractions.upcomingDays(
  schedule,
  new Date().getDay(),
  this.state.showFullSchedule ? 7 : 3
);
```

Render the same day, title, and time fields. Add a native button with `aria-expanded`, label `View full week` when collapsed and `Show less` when expanded, and `onClick` toggling `showFullSchedule`.

- [ ] **Step 7: Make mobile schedule cards compact and content-sized on both sites**

Use the following mobile constraints and hide the duplicate layout at the opposite breakpoint:

```css
.mobile-schedule-grid { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 0.65rem; }
.mobile-schedule-grid .schedule-card {
  inline-size: fit-content;
  min-inline-size: 8.5rem;
  max-inline-size: 100%;
  min-height: 0 !important;
  padding: 0.7rem 0.8rem !important;
}
@media (max-width: 600px) { .desktop-schedule-grid { display: none !important; } }
@media (min-width: 601px) { .mobile-schedule-wrap { display: none !important; } }
```

- [ ] **Step 8: Run both test suites and commit separately**

Run in each repository: `node --test tests/*.test.cjs`

Expected: all tests PASS.

```powershell
git add -- mobile-interactions.js tests/mobile-interactions.test.cjs tests/random-selection.test.cjs index.html
git commit -m "feat: animate mobile carousels and compact schedule"
```

---

### Task 3: Cross-Site Browser Verification

**Files:**
- Modify only files needed to fix a verified regression in either repository.

**Interfaces:**
- Consumes both completed site implementations.
- Produces verified responsive and accessible interaction behavior.

- [ ] **Step 1: Run both complete test suites**

Run in each repository: `node --test tests/*.test.cjs`

Expected: all tests PASS in both repositories.

- [ ] **Step 2: Start each local site and inspect responsive widths**

Serve each repository on a separate local port. Inspect 320 px, 375 px, 768 px, and 1440 px widths.

Expected: one media item per mobile viewport; existing desktop grids at 768 px and 1440 px; no horizontal page overflow.

- [ ] **Step 3: Verify manual carousel behavior**

For quotes and fan art on both sites, click next/previous, swipe left/right, wait at least 10 seconds, and confirm the active item does not change while idle. Confirm buttons disable at the first and last item and keyboard activation works.

- [ ] **Step 4: Verify compact schedule behavior**

Confirm only three day cards appear initially on mobile, the first is the current local weekday, `View full week` reveals seven, and `Show less` returns to three. Confirm `Stream 1` creates a compact card and a long title wraps without exceeding the viewport.

- [ ] **Step 5: Verify reduced motion and desktop preservation**

Emulate `prefers-reduced-motion: reduce` and confirm navigation changes items without a visible transition. At 768 px and 1440 px, confirm full media grids and the original seven-column/two-column schedule presentation remain usable.

- [ ] **Step 6: Check repository state**

Run in both repositories: `git status --short` and `git log -3 --oneline`.

Expected: no unintended or uncommitted files; only planned commits are present.

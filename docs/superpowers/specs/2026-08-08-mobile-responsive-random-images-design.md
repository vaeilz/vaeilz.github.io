# Mobile Responsiveness and Random Images Design

## Scope

Apply the same responsive and image-selection behavior to:

- `C:\Users\Admin\vs\Web dev\Neurosama.dev`
- `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev`

Preserve each site's current desktop visual identity, copy, colors, data sources, and character-specific content.

## Responsive Layout

Desktop layouts remain unchanged. At tablet and phone widths, each page will use targeted responsive CSS that overrides the existing inline layout values without rebuilding the page architecture.

The navigation becomes two compact rows: the brand and twin-site link remain in the first row, while the section links and shop action occupy a horizontally scrollable second row. The link row will use touch-friendly spacing and will not wrap.

The hero becomes a single-column layout with the text content first and character image second. Text, controls, and decorative elements will be constrained so they cannot create horizontal page overflow. Primary controls will have a minimum 44-pixel touch target.

Multi-column content sections will collapse based on available width. Video clips and fan-art cards become horizontal scroll-snap carousels on phones. Each viewport shows one complete item, with a small amount of the next item visible where the available width permits to communicate that the row can be swiped. Schedule cards and footer content stack cleanly rather than shrinking below readable sizes.

Embedded Twitch and video content will retain a valid aspect ratio and fit within the viewport. Motion preferences already supported by the sites will remain respected.

## Image and Video Browsing

On phones, the quote video list and fan-art gallery use horizontal overflow with touch scrolling, momentum scrolling, and mandatory snap alignment. Cards will have consistent mobile widths and will not be clipped vertically. Desktop retains the existing grids.

Scrollbar presentation may be visually minimized, but keyboard and pointer scrolling must continue to work. Existing click and playback behavior remains unchanged.

## Random Image Selection

Each site will maintain its own recent-image history in `localStorage`. The history key will be namespaced by site so Neuro and Evil selections do not affect each other.

When remote fan art loads, the system will:

1. Normalize and remove entries with missing or duplicate image URLs.
2. Read the recent URL history, treating missing, malformed, or inaccessible storage as an empty history.
3. Shuffle unseen items with Fisher-Yates.
4. Fill the visible selection from unseen items first, using shuffled previously seen items only when the unseen pool is too small.
5. Save the selected URLs as the new recent history, capped to a bounded number of entries.

When the catalog has been exhausted, old history naturally falls out of the bounded list so images can reappear. This provides variety across refreshes without permanently excluding content.

The initial hero GIF will be selected randomly rather than always using the first array element. Clicking the hero will choose a random different GIF rather than advancing through a predictable fixed sequence. If only one GIF is available, it remains selected.

Remote images that fail to load will be removed from the visible fan-art collection. If every item fails or the API request fails, the existing gallery error state remains available.

## Boundaries and Interfaces

Each single-file site keeps its existing component structure. Small pure helpers will own URL deduplication, safe history access, recent-aware selection, and selection of a random index different from the current index. The component will call these helpers from fan-art loading and hero interaction paths.

No new runtime dependency, build system, analytics, external API, or server-side component will be introduced.

## Error Handling and Privacy

Only public image URLs are stored. No user identifiers, browsing details, or sensitive data are persisted. Storage reads and writes are wrapped so privacy modes, quota errors, or unavailable storage cannot break rendering.

API response validation remains defensive. Invalid records are discarded. Image error handlers remove failed items without retry loops or unsafe HTML insertion.

## Verification

Both sites will be verified at representative viewport widths of 320, 375, 768, and 1440 pixels. Verification will cover:

- No horizontal document overflow.
- Horizontally scrollable mobile navigation.
- One-card-at-a-time video and image carousels on phones.
- Working touch-sized controls and readable typography.
- Responsive hero, embeds, schedules, and footer.
- Different initial hero choices across randomized runs.
- Hero clicks never choosing the currently displayed image when alternatives exist.
- Duplicate fan-art URLs removed from a selection.
- Recently shown images deprioritized on subsequent page loads.
- Safe fallback when `localStorage` is unavailable or malformed.
- Existing API and empty-state behavior preserved.
- Desktop layout remains visually consistent with the current sites.

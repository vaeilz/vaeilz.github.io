# Mobile Manual Carousel and Compact Schedule Design

## Scope

Apply the same responsive behavior to:

- `C:\Users\Admin\vs\Web dev\Neurosama.dev`
- `C:\Users\Admin\vs\Web dev\Evil.Neurosama.dev`

Desktop layouts remain unchanged unless required for shared accessibility behavior.

## Mobile Media Carousels

The quote-video and fan-art sections show one item at a time on mobile.

- Replace the current plain horizontal overflow behavior with a controlled carousel track.
- Move the track with an animated CSS transform so navigation visibly slides between items.
- Support manual touch/pointer swiping and previous/next arrow buttons.
- Do not autoplay or advance on a timer.
- Keep the selected item visible until the visitor navigates away from it.
- Disable the transition for `prefers-reduced-motion: reduce` while preserving navigation.
- Disable or hide navigation controls when there is no item in that direction.
- Keep controls keyboard accessible and give them descriptive accessible labels.
- Keep image and video links/actions unchanged.
- Preserve the existing randomized content selection and shuffle behavior.

## Mobile Weekly Schedule

The mobile schedule initially displays the next three days from the ordered weekly schedule.

- Add a `View full week` control to reveal all seven days.
- Change the control label to `Show less` while expanded.
- Use compact cards without a fixed or minimum height on mobile.
- Size each card to its content using intrinsic sizing rather than stretching every card to the container width.
- Give cards a practical minimum width for readable day/time labels and cap them at the available mobile width.
- Allow long stream titles to wrap inside the capped width.
- Keep short titles, such as `Stream 1`, visually compact.
- Keep the seven-column desktop schedule unchanged.
- Make the expansion control keyboard accessible and expose its expanded state.

## State and Behavior

- Each carousel has an independent active index.
- Clamp active indices after content is loaded, shuffled, or replaced.
- A shuffle resets the affected carousel to its first newly selected item.
- The schedule expansion state is mobile-only presentation state and does not alter fetched schedule data.
- Existing API failure and fallback states remain available.

## Verification

- Add unit coverage for index clamping/navigation and the three-day schedule selection logic.
- Run the existing tests in both repositories.
- Verify both sites at 320 px, 375 px, 768 px, and desktop width.
- Confirm swipe and arrow navigation animate without autoplay.
- Confirm the active media item remains unchanged while idle.
- Confirm short schedule titles produce smaller cards and long titles wrap within the viewport.
- Confirm `View full week` and `Show less` work with pointer and keyboard input.
- Confirm reduced-motion mode removes the sliding transition.

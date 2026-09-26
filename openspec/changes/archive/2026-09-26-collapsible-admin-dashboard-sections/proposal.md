## Why

The admin Dashboard can become difficult to scan when several operational sections contain many cards. Collapsible section rows will let administrators focus on the work they need while preserving a compact summary of the number of items and any items already marked urgent by the existing Dashboard presentation.

## What Changes

- Replace each Dashboard section heading with a clickable collapsible row.
- Start all sections collapsed when no saved preference exists.
- Restore and persist each section's expanded or collapsed state in a browser cookie.
- Display an always-visible total item count for every section.
- Display a separate red-flag count only when the section contains red-flagged items.
- Render red-flag count badges with a red background and white text.
- Calculate red-flag counts using each section's existing visual urgency rules; do not introduce a new API red-flag field.
- Preserve the existing Dashboard cards, actions, filtering, and card-level urgency styling.

## Capabilities

### New Capabilities

### Modified Capabilities

- `admin-screen-alignment`: The Dashboard section presentation gains collapsible rows, persistent section state, and item/red-flag count badges.

## Impact

- Affects the React Dashboard component and its focused tests.
- Adds client-side cookie handling for Dashboard presentation preferences; no API, database, or authentication changes are expected.
- Requires the production frontend build to be regenerated after implementation.

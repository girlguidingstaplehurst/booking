## Why

Completed event groups disappear from the date-bounded Dashboard invoice list. Although historical title search can find them, its Review route relies on that same date-bounded event data, so older groups may not be available there to start an invoice. Administrators need a direct route from a historical search result to invoice preparation.

## What Changes

- Add a `Create Invoice` action to historical event-group search results when the group has invoiceable sessions.
- Keep the existing `Review` action and hide invoice creation when no sessions remain invoiceable.
- Preserve existing group invoice rules: hourly groups can select uninvoiced sessions, including completed sessions; progressive per-session groups remain all-or-nothing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `admin-screen-alignment`: historical event-group search results provide a conditional direct invoice action in addition to Review.

## Impact

- Frontend: Dashboard `EventGroupSearch` result cards and their tests.
- No API or database changes are expected: search results already include the invoiceable session count, and group invoice preparation already accepts a group ID without a date restriction.
- The existing `invoice-creation` behavior and rate-specific selection rules remain unchanged.

## Context

See `proposal.md` for motivation and `specs/admin-screen-alignment/spec.md` for the behavior contract. Historical group search already returns group summaries and invoiceability, while the existing group invoice-preparation route looks up sessions by group ID without limiting them by date. The group review route is populated from a date-bounded event list and therefore is not a reliable entry point for older groups.

## Goals / Non-Goals

**Goals:**
- Make invoice preparation directly reachable from a historical group search result.
- Retain the existing review navigation and billing rules.

**Non-Goals:**
- Make historical sessions appear in the operational Dashboard or group review session list.
- Change invoice preparation, session selection, pricing, API contracts, or persistence.

## Decisions

- Add a separate `Create Invoice` action to each invoiceable search result, targeting the existing group invoice-preparation route. This reuses the date-independent preparation path and avoids making operational review load all historical sessions.
- Show the action only when the search result reports invoiceable sessions. Keep `Review` available regardless of invoiceability so search remains useful for already-invoiced groups.
- Keep invoice eligibility and selection server-authoritative. The preparation query and invoice submission validation continue to enforce hourly uninvoiced-session selection, progressive all-or-nothing invoicing, and rejection of stale or invalid selections.
- An alternative is to expand the group review loader to retrieve historical groups and sessions. That is broader than the invoicing need and changes the meaning and data volume of the operational review screen, so it is not part of this change.

## Risks / Trade-offs

- [The invoiceability count can become stale after search results load] -> The existing preparation query refreshes invoiceable sessions, and submission validation remains authoritative; do not rely on the displayed count for correctness.
- [Older group review pages may still report that a group is unavailable] -> The new direct invoice action bypasses review for this workflow; historical review improvements remain out of scope.

## Migration Plan

No data or API migration is required. Rollback consists of removing the additional search-result action; existing routes and invoice records remain unchanged.

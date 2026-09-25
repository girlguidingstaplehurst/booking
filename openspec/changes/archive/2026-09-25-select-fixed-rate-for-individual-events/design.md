## Context

The application already stores an individual event's `rate_id`, exposes authenticated rate data, supports fixed-session rate definitions, and calculates fixed-session invoice amounts. Admin creation and review therefore need to share the existing rate-selection path rather than introduce a second pricing model. See `proposal.md` for motivation and `specs/rate-definitions/spec.md` for the behavioral contract.

## Goals / Non-Goals

**Goals:**

- Make fixed-session rates available and visibly understandable in admin individual-event creation.
- Make fixed-session rates available when changing the rate during admin event review.
- Preserve the selected identifier through persistence and invoice preparation.
- Keep rate assignment authenticated and reject invalid identifiers without corrupting event data.

**Non-Goals:**

- Public users choosing rates.
- Independent rate overrides for events within an event group.
- Changes to rate-definition CRUD or fixed-session invoice arithmetic.
- Replacing the existing event-rate assignment API.

## Decisions

### Reuse the existing rate selector and event rate-assignment contract

The implementation should use the existing admin rate-loading and selection components wherever possible. This keeps rate labels and filtering consistent with the rates screen and avoids introducing a parallel fixed-price-specific endpoint. A new endpoint or separate fixed-price control was considered, but would duplicate authorization, validation, and persistence behavior.

### Treat the fixed-session rate as an ordinary event rate

Individual events continue to persist one rate identifier. The pricing mode is resolved from the referenced rate definition during invoice preparation. This preserves compatibility with existing hourly and progressive rates and avoids a schema migration. Adding a separate fixed-price column to events was considered, but would duplicate reusable rate data and complicate updates.

### Validate at both workflow boundaries

The frontend should expose the fixed-session option and show its per-session amount, while the authenticated backend remains authoritative for rate existence and assignment errors. Client-only filtering was considered insufficient because requests can be crafted outside the UI.

### Test behavior at workflow and invoice boundaries

Tests should verify that creation and review send/persist the selected fixed-session identifier and that invoice preparation applies the fixed-session amount. Existing rate-definition and invoice-calculation tests should remain unchanged except where shared fixtures need fixed-session coverage.

## Risks / Trade-offs

- [A rate selector may hide fixed-session definitions through an outdated filter] -> Update selector-specific tests and verify all rate modes remain visible.
- [A stale or invalid rate identifier could overwrite an event assignment] -> Preserve backend validation and assert failure leaves the prior assignment unchanged.
- [The frontend production bundle can become stale after JavaScript changes] -> Include the required frontend build/update step in implementation tasks.
- [Generated REST artifacts may drift if the API contract changes] -> Prefer the existing contract; regenerate all generated artifacts if an API change is proven necessary.

## Migration Plan

No database migration is expected because events already store a rate identifier and fixed-session rates already exist. Deploy the frontend and backend changes together, run focused frontend and Go tests, then run the full test suites. Rollback consists of reverting the application release; existing event rate assignments remain compatible.

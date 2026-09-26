## Context

The Dashboard currently derives its operational sections as arrays in `src/admin/Dashboard.js` and renders each non-empty section with a heading followed by a card grid. Existing urgency is represented in card presentation: event cards can use a red header for past events, invoice controls use a red scheme for cancelled invoices, and other sections have their own existing colors. See proposal.md and the modified admin-screen-alignment requirements for the user-visible contract.

## Goals / Non-Goals

**Goals:**

- Make section visibility independently controllable without changing the existing section filtering or card actions.
- Derive total and red-flag counts from the same section contents and urgency rules used for rendering.
- Persist presentation state across Dashboard reloads using a browser cookie.
- Keep the behavior robust when sections are added, removed, or the stored cookie is malformed.
- Preserve accessible keyboard interaction and heading semantics for the collapsible controls.

**Non-Goals:**

- No API, database, authentication, or event/invoice business-rule changes.
- No new backend red-flag field or separate alert section.
- No change to the existing card-level urgency colors or Dashboard item eligibility.
- No administrator-specific preference storage.

## Decisions

### Represent sections with stable identifiers

Assign each Dashboard section a stable identifier separate from its display title. Use the identifier for cookie keys and React state so wording changes do not discard preferences and new sections can safely default to collapsed.

### Keep section state local to the Dashboard

Initialize a state map from the cookie during Dashboard rendering, defaulting every known section to collapsed. Toggling a section updates only its entry and serializes the complete state map back to the cookie. A local state map is sufficient because the preference is scoped to this Dashboard view and does not need server synchronization.

### Store a small, validated cookie value

Use a dedicated cookie scoped to `/admin` with an explicit expiry. Store only a JSON object of recognized section IDs and boolean values. Parsing or validation failures fall back to all sections collapsed; unknown keys are ignored. The cookie contains no event, invoice, or authentication data.

### Derive counts alongside the section data

Retain the existing section membership calculations, then derive `totalCount` from the number of cards represented by the section. Derive `redFlagCount` through section-specific predicates that mirror the existing red visual treatment rather than applying one global rule. Do not show a red badge when that value is zero.

### Use a button-controlled disclosure pattern

Render each section heading row as an accessible button with an expanded state and a control relationship to its card region. The button remains visible when collapsed and includes the heading, badges, and disclosure indicator. The card region is rendered only when expanded, avoiding unnecessary layout work while preserving the existing card components.

### Test persistence and urgency independently

Add focused Dashboard tests for initial collapsed state, toggling, cookie restoration, malformed-cookie fallback, total counts, conditional red badges, and section-specific red-flag predicates. Preserve existing Dashboard workflow tests so the UI change cannot alter event filtering or actions.

## Risks / Trade-offs

- [Risk] A browser cookie is shared by browser users rather than tied to an administrator. -> Mitigation: this is explicitly accepted as a presentation-only preference and contains no sensitive data.
- [Risk] Cookie data can become stale when section IDs change. -> Mitigation: use stable IDs, ignore unknown keys, and default missing IDs to collapsed.
- [Risk] Red-flag predicates can drift from card styling. -> Mitigation: define the predicate next to the corresponding card urgency logic and cover each section with focused tests.
- [Risk] Hiding cards may make important work less visible. -> Mitigation: keep section headings and counts always visible, show red flags prominently, and start new or unknown sections collapsed only as explicitly requested.
- [Risk] Cookie parsing can fail in privacy-restricted or test environments. -> Mitigation: treat unavailable or invalid storage as an in-memory all-collapsed state without blocking Dashboard rendering.

## Migration Plan

1. Add the collapsible section model, cookie state handling, count badges, and accessible controls to the Dashboard.
2. Add or update focused Dashboard tests for state, counts, and existing urgency behavior.
3. Run the frontend test suite and regenerate the production frontend with `npm run build`.
4. Rollback consists of restoring the previous frontend implementation; the preference cookie can be ignored by older versions.

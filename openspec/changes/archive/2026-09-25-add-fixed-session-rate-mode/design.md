## Context

The current rate contract supports hourly pricing through `hourlyRate` and progressive per-session pricing through a two-tier `perSession` array. The selected rate ID is already referenced by events and event groups, while invoice preparation exposes the selected rate definition to the calculation layer. The admin editor currently infers the pricing mode from whether `perSession` is empty.

Fixed-session pricing should be a first-class mode without changing event references or introducing special half-day/full-day concepts. Existing rates and existing progressive calculations must remain compatible.

## Goals / Non-Goals

**Goals:**

- Represent hourly, fixed-session, and progressive pricing unambiguously in the API and persistence model.
- Validate exactly the fields required by the selected pricing mode.
- Charge one fixed session price per billable session, independent of elapsed hourly duration.
- Support creating, editing, listing, selecting, and displaying fixed-session rates through the admin UI.
- Preserve existing rate IDs and references when definitions are edited.

**Non-Goals:**

- No special `halfDay` or `fullDay` enum or business rule.
- No automatic inference of a session type from event duration.
- No changes to event or event-group rate-reference shape.
- No removal of hourly or progressive per-session pricing.

## Decisions

### Use an explicit pricing mode

Add a mode discriminator to the public rate representation and create/update bodies, with values equivalent to `hourly`, `fixedSession`, and `perSession`. Include a nullable or mode-specific `sessionPrice` field for fixed-session pricing. The API and server validation must reject missing or conflicting mode-specific values rather than infer the mode from empty fields.

An alternative was to infer fixed-session pricing from a non-empty `sessionPrice` or to encode it as a one-item progressive array. Inference preserves less reliable contracts, and the array encoding makes a fixed price look like progressive pricing; both were rejected in favor of explicit semantics.

### Persist fixed-session price separately

Add a nullable `session_price` column to `booking_rates`, retaining `hourly_rate` and `per_session` for existing data and progressive pricing. Existing rows migrate as hourly or progressive according to their current data. Reads and writes map the explicit mode and its fields consistently.

An alternative was replacing all pricing columns with a JSON pricing object. That would simplify adding future modes but would create a broader migration and make existing SQL and generated models less compatible, so it is out of scope.

### Keep rate selection unchanged

Existing rate selectors continue to select a rate ID. Fixed-session rates are not hidden from selectors; the rate summary identifies them as a fixed amount per session. The event model does not store duration type because duration labels are descriptive rate choices, not separate event state.

### Calculate fixed pricing by session count

Invoice calculation treats a fixed-session rate as one `sessionPrice` for each billable session. A standalone event therefore costs one session price; an event group multiplies the price by the number of billable sessions. Hourly and progressive branches remain unchanged.

### Regenerate contract-derived code

The OpenAPI contract remains the source of truth. After changing its rate schemas, run the repository's normal generation workflow so generated Go REST models, handlers, clients, mocks, and related artifacts remain synchronized rather than hand-editing generated files.

## Risks / Trade-offs

- **Existing clients omit the new mode field** -> Preserve a compatibility interpretation for existing hourly and progressive payloads during the transition, or version/coordinate clients as required by generated contract validation; document the chosen compatibility behavior in tests.
- **Nullable pricing columns permit inconsistent rows** -> Enforce mode-aware validation at the API boundary and add database constraints where practical; ensure reads handle legacy rows deterministically.
- **Fixed-session rates selected for arbitrary event durations may surprise administrators** -> Display explicit “per session” wording in summaries and form labels; do not silently derive pricing from duration.
- **Invoice paths may represent event groups differently** -> Add calculation tests for standalone events and groups, including multiple fixed sessions, before changing production behavior.
- **Generated artifacts can drift from the contract** -> Make generation a dedicated task and verify the generated diff and full test suite.

## Migration Plan

1. Add the nullable database column and migrate existing data without changing current hourly or progressive behavior.
2. Extend the OpenAPI schemas and regenerate derived code.
3. Deploy server and frontend support for the new mode.
4. Create fixed-session rates through the admin UI or API; existing rate IDs remain valid.
5. If rollback is required, stop creating fixed-session rates, revert application behavior, and retain or remove the new column only through a separately reviewed down migration after confirming no fixed-session data remains.

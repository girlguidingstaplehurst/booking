## Context

The existing `rate-definitions` capability represents hourly, fixed-session, and progressive per-session pricing. Rate data is exposed through the OpenAPI contract, persisted in `booking_rates`, mapped by the Go PostgreSQL layer, edited in the React administrator UI, and consumed by invoice calculation code. Individual-event and event-group selectors already have different compatibility behavior, so the new mode must be gated at that boundary rather than changing group pricing semantics.

## Goals / Non-Goals

**Goals:**

- Add a durable multi-day rate representation with explicit fields for the initial period count, initial daily rate, later daily rate, and hourly remainder rate.
- Calculate individual-event charges from elapsed time using full 24-hour periods and a tier-aware cap for remainder hours.
- Keep API, database, generated models, validation, UI, selectors, and invoice calculations consistent.
- Preserve existing modes and event-group behavior.
- Make the migration safe for existing rates by assigning a non-multi-day default state.

**Non-Goals:**

- Applying multi-day pricing to event groups.
- Reinterpreting calendar dates as billing periods; periods are elapsed 24-hour intervals.
- Replacing the existing hourly, fixed-session, or progressive per-session calculation models.
- Introducing a configurable cap rule; the remainder cap is derived from the current daily tier.

## Decisions

### Use a distinct pricing mode and explicit scalar fields

Represent the new mode as `multiDay` and add explicit fields equivalent to:

```text
initialDailyPeriods  positive integer
initialDailyRate     non-negative monetary value
dailyRate            non-negative monetary value
hourlyRate           non-negative monetary value
```

The existing `hourlyRate` field can represent the remainder hourly rate, while the two daily rates and period count need new persisted/API fields. This is preferred over encoding the values into `perSession`, because per-session pricing has different semantics and is used by event-group calculations. It also keeps the API self-describing and prevents accidental reuse by group pricing.

### Keep one pricing-mode invariant

Validation will require exactly one mode's fields to be active. Hourly, fixed-session, and per-session payloads retain their current invariants. A multi-day payload must have a positive integer initial period count, non-negative initial and later daily rates, and a non-negative hourly rate, while session pricing fields and progressive tiers remain empty or null.

### Calculate elapsed duration in the individual-event path

For an individual event, derive:

```text
fullPeriods    = floor(durationHours / 24)
remainingHours = durationHours - (fullPeriods * 24)
```

Then calculate:

```text
fullPeriodCost = min(fullPeriods, initialDailyPeriods) * initialDailyRate
               + max(fullPeriods - initialDailyPeriods, 0) * dailyRate

remainderCap = initialDailyRate when fullPeriods < initialDailyPeriods
             = dailyRate         otherwise

remainderCost = min(remainingHours * hourlyRate, remainderCap)
total = fullPeriodCost + remainderCost
```

Duration arithmetic should preserve fractional hours where the existing event timestamps permit them; exact 24-hour multiples produce no remainder. Monetary arithmetic should use the project's established numeric conventions and avoid introducing a second calculation formula in group pricing.

### Gate multi-day rates in selectors and assignment validation

The individual-event selector and review workflow may assign `multiDay`. Event-group selectors must filter it out, and the service/database assignment path should reject an incompatible group assignment rather than relying solely on UI filtering. This provides defense in depth for API clients and preserves existing group behavior.

### Follow the API-first generation workflow

The OpenAPI contract is the source of truth for new fields and the `multiDay` enum value. Generated REST models, clients, mocks, and builders must be regenerated rather than hand-edited. Database migration and query mapping changes must keep nullable/non-applicable values compatible with existing hourly, fixed-session, and per-session rows.

### Use additive persistence with safe defaults

Add the new columns and pricing-mode constraint in a forward migration. Existing rows remain hourly or retain their current mode and receive neutral defaults for the new fields. The migration must have a down migration suitable for local/test rollback, subject to the repository's normal migration conventions.

## Risks / Trade-offs

- [Risk] Duration calculations may differ between browser invoice previews and backend-generated invoice data. -> Centralize or mirror the same formula and add shared boundary tests for 0h, 24h, tier transitions, partial periods, and cap behavior.
- [Risk] Existing rows or generated clients may be incompatible with newly required API fields. -> Use additive schema changes, preserve existing response fields, regenerate all generated artifacts, and verify old rate modes through regression tests.
- [Risk] A multi-day rate could be assigned to an event group through a direct API request. -> Enforce compatibility in the service/domain assignment path as well as in selectors.
- [Risk] Floating-point duration or monetary rounding can produce off-by-small-amount totals. -> Reuse existing monetary calculation/formatting conventions and test values around 24-hour boundaries and cap thresholds.
- [Risk] Editing a rate referenced by existing events changes future invoice results. -> Preserve the existing in-place edit behavior and explicitly test that only the definition changes, while documenting that invoice preparation uses the current selected definition as existing modes do.

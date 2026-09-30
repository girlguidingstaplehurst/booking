## Why

The public What's On page currently uses the first day of the current month as the lower bound of its implicit schedule period. As a result, events that have already started earlier in the month can still be displayed. The default public schedule should instead show only events that have not yet started, while preserving the existing behavior for callers that explicitly provide a date range.

## What Changes

- Change the implicit `/api/v1/whats-on` schedule to exclude every event whose start time is at or before the current instant.
- Retain the existing implicit future horizon of approximately 18 months.
- Preserve interval-overlap behavior for requests that explicitly provide both `from` and `to` dates.
- Keep visibility filtering, grouping, ordering, and What's On rendering behavior unchanged apart from removing already-started events from the implicit schedule.
- Add automated coverage for events that started yesterday, started earlier today, are currently in progress, start later today, and are in the future.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `public-whats-on`: The implicit default schedule must include only publicly visible events whose start time is later than the current instant; explicit date-range requests retain existing overlap semantics.

## Impact

- `internal/rest/server.go`: default What's On period construction and distinction between implicit and explicit date-range requests.
- `internal/postgres/db.go`: public schedule filtering may need to support an exact current-time lower bound for the implicit request without changing explicit date-range behavior.
- Public What's On API behavior and its backend tests.
- `openspec/specs/public-whats-on/spec.md`: requirement delta for default-period eligibility.

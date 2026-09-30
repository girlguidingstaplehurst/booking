## Context

The default `GET /api/v1/whats-on` request currently constructs a lower bound at the first day of the current month, while `ListWhatsOn` applies interval-overlap filtering. This permits events that have already started earlier in the month to appear. Explicit requests use date-only `from` and `to` parameters and must preserve their current overlap semantics.

## Goals / Non-Goals

**Goals:**

- Apply an exact current-time start cutoff only to the implicit default What's On request.
- Preserve the existing approximately 18-month implicit horizon.
- Preserve explicit date-range interval overlap, grouping, visibility, ordering, and response shape.
- Make the default-versus-explicit behavior directly testable.

**Non-Goals:**

- Changing the public API schema or adding query parameters.
- Changing the separate `/api/v1/events` booking availability endpoint.
- Removing currently running events from any explicit date-range query.
- Changing event-group visibility, event ordering, or frontend card rendering.

## Decisions

### Keep request-mode distinction in the REST handler

The handler already distinguishes an implicit request from one with explicit `from` and `to` values. It should retain that distinction rather than making the database infer whether a date was supplied by the caller. The implicit branch supplies a precise current timestamp as the lower eligibility bound; the explicit branch continues to supply date-based bounds.

### Preserve one public schedule query path with an explicit cutoff contract

The database access layer should support the exact lower-bound semantics required by the implicit request without changing explicit overlap behavior. The implementation may use a dedicated method or an explicit query option, but it must not overload a date-only API contract in a way that silently changes explicit callers.

For the implicit request, eligibility is based on `event_start > now`, not on `event_end`. This intentionally excludes events already in progress. The upper bound remains the existing future horizon.

### Test at the REST/database boundary and preserve API compatibility

Tests should verify the exact time bounds/mode passed for implicit and explicit requests, and database-level query coverage should verify started, in-progress, future, and out-of-range events. No generated API files or OpenAPI schema changes are expected because the endpoint shape remains unchanged.

## Risks / Trade-offs

- [Time-boundary flakiness] Events exactly at the captured current instant can make tests nondeterministic -> inject or capture a stable reference time in tests and use strict start-time comparison.
- [Timezone mismatch] Application-local time and PostgreSQL timestamps could interpret “now” differently -> use the existing database/application time conventions consistently and test timestamps with an explicit location.
- [Accidental explicit-query regression] Reusing the new cutoff for all calls could remove valid events from explicit ranges -> keep request mode explicit in the handler/database contract and add a regression test for an already-started event overlapping an explicit range.
- [Long-running query compatibility] A precise timestamp lower bound differs from the existing date-only period bound -> document the distinction in the method contract and retain the original date overlap path for explicit requests.

## Migration Plan

No data migration or API migration is required. Deploy the service and verify the default public schedule; rollback consists of reverting the service change if the schedule filtering causes an unexpected compatibility issue.

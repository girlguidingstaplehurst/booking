## 1. Define the request-mode filtering contract

- [x] 1.1 Update the What's On handler/database boundary to distinguish implicit default requests from explicit `from`/`to` requests, using an exact current-time lower cutoff only for the implicit mode; verify the existing explicit date-range behavior remains represented by the original overlap contract.
- [x] 1.2 Preserve the implicit upper horizon and strict future-start rule (`event_start > now`); verify the resulting default query cannot include an event that has already started, including an event still in progress.

## 2. Add backend regression coverage

- [x] 2.1 Add handler/service tests for implicit requests, covering events before today, earlier today, currently in progress, later today, and beyond the horizon; verify only not-yet-started events within the horizon are eligible.
- [x] 2.2 Add regression coverage for explicit `from`/`to` requests with an already-started event overlapping the requested period; verify it remains included according to existing interval-overlap behavior.
- [x] 2.3 Add or update database query tests with stable reference timestamps and explicit timezone handling; verify strict boundary behavior at the captured current instant and deterministic results.

## 3. Validate the public schedule

- [x] 3.1 Run the focused REST/PostgreSQL test suites and verify the new implicit/default and explicit-range scenarios pass without changing response shape, grouping, visibility, or ordering.
- [x] 3.2 Run the complete Go test suite and verify no unrelated API or booking-availability behavior regresses.

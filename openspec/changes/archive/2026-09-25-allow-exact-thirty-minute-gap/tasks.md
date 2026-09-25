## 1. Conflict-rule analysis

- [x] 1.1 Trace all nearby-booking callers and document the expected exact-boundary behavior for ordinary creation, public booking, and event-date updates.
- [x] 1.2 Confirm event-group creation and duplication remain overlap-only and are outside the boundary-rule change.

## 2. Database validation

- [x] 2.1 Update the nearby-booking predicate so an exact 30-minute gap is accepted while shorter gaps and overlaps remain rejected.
- [x] 2.2 Apply the equivalent boundary behavior to event-date updates.
- [x] 2.3 Preserve transaction locking, error handling, and the existing event-group overlap-only path.

## 3. Automated coverage

- [x] 3.1 Add ordinary event creation coverage for an exact 30-minute gap.
- [x] 3.2 Add public booking coverage for an exact 30-minute gap, if the existing integration fixture exposes this path separately.
- [x] 3.3 Add event-date update coverage for an exact 30-minute gap.
- [x] 3.4 Retain or add regression coverage proving a 29-minute gap is rejected.
- [x] 3.5 Retain overlap rejection and event-group scheduling coverage.

## 4. Validation

- [x] 4.1 Run formatting and focused Go tests.
- [x] 4.2 Run the full Go test suite and inspect for scheduling regressions.
- [x] 4.3 Run OpenSpec validation and confirm generated API artifacts are not required.

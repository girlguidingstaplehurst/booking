## 1. Conflict-validation design

- [x] 1.1 Trace all callers of the nearby-booking helper and document the intended validation mode for each caller.
- [x] 1.2 Define the overlap-only predicate for event-group schedules, including boundary behavior and validation of multiple instances in one request.

## 2. Database implementation

- [x] 2.1 Add a database-layer conflict-check path or parameter that distinguishes overlap-only checks from the existing 30-minute nearby check.
- [x] 2.2 Update event-group creation to use overlap-only validation while retaining transaction and locking guarantees.
- [x] 2.3 Update event-group duplication to use overlap-only validation while retaining transaction and locking guarantees.
- [x] 2.4 Confirm ordinary event creation, public booking, and event-date update callers retain the nearby 30-minute check.

## 3. Automated coverage

- [x] 3.1 Add event-group creation coverage for a non-overlapping instance within 30 minutes of an existing event.
- [x] 3.2 Add event-group duplication coverage for a non-overlapping instance within 30 minutes of an existing event.
- [x] 3.3 Add or retain rejection coverage for actual overlaps and verify no partial group or session persists.
- [x] 3.4 Add or retain regression coverage showing ordinary event workflows still reject near-but-non-overlapping events.

## 4. Validation

- [x] 4.1 Run formatting and focused Go tests.
- [x] 4.2 Run the full Go test suite and inspect for regressions in shared scheduling behavior.
- [x] 4.3 Run OpenSpec validation and confirm generated artifacts are not required because the API contract is unchanged.

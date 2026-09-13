## Why

Creating an event group currently fails when inserting its generated event instances because the SQL value list contains more expressions than the `booking_events` column list. This prevents the entire event-group creation workflow from succeeding even when the request and selected keyholder are valid.

## What Changes

- Correct the event-group instance insert so the selected group keyholder is written to both event keyholder columns without an extra SQL expression.
- Add regression coverage proving an event group with one or more instances can be persisted and that the keyholder is applied to entry and exit.
- Extend the `mage e2ETest` target to run the Go integration tests before the Playwright acceptance tests using the shared E2E admin token.
- Preserve the existing transaction, nearby-booking checks, rate selection, and keyholder validation behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `keyholder-management`: ensure event-group creation successfully persists generated instances with the selected keyholder assigned to both entry and exit.

## Impact

- Affects the PostgreSQL event-group persistence path in `internal/postgres/db.go`.
- Affects the E2E test orchestration in `Magefile.go` and stale Playwright selectors for the current Create Events button label.
- Requires backend regression coverage for the event-group instance insert.
- No API contract, migration, or frontend changes are expected.

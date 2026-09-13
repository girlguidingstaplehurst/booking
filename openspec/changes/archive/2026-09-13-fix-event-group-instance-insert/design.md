## Context

The event-group persistence path creates one `booking_event_groups` row and then inserts one `booking_events` row per requested instance inside a transaction. The instance insert names twelve target columns, but its SQL value list currently contains thirteen expressions and references a non-existent eleventh argument. The selected group keyholder is intended to populate both `keyholder_in_id` and `keyholder_out_id`.

## Goals / Non-Goals

**Goals:**

- Make the event-group instance SQL column and value counts match.
- Assign the selected group keyholder to both event keyholder columns.
- Preserve transaction rollback, nearby-booking checks, active-keyholder validation, and event-group rate/details behavior.
- Add regression coverage for successful persistence of generated instances.

**Non-Goals:**

- Changing migrations, API schemas, generated REST code, or frontend behavior.
- Changing how event-group keyholders are selected or validated.
- Changing individual event insertion logic.

## Decisions

### Reuse one keyholder SQL argument for both columns

Change the final two event keyholder value expressions to use the supplied keyholder argument for both `keyholder_in_id` and `keyholder_out_id`. This preserves the event-group contract and avoids adding a duplicate Go argument solely for the same UUID. The alternative of passing the UUID twice is functionally equivalent but increases positional argument noise.

### Keep the fix local to the existing insert

Do not introduce a query builder or alter the schema. The column list already reflects the current migration state, and the defect is an isolated positional placeholder mismatch. Keeping the SQL local minimizes risk to the transaction and adjacent event-creation paths.

### Test persistence at the database boundary

Add regression coverage that exercises event-group creation with an instance and verifies the generated event references the same keyholder for entry and exit. If the package’s database test harness requires PostgreSQL, use that existing integration setup rather than a mock that cannot detect SQL expression-count errors.

### Run backend and browser E2E tests from one target

The Mage `e2ETest` target will pass the existing E2E JWT as both the Playwright authentication token and `BOOKING_ADMIN_TOKEN`, run `go test ./internal/test`, and then run `npm run e2e`. This ensures database-backed regression tests execute in the same configured environment as the browser acceptance tests. Playwright selectors that still reference the former `Submit` label will use the current `Create Events` label.

## Risks / Trade-offs

- [Risk] A test may only validate the returned API response and miss the SQL mismatch. -> Mitigation: exercise the database insertion path and inspect persisted event columns.
- [Risk] Existing databases may have partially created data from failed transactions. -> Mitigation: retain the transaction boundary; failed attempts roll back the group and instances together, and no migration is required.
- [Trade-off] Positional SQL placeholders remain less self-documenting than named parameters. -> Mitigation: keep the explicit column list and regression test the keyholder mapping.

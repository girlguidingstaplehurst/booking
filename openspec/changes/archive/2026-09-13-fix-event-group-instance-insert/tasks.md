## 1. SQL Correction

- [x] 1.1 Correct the event-group instance `booking_events` insert placeholder list so the twelve target columns have twelve expressions and the selected keyholder populates both keyholder columns; verify the SQL argument mapping is valid

## 2. Regression Coverage

- [x] 2.1 Add an event-group integration test using the existing generated client and database test helpers, creating a group with at least one instance and a valid keyholder; verify the request succeeds and generated instances reference the keyholder for both entry and exit
- [x] 2.2 Add coverage for a group with multiple instances and verify all instances are persisted within the transaction; run the focused integration test against the configured service/database
- [x] 2.3 Extend `mage e2ETest` to run the Go integration tests with the existing E2E admin token before Playwright, update stale Create Events selectors, and verify the combined target passes

## 3. Verification

- [x] 3.1 Run the relevant Go package and integration tests, then run `go test ./...` and verify no unrelated backend behavior regresses

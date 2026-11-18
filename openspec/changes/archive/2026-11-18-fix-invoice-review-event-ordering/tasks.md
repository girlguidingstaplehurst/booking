# Tasks

## 1. Add regression coverage and fix event ordering

- [x] 1.1 Extend the PostgreSQL integration test for `GetInvoiceByID` with multiple associated events and assert that results are ordered by start time; verify the test package compiles with `go test -run '^$' ./internal/postgres`.
- [x] 1.2 Order invoice-associated events by `booking_events.event_start`; verify `go test ./internal/postgres ./internal/rest` passes.

## 2. PostgreSQL integration verification

- [x] 2.1 Against a migrated test database, run `BOOKING_TEST_DATABASE_URL=<test-db> go test ./internal/postgres -run '^TestAddZeroCostInvoicePersistsPaidInvoiceAtomically$' -count=1` and verify the associated events are returned in start-time order.

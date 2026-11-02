## 1. Persistence

- [x] 1.1 Add a migration for nullable `created_at` columns on `booking_events` and `booking_event_groups`, adding the columns before setting `DEFAULT now()` so existing rows remain unknown; verify a migrated database preserves `NULL` for old rows and supplies a time for new inserts.
- [x] 1.2 Verify all creation paths use the database-assigned time for new event rows and group rows, including public booking, admin multi-event creation, group creation, and group duplication; extend persistence/integration tests to assert timestamps exist and are not inherited from a duplicated source.

## 2. Admin API

- [x] 2.1 Add nullable `createdAt` datetime properties to the admin event and event-group response schemas, keeping public schemas unchanged; run `go generate ./...` and verify generated contract types include the fields.
- [x] 2.2 Select and map creation timestamps in authenticated admin event-list, event-detail, invoiceable-event, event-group list, and event-group search responses; add API/database tests for known timestamps and `null` historical timestamps, and verify public response schemas remain unchanged.

## 3. Admin review pages

- [x] 3.1 Display the event creation time, formatted consistently with event-note timestamps, on the individual event review page and show `Unknown` for a missing value; verify both states in `ReviewEvent` frontend tests.
- [x] 3.2 Display the group creation time on the event-group review page and show `Unknown` for a missing value; verify both states in `ReviewEventGroup.test.js`.

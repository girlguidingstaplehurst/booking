## Why

Administrators cannot tell when a public booking, admin-created event, or event group was created. Recording server-assigned creation times and showing them on review pages provides reliable creation history without trusting client clocks.

## What Changes

- Record a server-generated creation timestamp for each event and event group created through public booking, admin event creation, event-group creation, or event-group duplication.
- Expose creation timestamps through authenticated admin event/group data and show them on individual event and event-group review pages.
- Keep historical creation times unknown where no trustworthy value exists; do not assign migration time as if it were the original creation time.
- Keep timestamps out of public schedule views and dashboard cards.

## Capabilities

### New Capabilities
- `event-creation-timestamps`: Record and display server-assigned creation times for events and event groups.

### Modified Capabilities

## Impact

- PostgreSQL schema and creation queries in `internal/postgres/db.go` and `db/migrations/`.
- Admin API contract in `api/public-api.yaml` and generated Go/client artifacts.
- Admin event and event-group review pages and their tests.
- Public event creation remains unchanged at the form/API boundary; the server records the time when persistence succeeds.

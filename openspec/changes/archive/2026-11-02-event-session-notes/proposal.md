## Why

Administrators need a durable, attributable place to record internal context and follow-up for an individual booking event or session. Today the event Review screen has no note history, so useful context is not captured alongside the event.

## What Changes

- Add an admin-only, append-only notes history to each individual event/session.
- Allow authenticated administrators to submit plain-text notes in every event status.
- Record the authenticated administrator's email and server submission time for each note, and display notes newest first on the event Review screen.
- Do not expose notes in public or event-group views, and do not provide edit or delete operations.

## Capabilities

### New Capabilities
- `admin-event-notes`: Internal, attributable notes attached to individual events/sessions and displayed on their admin Review screen.

### Modified Capabilities

## Impact

- Event review UI in `src/admin/ReviewEvent.js` and its tests.
- Versioned admin API contract in `api/public-api.yaml`, with generated Go REST types/handlers and generated frontend/API test artifacts.
- Event persistence in PostgreSQL, including a migration and database operations.
- Admin request handling in `internal/rest` and corresponding API, database, and frontend tests.

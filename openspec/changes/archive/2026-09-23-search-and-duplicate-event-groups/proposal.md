## Why

Administrators can currently reach event groups through the operational Dashboard window, but completed groups eventually disappear from that view and cannot be conveniently reused. The system needs a historical title search and a safe duplication workflow so administrators can find a prior group and create a new schedule from its setup without copying old sessions or invoices.

## What Changes

- Add an authenticated Event Group Search widget at the bottom of the Dashboard.
- Search event-group titles as the administrator types, requiring at least three characters before querying and returning results in descending latest-session date order.
- Render search results using the existing event-group card presentation with a Review action linking to the event-group review route.
- Add a Duplicate Event Group action from event-group review that opens a dedicated duplicate form.
- Duplicate the source group’s non-editable setup while starting with no dates or sessions.
- Allow administrators to edit the duplicated rate, keyholder, and newly entered date/time instances; keep copied name, details, visibility, and contact fixed.
- Keep invalid inherited rates and keyholders visible in their selectors and block submission with validation errors until valid replacements are selected.
- Add a server-authoritative duplication operation that validates the source, editable references, schedule, and conflicts transactionally and never copies invoices or existing session identifiers.

## Capabilities

### New Capabilities
- `event-group-search-and-duplication`: Find historical event groups and create a new group from reusable setup with a new schedule.

### Modified Capabilities
- `admin-screen-alignment`: Extend Dashboard and event-group review behavior with historical search and duplication navigation.

## Impact

- Frontend Dashboard, event-group review, routing, and a dedicated duplicate form.
- Versioned REST contract and generated REST/client models for event-group search and duplication.
- Go REST handlers and PostgreSQL queries/transactions for historical group lookup and server-authoritative duplication.
- Frontend, backend, and integration tests; generated artifacts must be regenerated from the API contract.

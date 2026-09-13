## Why

The Dashboard currently presents an approval action that does not perform an operation, and it lists unapproved individual events in workflows that should only operate on approved bookings. This can mislead administrators into attempting invalid invoice or keyholder workflows.

## What Changes

- Remove the inert `Approve` action from individual event cards in the Dashboard's approval section.
- Restrict individual events in `Events to be invoiced` to events whose status is `approved`.
- Restrict individual events in `Needing keyholders` to events whose status is `approved`.
- Keep event-group Dashboard behavior unchanged because event groups are created in the approved state and their API representation has no separate status.
- Keep the functional `Approve Event` action on the event review screen unchanged.
- Add Dashboard test coverage for the removed action and approval-based visibility.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `admin-screen-alignment`: Change Dashboard approval action and restrict invoice/keyholder workflow lists to approved individual events.

## Impact

- Frontend: `src/admin/Dashboard.js` and `src/admin/Dashboard.test.js`.
- API: No endpoint, request, response, or event-group model changes.
- Backend and event review workflows: Unchanged.

## Why

The event-group form displays an `Unassigned` option through the shared keyholder selector, but event groups require an active keyholder at creation. The form must preserve that option for reusable event assignment controls while making the event-group creation validation explicit and preventing an unassigned group request.

## What Changes

- Keep `Unassigned` visible in the shared keyholder selector.
- Ensure event-group client-side validation rejects the empty keyholder value.
- Show the validation error when an administrator attempts to submit an event group without selecting a keyholder.
- Ensure the event-group request is not sent when the keyholder is unassigned.
- Preserve optional keyholder assignments for individual events and their later assignment workflow.
- Add regression coverage for the event-group validation path and the shared selector behavior.

## Capabilities

### New Capabilities

<!-- No new capability is introduced. -->

### Modified Capabilities

- `keyholder-management`: Clarify and verify that event-group creation requires a selected active keyholder while individual event keyholders remain optional.

## Impact

- Affected frontend: `CreateEventGroup`, the shared `KeyholderSelect`, and related tests.
- Affected API usage: no endpoint or payload changes; invalid client submissions are stopped before `adminAddEventGroup` is called.
- Backend and database: no changes; the existing required event-group keyholder model remains authoritative.
- Individual event creation and later keyholder assignment remain unchanged.

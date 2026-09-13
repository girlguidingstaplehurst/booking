## Why

Event-group cards in the Dashboard's "Event groups with remaining sessions" section currently show `Create Invoice` even though that section is for reviewing active or upcoming sessions. The action duplicates the invoice workflow exposed by the event-group review page and makes the card's action hierarchy unclear, while the `Events to be invoiced` section still needs to provide direct invoice creation.

## What Changes

- Hide the `Create Invoice` action on event-group cards rendered in the "Event groups with remaining sessions" section.
- Preserve the `Review` action on those remaining-session group cards.
- Preserve direct event-group invoice creation in the `Events to be invoiced` section.
- Add Dashboard regression coverage that distinguishes the remaining-session and invoice-preparation sections.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `admin-screen-alignment`: Clarify Dashboard event-group action behavior so remaining-session cards provide review access without a direct invoice-creation action, while invoice-eligible group cards retain invoice creation.

## Impact

- Affected frontend rendering: `src/admin/Dashboard.js`.
- Affected frontend tests: `src/admin/Dashboard.test.js`.
- No API, database, route, invoice calculation, or external dependency changes are expected.

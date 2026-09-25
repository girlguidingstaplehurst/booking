## Why

Administrators need to apply an existing fixed-price rate when creating or reviewing an individual event. Although fixed-session rates and event rate persistence already exist, the individual-event workflows must consistently expose and preserve that choice so invoices reflect the agreed per-session price.

## What Changes

- Allow the admin individual-event creation workflow to select an existing fixed-session rate.
- Allow the admin event-review workflow to select or change an individual event to an existing fixed-session rate.
- Ensure the selected rate is persisted on the individual event and is used by subsequent invoice preparation.
- Add or update API, frontend, and automated test coverage for fixed-session rate selection in both workflows.
- Leave public booking, event-group per-event overrides, and reusable rate-definition management unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `rate-definitions`: Extend the existing rate-selection behavior so fixed-session definitions are available when assigning rates to individual events during admin creation and review.

## Impact

- Admin event creation and event review UI components and their rate-selector behavior.
- Existing admin event rate-assignment API usage and validation, if gaps are found.
- Invoice-preparation integration tests confirming the event’s selected fixed-session rate is retained.
- Frontend and Go test suites; generated API files only if the contract requires a change.

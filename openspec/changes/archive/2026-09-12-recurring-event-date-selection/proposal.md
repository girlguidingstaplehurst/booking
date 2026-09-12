## Why

The date tool must support both one-off events and recurring events. A single control with one-off creation as the default and optional weekly recurrence will make ordinary bookings straightforward while making recurring schedules faster to create and skipped weeks explicit.

## What Changes

- Replace manual repeated date/time entry with a date and time control that supports one-off events and optional weekly recurrence.
- Default the control to one-off mode, with one date and fixed start and end times.
- Allow an administrator to opt into weekly recurrence with an inclusive end date.
- Generate all weekly occurrences between the first date and end date when recurrence is enabled.
- Allow individual generated weeks to be excluded before submission.
- Show the resulting occurrence preview and count.
- Submit one-off events and remaining recurring occurrences as the existing concrete `instances` array.
- Reject invalid schedules, including an end date before the first date, an invalid time range, or a recurring schedule with no remaining occurrences.
- Preserve existing event conflict handling and event-group behavior.

## Capabilities

### New Capabilities

- `recurring-event-date-selection`: Generate and review weekly event instances with explicit skipped weeks.

### Modified Capabilities

<!-- No existing capability requirements cover the multiple-date scheduling behavior. -->

## Impact

- Affected frontend: the shared admin date/time accumulation control used by event and event-group creation.
- Affected frontend tests: scheduling generation, exclusion, validation, preview, and local-time behavior.
- Affected API usage: request payload construction continues to use the existing `instances` fields for `adminAddEvents` and `adminAddEventGroup`.
- Backend persistence and database schema: no recurrence data is stored and no migration is expected.
- Existing booking conflict, transaction, billing, and event-group semantics remain unchanged.

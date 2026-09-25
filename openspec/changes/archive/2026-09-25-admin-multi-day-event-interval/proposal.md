## Why

The admin's Create Events workflow currently accepts only a single calendar date, so administrators cannot record one continuous event that begins on one date and ends on a later date. The backend already accepts concrete start and end timestamps, making this a focused extension of the existing date-range control.

## What Changes

- Add an opt-in multi-day option to the date/time accumulator used by the admin Create Events page.
- When enabled, allow separate start and end dates and times and submit one continuous `from`/`to` interval.
- Validate that the complete end timestamp is after the complete start timestamp.
- Preserve the current one-day behavior when the option is disabled.
- Keep the option unavailable in event-group creation and the public event-creation form.
- Add automated coverage for multi-day validation, interval generation, and Create Events page exposure.

## Capabilities

### New Capabilities

- `admin-multi-day-event-creation`: Allows administrators to create one continuous event interval spanning multiple calendar days.

### Modified Capabilities

- None.

## Impact

- Affected frontend code: `src/admin/CreateEvents.js` and `src/admin/components/DateTimeRangeAccumulator.js`.
- Affected frontend tests for the accumulator and Create Events page.
- No API or database changes are expected; the existing admin add-events endpoint already accepts concrete ISO start and end timestamps.
- Event-group and public event-creation workflows remain behaviorally unchanged.

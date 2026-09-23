## Why

The Create Event Group form currently accepts one date schedule, which prevents administrators from creating a group with multiple weekly sessions in the same week (for example, Monday and Wednesday). Administrators need independent date sets while retaining the existing event-group API and concrete-instance persistence model.

## What Changes

- Allow the event-group date form to contain multiple independent date sets.
- Let each date set represent either one event or a weekly recurring schedule.
- Generate and preview occurrences independently for each date set.
- Allow individual generated weekly occurrences to be excluded within each set.
- Combine all remaining occurrences into the existing `instances` request payload.
- Validate each date set and reject submissions with invalid or empty sets.
- Reject duplicate exact date/time occurrences instead of silently deduplicating them.
- Defer monthly recurrence to a separate change.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `recurring-event-date-selection`: Extend date selection from one schedule to multiple independent one-off or weekly schedules while preserving concrete instance submission.

## Impact

- Frontend date-selection components and Create Event Group form.
- Frontend tests for date-set generation, exclusion, validation, duplicate detection, and flattened submission.
- Existing recurring-date behavior and specification scenarios.
- No API schema or database model change is expected; the existing `instances` array remains the integration boundary.

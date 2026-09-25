## Context

The Create Events page uses `DateTimeRangeAccumulator`, which currently combines one date with two times and emits a single concrete `{ from, to }` instance. The same component is used through the event-group date-set control, so the multi-day behavior must be explicitly opt-in. The existing admin API already accepts concrete ISO timestamps and does not require a schema change.

## Goals / Non-Goals

**Goals:**

- Add a Create Events-only opt-in for continuous multi-day intervals.
- Preserve the accumulator's existing one-day and weekly recurrence behavior for all current callers.
- Validate and emit one concrete interval using the complete start and end timestamps.
- Cover pure validation/generation behavior and the page-level opt-in wiring with tests.

**Non-Goals:**

- Changing event-group recurrence or date-set behavior.
- Adding multi-day support to the public event form.
- Splitting a multi-day interval into daily occurrences.
- Changing the REST contract, persistence model, calendar representation, or API version.

## Decisions

- **Use an explicit component capability prop.** `CreateEvents` will pass a prop such as `allowMultiDay` to the accumulator. The default will be disabled, so event groups and any other callers retain current behavior without changes. An alternative would be to expose the option globally, but that would unintentionally expand the public and event-group workflows.

- **Represent multi-day mode as one interval.** The accumulator will build one timestamp from the start date/time and one timestamp from the end date/time, then emit one `{ from, to }` pair. Generating daily instances was rejected because it changes booking and conflict semantics and belongs to recurrence/event-group behavior.

- **Validate complete timestamps in multi-day mode.** Date ordering and time ordering will be evaluated together using the complete date-time values. This permits an earlier end clock time on a later calendar date while rejecting equal or earlier complete timestamps.

- **Keep the existing one-day path separate.** One-day mode will continue to use the current date plus start/end time validation and occurrence shape. Weekly recurrence remains mutually exclusive with the new multi-day option in the UI, avoiding ambiguity between a continuous interval and repeated occurrences.

## Risks / Trade-offs

- [Shared component regression] Changes to the accumulator could affect event groups → keep multi-day disabled by default and retain existing recurrence logic and tests.
- [Timezone interpretation] ISO conversion is performed by the existing date-time construction path → reuse the current local date/time conversion approach and verify the emitted interval through tests.
- [Ambiguous user input] Separate date and time fields can be incomplete → show the accumulator validation error and emit an empty instance list until all fields are valid.

## Migration Plan

No database or API migration is required. Deploy the frontend change with the existing service; rollback consists of reverting the frontend change. Existing stored events and non-admin workflows are unaffected.

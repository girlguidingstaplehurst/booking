## 1. Date-time logic

- [x] 1.1 Extend `DateTimeRangeAccumulator` with an opt-in multi-day mode, separate start/end date inputs, and complete timestamp validation; verify that one-day mode and weekly recurrence remain unchanged through the existing accumulator tests.
- [x] 1.2 Generate one continuous `{ from, to }` instance for valid multi-day input and emit no instances for incomplete, equal, or reversed intervals; verify same-day and cross-day cases, including an earlier end clock time on a later date, with unit tests.

## 2. Admin workflow integration

- [x] 2.1 Enable the multi-day option only from `CreateEvents` while leaving event-group and public callers without the option; verify the Create Events page exposes the control and other callers do not.
- [x] 2.2 Verify the admin submission receives exactly one concrete interval for a valid multi-day event and that invalid intervals remain blocked by the existing empty-instance validation path.

## 3. Regression verification

- [x] 3.1 Run the focused frontend tests for the accumulator and admin Create Events workflow, then run the frontend build to verify the production bundle still compiles successfully.

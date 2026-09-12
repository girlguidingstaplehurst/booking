## 1. Recurrence Generation

- [x] 1.1 Extract a pure weekly-occurrence generator that accepts a first local date, local start/end times, and inclusive end date, then verify it generates the first date and matching weekly dates only through the end date.
- [x] 1.2 Generate each occurrence from local calendar date and time components rather than adding fixed UTC durations, and verify a daylight-saving-spanning schedule preserves its configured local wall-clock times.
- [x] 1.3 Add validation for an end date before the first date, an end time not after the start time, and an empty generated schedule, and verify each invalid input produces a blocking validation result.

## 2. Admin Schedule Control

- [x] 2.1 Replace the manual `DateTimeRangeAccumulator` inputs with first date, start time, end date, and end time controls, and verify the control renders the weekly schedule inputs in both admin creation flows.
- [x] 2.2 Add a generated-occurrence preview with reversible skipped-week controls and an occurrence count, and verify excluding and restoring a week updates the preview and count.
- [x] 2.3 Prevent submission when the schedule is invalid or all generated weeks are skipped, and verify no empty or invalid `instances` list is emitted.
- [x] 2.4 Preserve the existing value/setter integration used by `CreateEvents` and `CreateEventGroup`, and verify both flows receive one concrete `from`/`to` pair per included occurrence.

## 3. Submission and Regression Coverage

- [x] 3.1 Confirm the generated values serialize to the existing `instances` payload without adding recurrence fields, and verify the admin request shape remains compatible with both existing endpoints.
- [x] 3.2 Add component and generator tests covering weekly generation, inclusive end dates, skipped weeks, invalid ranges, all weeks skipped, and daylight-saving behavior, and verify the focused frontend test command passes.
- [x] 3.3 Run the complete frontend test suite and verify existing event-group and event-creation tests continue to pass.

## 4. One-Off and Toggleable Recurrence

- [x] 4.1 Add recurrence-disabled state to the shared control, defaulting to a single date/time range and generating exactly one concrete instance, and verify one-off generation and validation.
- [x] 4.2 Add a `Repeat weekly` toggle that reveals the recurrence end date and occurrence controls only when enabled, and verify toggling off collapses the recurrence UI and retains only the first occurrence.
- [x] 4.3 Update component tests for the default one-off mode, enabling recurrence, disabling recurrence after generating multiple weeks, and invalid one-off inputs, then verify the focused frontend test command passes.
- [x] 4.4 Run the complete frontend test suite and production build, and verify both admin creation flows still receive the expected concrete `instances` payload in one-off and recurring modes.

## Context

The existing shared `DateTimeRangeAccumulator` collected arbitrary concrete `from`/`to` pairs and pre-filled the next pair seven days later. Both admin event creation flows already send the collected pairs as `instances`; the backend expands those instances into booking rows and does not persist recurrence rules. The public API contract therefore provides a compatible target for a form-level one-off/recurrence generator.

## Goals / Non-Goals

**Goals:**

- Replace repeated manual entry with a focused weekly schedule editor.
- Support one-off event creation without requiring recurrence fields.
- Generate occurrences using calendar dates and local wall-clock times.
- Make skipped weeks visible and reversible before submission.
- Keep both existing admin creation flows compatible with the current payload shape.
- Keep validation and generation logic testable independently from the form presentation.

**Non-Goals:**

- Persist recurrence rules or excluded-week metadata.
- Add recurring-series editing after submission.
- Change booking conflict detection, transaction behavior, invoices, rates, keyholders, or event-group persistence.
- Support recurrence intervals other than weekly.

## Decisions

### Generate concrete instances in the frontend

The form will derive a list of weekly occurrences from the first date, fixed time range, and inclusive end date. Excluded occurrences will be removed before the existing `instances` payload is built.

This is preferred over adding recurrence fields to the API or database because the product does not need to edit a series later, and the current backend already accepts and processes concrete instances. It also preserves the existing all-or-nothing conflict behavior.

### Default to one-off mode

The control will render recurrence disabled by default. In this mode it will generate exactly one concrete instance from the selected date and time range. A `Repeat weekly` toggle will reveal recurrence-specific inputs and behavior only when enabled. This makes the common single-event path explicit and prevents accidental multi-event creation.

### Use the first date to establish the weekday

The first meeting date determines the weekday. Each subsequent occurrence advances the calendar date by seven days until the end date, which avoids a second weekday field that could conflict with the selected date.

### Use an inclusive end date

An occurrence is generated when its calendar date is on or before the end date. Since all occurrences share the first date's weekday, an end date on a different weekday naturally includes the last matching weekday before it.

### Represent skipped weeks by occurrence identity

The UI will maintain generated occurrences and an excluded/selected state keyed by calendar occurrence date. This makes a skipped week reversible and avoids relying on array indexes when the preview changes.

### Preserve local wall-clock times during generation

Generation will combine each generated local calendar date with the configured local start and end times before converting to the ISO values expected by the API. It will not calculate later occurrences by adding fixed-hour durations to a previously converted UTC timestamp.

### Keep the shared control boundary

The replacement will remain usable by both `CreateEvents` and `CreateEventGroup`, exposing the same resulting instance-list value/setter boundary unless implementation work demonstrates that a small, explicitly tested interface adjustment is necessary.

Disabling recurrence after it has been enabled will discard generated later weeks and retain only the first occurrence, so the parent forms continue receiving a concrete instance list without needing to understand recurrence state.

## Risks / Trade-offs

- [Risk] A long date range can produce a large preview and request payload. -> Mitigate with a clearly displayed occurrence count and a reasonable client-side maximum or existing domain limit if one is established during implementation.
- [Risk] Browser locale and timezone handling can alter ISO serialization. -> Mitigate by generating from local date/time components and testing a schedule crossing daylight-saving boundaries.
- [Risk] Existing backend validation may reject one generated occurrence because of a conflict, causing the whole submission to fail. -> Preserve the current transaction semantics and surface the existing error rather than silently submitting a partial schedule.
- [Risk] The two current creation flows have different surrounding fields and backend semantics. -> Keep the recurrence control limited to producing the shared concrete instance list and test both integration points.

## Migration Plan

No data migration or API migration is required. Deploy the frontend control and tests together; existing persisted events remain concrete instances. Rollback consists of restoring the prior frontend control because the request payload remains backward-compatible.

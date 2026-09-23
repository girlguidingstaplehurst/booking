## Context

The Create Event Group form currently stores one flattened `instances` array and delegates date generation to the existing date-range accumulator. The API and PostgreSQL layer already accept and persist multiple concrete instances, so the change can remain a frontend composition change. The behavioral contract is defined in `specs/recurring-event-date-selection/spec.md`.

## Goals / Non-Goals

**Goals:**

- Represent multiple independent date-set editors in the event-group form.
- Keep recurrence state, exclusions, validation, and preview isolated per date set.
- Flatten valid remaining occurrences into the existing `instances` payload.
- Preserve local wall-clock time generation and existing server-side booking-conflict checks.
- Make duplicate exact occurrences visible and actionable before submission.

**Non-Goals:**

- Changing the REST request schema or database schema.
- Persisting recurrence rules after event-group creation.
- Adding monthly recurrence.
- Changing the behavior of individual-event creation unless shared component changes require regression coverage.

## Decisions

### Use a list of independent date-set state objects

The form should own a collection of date-set states rather than one global recurrence state. Each state object contains the inputs and generated/excluded occurrences for one set. This keeps edits and validation local and allows a set to be added or removed without resetting neighboring sets.

An alternative is one large accumulator with multiple internal schedules. That would minimize form wiring but would make set-level errors, removal, and independent previews harder to represent and test.

### Reuse the existing concrete-instance boundary

Each date set generates concrete `{ from, to }` pairs. The form combines the remaining pairs in deterministic date-set order and submits them through the existing `instances` property. No recurrence metadata is sent to the server.

This avoids API and migration work, preserves compatibility with existing event-group persistence, and treats recurrence as an authoring convenience rather than a stored domain concept.

### Keep recurrence modes limited to one-off and weekly

The date-set editor will expose only the currently supported one-off and weekly modes. Monthly recurrence is deliberately excluded so that its calendar semantics do not constrain this implementation.

### Validate duplicates at the flattened schedule level

After collecting remaining occurrences from all sets, compare exact `from`/`to` pairs. If a pair occurs more than once, block submission and identify duplicate scheduling rather than silently deduplicating. This preserves user intent and prevents a hidden mismatch between the preview and the submitted schedule.

### Preserve local-time generation in the shared date utility

Occurrence generation should continue to construct each occurrence from its calendar date and configured local wall-clock times, rather than adding fixed durations to a prior timestamp. The same generation behavior must be used for every date set so daylight-saving transitions remain correct.

## Risks / Trade-offs

- [Risk] A user can create many date sets and produce a large instance list. -> Reuse existing instance validation and add reasonable UI-level limits only if the current component already has such constraints; do not add an arbitrary API limit in this change.
- [Risk] Overlapping non-identical times may still be rejected by the server's nearby-booking check. -> Keep the server-side check authoritative and surface its existing error response in the form.
- [Risk] Date-set-local errors may be missed when the form is submitted. -> Aggregate invalid-set state into the form-level submit guard and retain visible errors beside the affected set.
- [Risk] Shared accumulator changes could regress single-event creation. -> Preserve the one-set default and add regression tests covering the existing one-off and weekly workflows.
- [Risk] Flattened order could become unstable as sets are edited. -> Preserve date-set order, then sort or consistently generate occurrences within each set so preview and payload remain deterministic.

## Migration Plan

No data migration or API rollout is required. Deploy the frontend change alongside its tests; existing clients may continue sending one or many concrete instances. If rollback is needed, revert the frontend bundle to the prior single-set editor because the backend contract remains backward compatible.

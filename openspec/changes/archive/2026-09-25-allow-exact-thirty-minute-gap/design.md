## Context

The PostgreSQL database layer has two scheduling predicates. Ordinary event creation and public booking use a nearby-booking query that expands existing event ranges by 30 minutes, while event-group creation and duplication already use an overlap-only query. The nearby query uses inclusive boundary comparisons, causing a proposed event at exactly the 30-minute boundary to be rejected.

## Goals

- Permit an ordinary event whose start is exactly 30 minutes after an existing event ends.
- Apply the same boundary behavior when a proposed event ends exactly 30 minutes before an existing event starts.
- Continue rejecting actual overlaps and gaps shorter than 30 minutes.
- Preserve event-group overlap-only behavior and transaction guarantees.

## Non-Goals

- No API request or response changes.
- No database schema changes.
- No frontend changes.
- No change to the event-group rule that permits non-overlapping sessions near existing events.

## Proposed Approach

Retain separate conflict modes:

```text
ordinary creation / public booking / date update
    --> nearby clearance check
        --> reject overlap or gap < 30 minutes
        --> allow gap == 30 minutes

event-group creation / duplication
    --> overlap-only check
```

Adjust the nearby-booking predicates so the expanded boundary is exclusive rather than inclusive. Verify both directions of the boundary, including a new event beginning exactly 30 minutes after an existing event and a new event ending exactly 30 minutes before one. Keep the existing table locks, transaction boundaries, and error mapping unchanged.

## Verification

- Add coverage showing ordinary event/public booking/date update behavior accepts an exact 30-minute gap.
- Add coverage showing a gap of 29 minutes remains rejected.
- Retain overlap rejection coverage.
- Confirm event-group creation and duplication behavior remains unchanged.
- Run focused Go tests, the full Go test suite, and OpenSpec validation.

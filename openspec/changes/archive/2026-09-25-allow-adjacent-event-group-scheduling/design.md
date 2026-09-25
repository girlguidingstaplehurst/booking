## Context

The PostgreSQL database layer currently uses one nearby-booking check for several workflows. That check expands existing event ranges by 30 minutes, which is appropriate for ordinary event and public-booking clearance but is too restrictive for event-group scheduling. `AddEventGroup` and duplication both execute inside transactions and lock the events table before inserting group instances.

## Goals

- Permit event-group instances that are close to, but do not overlap, existing events.
- Keep actual overlap protection and transactional all-or-nothing behavior.
- Avoid changing ordinary event creation, public booking, or event-date update semantics.
- Cover both creation and duplication paths.

## Non-Goals

- No API request or response shape changes.
- No frontend control changes.
- No change to the 30-minute rule for non-group workflows.
- No change to the rule preventing overlapping instances within a submitted group schedule.

## Proposed Approach

Introduce or otherwise distinguish a conflict-check mode at the database-layer call sites:

```text
ordinary event / public booking / date update
    --> nearby conflict check (existing +/- 30 minute behavior)

event-group creation / duplication
    --> overlap-only conflict check
```

The overlap-only query should reject intervals whose actual ranges intersect, while allowing an end-to-start boundary only if that remains consistent with the existing event validation invariant. The implementation must explicitly account for all submitted group instances in the transaction so that group sessions cannot overlap each other or bypass validation due to insertion order.

The group creation and duplication paths should use the overlap-only mode while retaining their existing table locking, keyholder/rate validation, and transaction boundaries. Existing callers should continue using the nearby-check mode.

## Verification

- Add an event-group creation case with a non-overlapping instance inside the former 30-minute clearance window and expect success.
- Add an event-group duplication case with the same near-but-not-overlapping condition and expect success.
- Add overlap cases and verify the operation fails without leaving a group or partial sessions.
- Retain or add ordinary-event regression coverage proving that the 30-minute rule still rejects near-but-not-overlapping events.
- Run the relevant Go tests and the full test suite where the environment permits.

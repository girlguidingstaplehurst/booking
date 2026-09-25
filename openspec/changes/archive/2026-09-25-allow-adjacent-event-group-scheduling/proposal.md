## Why

Event-group creation and duplication currently apply the same 30-minute clearance rule used by ordinary bookings. That prevents administrators from scheduling separate group sessions close together even when the sessions do not overlap. The event-group workflow needs a narrower conflict rule without changing ordinary event or booking behavior.

## What Changes

- Change event-group scheduling validation so conflicts with existing events are based on actual time-range overlap rather than the 30-minute clearance buffer.
- Apply the new rule to both new event-group creation and event-group duplication.
- Preserve the existing 30-minute conflict rule for ordinary event creation, public bookings, and event-date updates.
- Continue rejecting invalid or overlapping event-group instances and preserve transactional creation behavior.
- Add coverage for adjacent event-group scheduling and regression coverage for the unchanged ordinary-event rule.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `event-group-search-and-duplication`: Change event-group duplication conflict validation so non-overlapping schedules, including schedules near existing events, can be accepted while actual overlaps remain rejected.

## Impact

- Affects the PostgreSQL scheduling-conflict validation used by event-group creation and duplication.
- Affects event-group integration/unit tests and potentially shared database helper tests.
- No API shape or frontend form contract changes are expected.
- Ordinary event creation, public booking, and event-date update behavior remains unchanged.

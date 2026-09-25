## Why

The ordinary booking clearance rule currently treats an event that starts exactly 30 minutes after an existing event ends as conflicting. This off-by-one-boundary behavior prevents valid schedules with the intended 30-minute gap and should be corrected without weakening the rejection of closer bookings.

## What Changes

- Allow ordinary event creation, public booking, and event-date updates when the proposed event begins exactly 30 minutes after an existing event ends.
- Continue rejecting schedules with less than a 30-minute gap.
- Preserve actual-overlap rejection and all existing event-group scheduling behavior.
- Add regression coverage for the exact 30-minute boundary and for gaps shorter than 30 minutes.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `event-group-search-and-duplication`: Update the ordinary booking clearance requirement so an exact 30-minute gap is allowed while smaller gaps remain rejected.

## Impact

- Affects server-side scheduling-conflict validation in the PostgreSQL database layer.
- Affects ordinary event creation, public booking, and event-date update behavior.
- Requires focused unit/integration regression coverage.
- No API shape, database schema, or frontend form changes are expected.

## Why

The public What's On page currently renders a flat list of event cards, which makes multi-session event groups difficult to understand and leaves the live listing visually cluttered. Grouping related sessions into a single prominent card will make the schedule easier to scan while preserving visibility and date-period rules.

## What Changes

- Add a public What's On display model that represents event groups as large cards containing their matching sessions as smaller cards.
- Represent each public, non-grouped event as its own large card containing one smaller event card.
- Include only events overlapping the existing implicit API period; do not add period navigation or new date controls.
- Require both event-group visibility and individual event visibility for grouped sessions to be displayed publicly.
- Order large cards by the earliest included event start time and order sessions within each card chronologically.
- Add a dedicated What's On API endpoint and implementation to provide grouping data without changing the booking availability endpoint.
- Correct public period filtering to include any event whose interval overlaps the requested period.

## Capabilities

### New Capabilities

- `public-whats-on`: Publicly groups and orders visible event sessions for the What's On page.

### Modified Capabilities

<!-- No existing capability currently specifies the public What's On behavior. -->

## Impact

- `api/public-api.yaml` and generated REST/model artifacts will change to expose the public display response.
- `internal/rest` and `internal/postgres` will query, filter, group, and order public events.
- `src/WhatsOn.js` and frontend tests will render nested group/event cards.
- Public API and frontend tests will need coverage for overlap, visibility, grouping, standalone events, and ordering.

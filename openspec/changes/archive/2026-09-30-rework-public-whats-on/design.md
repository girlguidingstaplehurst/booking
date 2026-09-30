## Context

See `proposal.md` for the motivation and scope. The current `/api/v1/events` endpoint returns a flat `events` array. The database already stores `booking_events.event_group_id` and group-level visibility, while the public response currently exposes only event-level fields. The What's On route calls the endpoint without date parameters, so the service's existing implicit period remains the source of the displayed range.

## Goals / Non-Goals

**Goals:**

- Introduce a public-specific response model that represents grouped and standalone display items.
- Apply group and event visibility consistently before constructing the response.
- Use complete interval-overlap filtering and deterministic chronological ordering.
- Keep the frontend focused on rendering the server-provided display model.
- Keep generated OpenAPI artifacts synchronized with the contract.

**Non-Goals:**

- Adding period navigation, date pickers, or other What's On filters.
- Changing event creation, event-group creation, or administrative visibility workflows.
- Exposing contact, invoice, rate, or other administrative event-group data publicly.
- Changing the existing implicit period boundaries.

## Decisions

### Use a unified public display-item response

The dedicated What's On endpoint will return a collection of display items, each tagged as a grouped or standalone item and containing its events. This avoids making the React client infer database relationships that are not currently exposed and allows groups and standalone events to be ordered in one server-defined sequence.

An alternative is to return separate `eventGroups` and `events` arrays. That would preserve conceptual separation but would require the frontend to merge and sort two collections, duplicating ordering logic and making the response less directly renderable.

### Build the public model in the service/database boundary

The implementation will select event-group identity and visibility alongside public event fields, then construct the sanitized public display model. Administrative models will not be reused because they include invoice and contact data that is inappropriate for the public contract.

An alternative is to add only `eventGroupID` to the existing flat event model and group in React. That would leak persistence-oriented details into the public API and spread visibility and ordering rules across clients.

### Keep booking availability separate

The existing `/api/v1/events` endpoint is also consumed by the booking calendar, where private events must remain visible as unavailable time. A dedicated What's On route will provide the grouped public-only response, leaving the existing endpoint and its flat availability semantics unchanged.

### Use full interval overlap

What's On selection will use `event_start <= period_end AND event_end >= period_start`, correcting the current endpoint-in-range query for events that span the entire period. The existing default period path remains unchanged when query parameters are absent.

### Keep visibility filtering conjunctive for grouped events

An event is eligible only when its own visibility is public and its group, if any, is also public. Filtering before grouping prevents empty or partially private groups from being emitted and avoids leaking private sessions.

### Preserve generated-code workflow

The OpenAPI contract will be updated first, followed by `go generate ./...` to regenerate REST models, handlers, mocks, and test clients. Generated files will not be hand-edited.

## Risks / Trade-offs

- **[Public response compatibility]** A new endpoint avoids changing the existing booking availability response → update only the What's On loader and new endpoint consumers.
- **[Long-running events]** Correct overlap filtering may add events that were previously omitted → this matches the clarified schedule semantics and should receive explicit regression coverage.
- **[Mixed-visibility groups]** A group may have fewer sessions than its full schedule → omit private sessions deliberately rather than exposing placeholders or private metadata.
- **[Generated artifact drift]** Contract changes can leave generated code inconsistent → run generation and verify generated tests/builds before implementation is considered complete.

## Context

See `proposal.md` for the motivation and `specs/admin-event-notes/spec.md` for the behavior contract. The individual event Review screen loads an `Event` from the authenticated `GET /api/v1/admin/events/{eventID}` operation. Admin API middleware validates identity, and `UserEmailFromContext` exposes the authenticated email to server handlers. Event-group review and public schedule data are separate paths.

## Goals / Non-Goals

**Goals:**
- Persist multiple notes for an event without changing the existing event row shape in the database.
- Keep authorship and timestamps server-authoritative and keep note reads/writes within admin routes.
- Add the notes history to the existing event review load and provide an authenticated append operation.

**Non-Goals:**
- Notes on event groups, contacts, invoices, or public-facing event pages.
- Editing or deleting notes, notifications, or searching notes across events.

## Decisions

- **Store notes in a separate table.** Add an event-note table with a note ID, event ID foreign key, content, author email, and server-generated timestamp. A separate one-to-many table preserves event/session ownership and history; adding a single notes column to `booking_events` would not represent multiple independently attributable submissions well. Index by event ID and descending submission time, with a stable ID tie-breaker for equal timestamps.
- **Use the existing authenticated event detail read and add one create operation.** Include the notes collection in the response for the admin event detail operation and add an authenticated `POST /api/v1/admin/events/{eventID}/notes` operation that accepts content only. This avoids a second read request for the Review screen. The handler takes the author email from `UserEmailFromContext`; the persistence layer assigns the timestamp. Client-supplied author or timestamp values are not part of the request contract. Do not add update/delete operations.
- **Keep note data out of other event projections.** Add notes only to the admin `Event` detail response used by the individual Review screen. Leave `ListEvent`, public schedule, and event-group response models unchanged, keeping the visibility boundary explicit.
- **Render as escaped plain text.** Use the existing React rendering path for note content (not HTML rendering); preserve line breaks in the display. After a successful submission, reload the event detail so the persisted note and server metadata are shown in canonical order.
- **Validate note content as text.** Reject content that is empty or whitespace-only, while retaining submitted non-empty text and line breaks. No product-specific maximum length is introduced by this change; use the existing request-body safety limits.
- **Use an additive migration.** Create the note table and event/time index without rewriting existing event data. Rolling the migration back drops the table and therefore removes all notes; forward deployment is otherwise compatible with existing event records.

## Risks / Trade-offs

- [A note can be attached to the wrong event if an incorrect event ID is submitted] -> Require the event foreign key and return a not-found response when the event does not exist.
- [Incorrect or client-forged attribution could undermine the note history] -> Derive author email only from validated admin request context and set the timestamp in the persistence layer.
- [Plain-text notes may contain markup-like text] -> Render through React's escaped text rendering and do not interpret note content as HTML.
- [Rolling back after notes have been added loses those notes] -> Keep the migration additive and document the data-loss consequence of rolling back the note-table migration.

## Migration Plan

1. Add the additive PostgreSQL migration for note storage and its event/time index.
2. Generate the API artifacts from `api/public-api.yaml`, then deploy the service and frontend with the migration applied through the existing startup migration mechanism.
3. Roll back application code before the database migration if necessary. Reverting the migration drops stored notes, so retain the table when note preservation is required.

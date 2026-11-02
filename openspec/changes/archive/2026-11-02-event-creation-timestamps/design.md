## Context

See `proposal.md` for the motivation and `specs/event-creation-timestamps/spec.md` for the behavior contract. The `booking_events` and `booking_event_groups` tables currently have no creation-time columns. Public and admin event creation share `Database.insertEvent`; group creation and duplication insert group and session rows in their own transactions. The authenticated admin event-list response supplies data used by both review pages. Event notes already use a PostgreSQL `timestamptz` with `DEFAULT now()` and render server timestamps in the admin event review UI.

## Goals / Non-Goals

**Goals:**
- Persist trustworthy creation times for new event and group rows, including every supported creation path.
- Preserve historical uncertainty and return/display unknown for existing rows without a trustworthy time.
- Make the times available only to authenticated admin review surfaces.

**Non-Goals:**
- Adding a creation-time input to public or admin forms.
- Exposing creation times in public APIs or dashboard cards.
- Inferring old creation times from scheduled event dates or assigning them the migration time.

## Decisions

1. **Use database-assigned `timestamptz` values on both entity tables.** Add nullable `created_at` columns to `booking_events` and `booking_event_groups`, then set `DEFAULT now()` for future inserts. Add the columns without a default before setting the default so existing rows stay `NULL`; `NULL` represents unknown history. PostgreSQL's transaction timestamp gives a consistent creation instant to the group and its session rows within the same transaction. This is preferred to accepting browser timestamps, which can be missing or inaccurate, and to application-generated values, which would need to be threaded through every insertion path.

2. **Keep the timestamp server-owned and immutable.** Do not add timestamp fields to creation request schemas or forms. The database default covers the shared public/admin event insertion path and the separate group creation/duplication inserts. Existing update operations should not write `created_at`.

3. **Expose nullable timestamps only in authenticated admin response models.** Add an ISO-8601 `createdAt` value (nullable for historical rows) to the shared admin event model and event-group model. Populate it in every database query that returns these models: admin event list, individual event detail, invoiceable-event list, group event list, and group search. Do not add the field to public schedule or booking-availability models. Regenerate API-derived Go/client code from `api/public-api.yaml` rather than editing generated files by hand.

4. **Render the value on the two review pages.** Add a clearly labelled creation-time display to individual event and event-group review pages. Format known timestamps consistently with the existing event-note timestamp display; render an explicit `Unknown` state for `NULL`. Leave dashboard cards unchanged.

## Risks / Trade-offs

- **Historical rows remain without dates** -> Preserve `NULL` and display `Unknown`; do not present migration time as a creation time.
- **Nullable database values require API and UI handling** -> Represent the admin API field as nullable and test both known and unknown display paths.
- **Rollback after timestamps have accumulated would discard the new metadata** -> Treat dropping the columns as a data-losing rollback and retain a database backup before applying it in an environment with new records.

## Migration Plan

1. Add a migration that adds nullable `created_at` columns without a default, then sets `DEFAULT now()` for subsequent inserts. Existing rows remain `NULL`; no data backfill is performed.
2. Deploy persistence and admin API changes so all event/group creation paths use the database defaults and admin responses include nullable timestamps.
3. Deploy the review-page displays and verify both known and unknown states. Public response schemas and dashboard cards remain unchanged.
4. If rollback is required, roll back application/API consumers before dropping the columns. Dropping them loses creation times recorded since deployment, so preserve a backup if that data must be retained.

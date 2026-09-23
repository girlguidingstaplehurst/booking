## Context

The Dashboard currently obtains event groups through `GET /api/v1/admin/events`, whose default date window starts at the current month and spans approximately 18 months. PostgreSQL groups are currently filtered by session overlap with that window, while the frontend further limits operational remaining-session cards to sessions ending today or later. The existing group review page also loads the broad event list and group list, and the existing event-group creation endpoint accepts setup and session instances together.

The change crosses the OpenAPI contract, generated Go REST/client code, authenticated REST handlers, PostgreSQL queries and transactions, React routing/forms, and frontend/backend tests. Existing event-group creation and review/invoice behavior must remain compatible.

## Goals / Non-Goals

**Goals:**

- Add an authenticated, historical title-search API independent of the operational Dashboard date window.
- Reuse the existing event-group card and date-instance UI patterns where possible.
- Make duplication server-authoritative: immutable source setup is read on the server, while only rate, keyholder, and new instances are accepted as editable inputs.
- Preserve stale source rate/keyholder selections in the duplicate form while loading valid alternatives and validating on submit.
- Make duplicate creation atomic and reuse existing booking conflict and active-keyholder validation rules.

**Non-Goals:**

- Changing the existing Dashboard operational date window.
- Copying invoices, source event IDs, or source schedule instances.
- Adding general event-group editing or historical group deletion.
- Changing the existing ordinary event-group creation semantics.

## Decisions

### Use dedicated search and duplication API operations

Add versioned authenticated endpoints for title search and duplication rather than overloading the broad event list or relying on client navigation state. Search returns group identity, title, date range, and invoice references sufficient for the existing card. Duplication accepts a source group ID, selected rate, selected keyholder, and instances; the server loads name, details, visibility, and contact from the source group.

This keeps historical lookup independent from Dashboard operations and makes browser refreshes and direct duplicate URLs reliable. Passing the full setup through React state was rejected because it is not refresh-safe and would make disabled fields a client-only restriction. An immediate client-side clone was rejected because it could submit tampered immutable values.

### Search by grouped latest session date

The search query joins groups to sessions, filters with a case-insensitive partial title predicate, groups by group identity and title, and orders by `max(event_end) DESC`, with a bounded result count. The response uses the existing event-group representation where possible so result cards can share normalization and presentation logic.

The search is debounced in the browser and is not sent for queries shorter than three characters. Query changes must identify or cancel stale requests so an older response cannot overwrite newer results.

### Add a dedicated duplicate route and form

Add `/admin/duplicate-event-group/:groupID` with an authenticated loader that retrieves the source group setup, source session time ranges, and selector data. The review page links to it through `Duplicate Event Group`. The form starts with empty dates but initializes the date/time controls with the source group’s time-of-day values; copied name/details/visibility/contact remain disabled, and rate/keyholder selectors remain editable values initialized from the source.

Selector adapters must preserve an invalid inherited option as the selected option even when current active options do not include it. The invalid option is displayed for context; after replacement, only valid options need remain selectable. Client-side validation provides immediate feedback, while the duplication endpoint repeats all validation.

### Keep source setup immutable at the server boundary

The duplication transaction first loads the source group and its contact/setup fields, then validates the submitted rate, active keyholder, non-empty valid instances, and nearby-booking conflicts before inserting the destination group and sessions. The new sessions use the source name/details/visibility/contact and the submitted rate/keyholder. The transaction rolls back on every failure, including errors while inserting any individual session.

The source group’s stored rate and keyholder are not required to remain valid because the request explicitly permits replacing them. If either inherited value is invalid, the form shows it and requires a valid replacement before a successful request.

### Regenerate contract-derived artifacts

The API YAML remains the source of truth. After adding endpoint schemas and operations, run the repository’s generation workflow so generated REST models, handlers/interfaces, mocks, and test clients remain synchronized. Generated files are not hand-authored.

## Risks / Trade-offs

- [Risk] An unbounded title search could return a large result set. -> Enforce a server-side result limit, define deterministic ordering, and keep the UI debounced.
- [Risk] A stale search response could replace results for a newer query. -> Track the current query/request or abort obsolete requests before applying responses.
- [Risk] A source group may reference a deleted/inactive rate or keyholder. -> Preserve the inherited option in the selector, show field validation, and require a valid editable replacement; repeat validation server-side.
- [Risk] Source setup can change between loading the form and submitting. -> Treat the source group as authoritative at submission time and validate/load it inside the duplication transaction.
- [Risk] Duplicate schedule instances may conflict or partially insert. -> Perform conflict checks and all inserts in one database transaction with rollback on failure.
- [Risk] Generated API files may drift from the contract. -> Make generation an explicit task and verify generated code and contract tests before implementation is complete.
- [Risk] Reusing the existing card may expose actions inappropriate for search results. -> Pass an explicit card context so search results expose Review while preserving existing invoice and remaining-session behavior.

## Migration Plan

No database migration is expected. Deploy the API and frontend changes together after regenerating contract-derived code. The new endpoints are additive, so rollback can remove the new routes and UI without changing existing event-group records or creation behavior. Existing groups and invoices remain untouched.

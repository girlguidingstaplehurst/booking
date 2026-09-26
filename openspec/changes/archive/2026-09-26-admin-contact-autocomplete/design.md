## Context

The database already stores contacts in `booking_contacts`, keyed by email, and creates missing records as part of event and event-group submission. The admin API uses OpenAPI-generated REST bindings, while the frontend already has authenticated fetch helpers and a debounced client-side pattern in `EventGroupSearch`.

## Goals / Non-Goals

**Goals:**

- Expose the existing contact records through the authenticated admin API.
- Load contacts once when the reusable form control is mounted and filter them locally.
- Reuse one contact control in both creation forms.
- Keep manual entry and independent editing of name and email.
- Preserve existing submission payloads and validation behavior.

**Non-Goals:**

- Building contact CRUD or contact-management screens.
- Changing contact identity rules, which remain email-based.
- Updating an existing contact's stored name or email as a side effect of form submission.
- Adding server-side search, pagination, or typeahead requests.

## Decisions

### Use an authenticated list endpoint

Add `GET /api/v1/admin/contacts`, returning a JSON array of contact objects with `name` and `email`. This follows the existing keyholder-list pattern and gives the frontend one stable source for autocomplete data. The endpoint must be included in the OpenAPI contract so generated server and client artifacts remain authoritative.

Alternative considered: querying contacts from an existing event endpoint. That would couple contact suggestions to unrelated event response shapes and would omit contacts that are not represented by the selected event query.

### Load once and filter in the browser

The contact control will fetch the complete list on mount through `AdminFetcher`, then perform case-insensitive name filtering in React state. Suggestions will be derived from the loaded list and selecting an option will write both form values.

Alternative considered: debounced server-side search. It would scale better for very large datasets, but is unnecessary for the selected client-side requirement and adds request-race, loading, and endpoint-query complexity.

### Keep the email field editable

Selecting a suggestion is a convenience that initializes both fields, not a lock or permanent identity binding. The existing separate email field remains visible and editable so administrators can correct stale addresses and enter new contacts.

### Use email as option identity

Contact names can collide, while the database identifies contacts by email. The UI will therefore use email as the stable option key and display enough contact information to distinguish duplicate names where needed.

## Risks / Trade-offs

- [Risk] Loading every contact becomes expensive as the table grows → Keep the API response limited to the fields needed by the control and revisit server-side search or pagination if contact volume makes initial loading problematic.
- [Risk] Duplicate names make suggestions ambiguous → Display the email alongside the name and use email as the selection identity.
- [Risk] A contact list request fails or returns malformed data → Treat the suggestion list as empty while leaving manual name/email entry usable; cover this behavior in frontend tests.
- [Risk] Generated API files drift from the contract → Update the OpenAPI document first and run the repository generation workflow during implementation.

## Migration Plan

No database migration is required. Deploy the API and frontend together after regenerating OpenAPI artifacts. Rollback consists of reverting the application release; existing event submission and contact persistence are unchanged.

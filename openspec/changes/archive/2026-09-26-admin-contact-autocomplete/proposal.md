## Why

Administrators must currently re-enter a contact's name and email independently when creating events or event groups. This is slow for repeat contacts and makes transcription errors more likely, while the system already stores reusable contact records.

## What Changes

- Add an authenticated admin capability to retrieve existing contact names and email addresses.
- Add a reusable free-entry contact autocomplete for admin forms.
- Filter the loaded contacts client-side by contact name.
- Populate both contact name and email when an existing contact is selected.
- Keep name and email editable so new contacts and corrections remain supported.
- Use the autocomplete in the individual event and event-group creation forms.
- Add coverage for contact retrieval, filtering, selection, and new-contact entry.

## Capabilities

### New Capabilities

- `admin-contact-autocomplete`: Reuse existing contacts while creating admin events and event groups, without preventing new contacts from being entered.

### Modified Capabilities

<!-- No existing capability currently specifies contact reuse during admin event creation. -->

## Impact

- Frontend: `src/admin/CreateEvents.js`, `src/admin/CreateEventGroup.js`, and a new reusable admin contact-select component.
- API contract: a new authenticated admin contacts-list endpoint in `api/public-api.yaml`.
- Backend: REST server/database interfaces and PostgreSQL contact query implementation.
- Tests: frontend component/form tests and backend API/database tests; generated API files will be refreshed during implementation.

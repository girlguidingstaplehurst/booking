## 1. API Contract and Generated Interfaces

- [x] 1.1 Define the authenticated versioned admin endpoint for retrieving a contact and its invoiceable individual events, including validated contact input, empty results, and error responses; verify the OpenAPI contract is unambiguous.
- [x] 1.2 Run the repository generation workflow after the contract change and verify generated REST types, clients, mocks, and builders are updated without hand edits.

## 2. Server-Side Invoiceable Event Lookup

- [x] 2.1 Add the database interface and PostgreSQL query for all approved events matching a contact email, excluding event-group events and every event with an invoice association, with no date filter; verify ordering and filtering with database-facing tests.
- [x] 2.2 Implement the authenticated REST handler using the lookup and return contact identity plus matching event data; verify missing or invalid contact input returns the standard client error and a valid contact with no matches returns an empty collection.
- [x] 2.3 Add handler tests covering eligible events, unapproved events, grouped events, already-invoiced events, historical events, and empty contact results.

## 3. Contact Invoice Selection UI

- [x] 3.1 Add the authenticated admin route and navigation entry for contact-based invoicing; verify unauthenticated access follows existing admin authentication behavior.
- [x] 3.2 Implement contact selection using the existing contact data/autocomplete pattern and load the invoiceable event list after a contact is selected; verify the selected contact and event results are displayed.
- [x] 3.3 Implement event checkboxes, select-all behavior, selected-count feedback, chronological event presentation, and the explicit no-invoiceable-events empty state; verify selection state updates correctly.
- [x] 3.4 Prevent continuation with no selected events and display an explanatory message; verify no invoice-preparation navigation occurs in that state.
- [x] 3.5 Navigate selected event IDs to the existing multi-event invoice preparation route and verify all selected IDs are encoded and the existing invoice preparation flow receives them.
- [x] 3.6 Add frontend tests for contact selection, eligible-event rendering, exclusions as represented by the API, select-all, subset selection, empty results, no-selection validation, and navigation.

## 4. Existing Invoice Flow Integration

- [x] 4.1 Verify the existing invoice preparation request re-fetches selected event details and creates one individual preparation containing all selected events; add or update tests for contact-originated multi-event selection.
- [x] 4.2 Verify invoice submission preserves every selected event association and existing editable line, deposit, success, and failure behavior remains unchanged.

## 5. Validation and Documentation

- [x] 5.1 Run focused Go and frontend tests for the new endpoint, selection page, and invoice preparation integration; verify all pass.
- [x] 5.2 Run the full repository test suites and frontend production build; verify generated artifacts and build output are consistent with the API contract.

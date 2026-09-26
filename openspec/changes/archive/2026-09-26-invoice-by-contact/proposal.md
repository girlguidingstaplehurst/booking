## Why

Administrators currently start invoicing from individual event or event-group cards, which makes it cumbersome to find and combine all invoiceable events belonging to one contact. A contact-focused workflow will make it straightforward to identify every approved individual event that has never been invoiced and prepare one combined invoice.

## What Changes

- Add an authenticated admin page for creating invoices by contact.
- Allow an administrator to search for and select a contact using the existing contact data.
- Load all matching approved, individual events with no invoice association, without applying a date restriction.
- Provide select-all and individual event selection before opening the existing invoice preparation flow.
- Preserve the selected events as associations on the resulting invoice.
- Add a server-side admin API for retrieving a contact's invoiceable individual events.
- Keep event-group sessions, already-invoiced events, unapproved events, and cancelled events outside this initial workflow.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `invoice-creation`: Extend invoice preparation so administrators can enter through a contact-level workflow and invoice multiple matching individual events without a date restriction.

## Impact

- React admin navigation and a new contact-invoice page/widget.
- The versioned REST API contract and generated API artifacts for the new admin endpoint.
- PostgreSQL event lookup logic for contact, approval, individual-event, and invoice-association filtering.
- Existing invoice preparation navigation and tests.
- No changes to event-group pricing or outstanding-invoice handling.

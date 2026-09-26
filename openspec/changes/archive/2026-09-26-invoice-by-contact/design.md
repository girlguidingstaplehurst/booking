## Context

The existing admin dashboard loads a date-bounded event list and links individual events into `/admin/create-invoice`. The invoice preparation API already accepts comma-separated individual event IDs, groups preparation data by contact, and the invoice form preserves selected event associations. The new workflow therefore needs a contact-oriented, unbounded lookup and a selection page, while retaining the current preparation and submission path.

## Goals / Non-Goals

**Goals:**

- Add a server-authoritative lookup for approved, non-group events with no invoice associations for a contact.
- Provide an authenticated admin page with contact selection, event selection, select-all, empty-state, and no-selection behavior.
- Reuse the existing invoice preparation flow after selection.
- Keep the API contract, generated REST code, database implementation, frontend behavior, and tests aligned.

**Non-Goals:**

- Including event-group sessions in contact-level invoicing.
- Re-invoicing events with existing invoices, including cancelled invoices.
- Consolidating or replacing outstanding invoices.
- Changing invoice pricing calculations, invoice submission semantics, or event-group pricing.
- Applying a date range to the contact lookup.

## Decisions

### Use a purpose-built authenticated admin lookup

Add a versioned admin endpoint for invoiceable events filtered by contact email, rather than reusing the public contact-filtered events endpoint. The public endpoint returns a reduced event shape and does not expose invoice associations or the administrative eligibility rules. The new endpoint can enforce approval, event-group, and invoice-association criteria in the database and return the event data needed for selection.

The endpoint should accept the contact email as a validated query parameter and return the contact identity plus matching events. A missing or invalid contact parameter should receive the API's standard client-error response; a valid contact with no matches should return an empty event collection.

### Keep eligibility filtering on the server

The database query will join the contact by email, require approved status, require no event-group association, and exclude any event for which an invoice association exists. It will not use the dashboard's date-window defaults. This prevents stale or manipulated frontend data from making already-invoiced or otherwise ineligible events invoiceable.

### Use a dedicated contact-invoice page and preserve the existing invoice route

Add a route reachable from authenticated admin navigation. The page will use the existing contact autocomplete/listing pattern, fetch eligible events after a contact is chosen, and maintain selected event IDs locally. It will navigate to `/admin/create-invoice?events=<comma-separated IDs>` so the existing preparation endpoint and editable invoice card remain the source of truth for pricing and submission.

The page will provide select-all and individual selection, show the selected count, disable continuation when the count is zero, and show an explicit empty state when no eligible events are returned.

### Exclude groups rather than merge pricing modes

The contact page will display only individual events. Event groups remain available through their existing event-group invoice flow because group rates and progressive per-session pricing cannot be mixed safely with individual event pricing in the current invoice preparation model.

### Extend the existing invoice-creation capability

The behavior is captured as a delta to `invoice-creation`, since the new entry point changes how administrators obtain individual multi-event invoice preparation but does not introduce a separate invoice domain or alter the existing invoice model.

## Risks / Trade-offs

- **Unbounded result size** -> The workflow intentionally has no date restriction; order results chronologically and consider a bounded server response or pagination only if real contact histories demonstrate a practical size problem.
- **Race between lookup and submission** -> Keep the existing preparation endpoint authoritative and re-fetch selected event details before rendering invoice lines; do not trust the selection page's event data for pricing.
- **Event becomes invoiced in another session** -> The preparation or submission path must continue to reject or safely handle invalid associations according to existing server behavior; tests should cover stale selections where practical.
- **Contact identity changes while selecting** -> Use email as the stable contact key already used by event and invoice lookup, while displaying the returned contact name for confirmation.
- **Generated API artifacts drift** -> Update the OpenAPI contract first and run the repository generation workflow rather than hand-editing generated REST, model, mock, or client files.

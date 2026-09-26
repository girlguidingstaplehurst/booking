## Why

The administrator invoice review screen currently shows invoice metadata but not the line items that make up the charge or the events/sessions associated with those items. This makes it difficult to verify what an invoice covers and whether its total is correct before marking it paid.

## What Changes

- Display every invoiced item on the administrator invoice review screen, including its description and cost.
- Display the invoice-level associated event or event group in the invoice header, including identifying name and date/time details where available.
- Display a calculated total cost for the invoice using the returned item costs.
- Extend invoice-detail data loading so the invoice-level event or event-group association is available to the review UI while preserving support for invoices without an association.
- Add coverage for item rendering, event/session associations, total calculation, and existing paid/unpaid actions.

## Capabilities

### New Capabilities

<!-- No new standalone capability is introduced. -->

### Modified Capabilities

- `invoice-creation`: Extend the invoice workflow so administrators can review submitted invoice items, the invoice-level event or event-group association, and the invoice total.

## Impact

- `src/admin/ManageInvoice.js` and related frontend tests.
- The OpenAPI `Invoice` response model and generated Go API types.
- The PostgreSQL invoice lookup in `internal/postgres/db.go`, including loading invoice-level event/event-group metadata.
- REST/API tests and generated artifacts if the contract is extended.

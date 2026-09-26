## 1. API Contract and Generated Models

- [x] 1.1 Extend the OpenAPI invoice response model with optional structured event/event-group summaries containing source ID, name, and start/end timestamps, and verify the contract describes associated and unassociated invoice behavior
- [x] 1.2 Run `go generate ./...` after the contract change and verify generated Go models and REST artifacts include the new optional association fields without hand edits

## 2. Invoice Data Loading

- [x] 2.1 Update `GetInvoiceByID` to load invoice-level event and event-group associations separately from invoice items, preserving invoices without associations, and verify the database query tests cover event, group, and unassociated invoices
- [x] 2.2 Add or update REST/database tests to verify invoice-detail responses contain invoice-level association metadata and retain item descriptions and costs without associations

## 3. Invoice Review UI

- [x] 3.1 Update `ManageInvoice` to render invoice-level event/event-group name and date/time, every invoice item with description and GBP-formatted cost, and a calculated total including all items; verify the component handles empty and unassociated invoices
- [x] 3.2 Preserve the existing sent, paid, error, and Mark Paid behavior while adding the item display, and verify unpaid and paid review states still render the expected actions
- [x] 3.3 Add frontend tests covering event/event-group header details, unassociated invoices, empty items, and total calculation, then verify them with `npm test -- --watchAll=false`

## 4. Integration Verification

- [x] 4.1 Run `go test ./...` and verify invoice-detail and API tests pass
- [x] 4.2 Run `npm run build` and verify the production frontend builds successfully with the invoice review changes

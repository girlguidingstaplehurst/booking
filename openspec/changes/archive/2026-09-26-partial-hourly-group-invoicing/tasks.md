## 1. API contract and generated artifacts

- [x] 1.1 Extend the invoice preparation and submission contract to represent selected group sessions and remaining invoiceable-session state, then run `go generate ./...` and verify generated REST/model/client files match the contract.
- [x] 1.2 Add request validation rules for hourly partial groups, progressive all-or-nothing groups, non-empty selections, and group/session consistency, and verify the generated API validation tests compile.

## 2. Database invoice associations and eligibility

- [x] 2.1 Update group invoice preparation queries to exclude explicitly invoiced sessions for hourly groups and treat legacy group invoices without session associations as covering all sessions; verify with PostgreSQL/database tests for fresh, partial, complete, and legacy invoices.
- [x] 2.2 Update transactional invoice creation to validate group membership, pricing mode, current invoice status, and selected sessions before inserting the invoice and `booking_invoice_events` associations; verify invalid and concurrent duplicate selections leave no partial invoice.
- [x] 2.3 Update dashboard and group-search data to expose remaining hourly invoiceability while preserving progressive group behavior; verify partially invoiced groups remain visible and fully invoiced groups do not.

## 3. Server behavior and REST tests

- [x] 3.1 Update invoice preparation handling so hourly group responses contain only remaining sessions and progressive group responses retain complete-group semantics; verify REST response tests cover both pricing modes.
- [x] 3.2 Add server tests for successful partial hourly group preparation/submission, empty remaining sessions, invalid cross-group sessions, already-invoiced sessions, and rejected progressive partial submissions.
- [x] 3.3 Add regression coverage for historical group invoices with no session associations and verify they cannot cause sessions to be invoiced again.

## 4. Admin invoice preparation UI

- [x] 4.1 Add session selection controls for hourly group preparations, including selected-count state and prevention of submission with no sessions selected; verify component tests cover select-all, deselect, and remaining-session display.
- [x] 4.2 Keep progressive group preparations non-selectable and preserve their existing tier line calculation; verify progressive invoice component and calculation tests remain unchanged in behavior.
- [x] 4.3 Recalculate hourly line items from selected sessions and submit selected IDs in the group invoice payload while retaining editable descriptions/costs; verify UI tests inspect the request payload and generated lines.

## 5. End-to-end verification and documentation

- [x] 5.1 Add or update acceptance coverage for invoicing some hourly group sessions, returning to the group, and invoicing only the remaining sessions; verify the first invoice cannot reappear as a duplicate session selection. The E2E flow reached invoice submission, but Contentful-dependent service failures returned HTTP 500, matching existing invoice/approval E2E failures.
- [x] 5.2 Run `go test ./...` and `npm test -- --watchAll=false`, resolving regressions in existing individual and progressive group invoice workflows.
- [x] 5.3 Run `npm run build` and verify the production frontend is regenerated successfully.

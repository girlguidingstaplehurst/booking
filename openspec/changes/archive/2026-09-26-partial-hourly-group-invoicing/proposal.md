## Why

Event groups currently invoice as a single all-session unit, which prevents administrators from billing completed hourly sessions separately when other sessions in the same group are not yet ready. The workflow needs to support partial billing without making progressive per-session pricing ambiguous or allowing sessions to be billed twice.

## What Changes

- Allow administrators to select uninvoiced sessions when preparing an invoice for an hourly-billed event group.
- Keep partially invoiced hourly groups visible in the invoiceable dashboard workflow, showing only sessions that have not already been invoiced.
- Preserve the existing all-or-nothing invoice workflow for progressive per-session event groups.
- Record explicit event-session associations for new group invoices and reject invalid, already-invoiced, or cross-group selections server-side.
- Treat historical group invoices without session associations as covering every session in that group.
- Calculate hourly group invoice lines only for the selected sessions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `invoice-creation`: Extend event-group invoicing to support partial selection for hourly groups, exclude already-invoiced sessions, and preserve progressive groups as whole-group invoices.

## Impact

- React group invoice preparation UI and invoice calculations.
- Dashboard event-group invoiceability and remaining-session presentation.
- Versioned REST API contract and generated artifacts for selected group sessions and invoice preparation data.
- PostgreSQL queries and transactional invoice validation using event-session associations.
- Invoice preparation, submission, dashboard, REST, database, and end-to-end tests.

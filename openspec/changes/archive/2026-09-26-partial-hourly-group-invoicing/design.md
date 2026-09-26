## Context

See `proposal.md` for the motivation and scope. The current group preparation endpoint loads every session for a group, the React invoice card submits a group identifier without explicit session associations, and dashboard group eligibility is based on the presence of group-level invoices. The database has `booking_invoice_events`, which can represent selected sessions, but older group invoices may not have rows in that table.

## Goals / Non-Goals

**Goals:**

- Make hourly group invoice preparation session-aware while preserving the existing progressive pricing path.
- Make the database authoritative for remaining invoiceable sessions and duplicate-invoice prevention.
- Preserve explicit associations for every new group invoice session.
- Keep legacy group invoices safe by interpreting unassociated historical group invoices as covering the complete group.
- Keep invoice line calculation aligned with the selected hourly sessions.

**Non-Goals:**

- Changing progressive per-session pricing or allowing progressive groups to be split across invoices.
- Adding a new invoice or event-group data model.
- Changing individual-event invoicing, deposits, rate definitions, or payment workflows.
- Inferring detailed historical line-to-session mappings for legacy invoices.

## Decisions

### Use existing event associations as the source of truth

For new invoices, `booking_invoice_events` will identify the sessions already invoiced. Group preparation queries will return only sessions with no association. Invoice creation will validate the selected event IDs inside the same transaction that inserts the invoice and associations, preventing a race between preparation and submission.

An alternative would be to add a session-invoice status column or a separate group billing table. That would duplicate the existing association model and create two sources of truth, so it is rejected.

### Distinguish hourly and progressive groups by the group rate

The group rate already exposes pricing mode/per-session configuration in invoice preparation data. Hourly groups use selectable session lines; groups with per-session tiers continue through the existing full-group calculation. The API and server will reject a partial event list for a progressive group rather than relying on the client to hide controls.

An alternative would be to make every group selectable and calculate progressive pricing from the selected count. That would change the meaning of the existing tiers and could undercharge a group, so it is rejected.

### Return remaining sessions from group preparation

The group preparation query will retain group metadata and rate information while excluding invoiced sessions for hourly groups. It will also expose enough aggregate state for the dashboard to know whether remaining sessions exist. The empty remaining-session result will be treated as not invoiceable rather than as a valid empty invoice.

An alternative would be to load all sessions and filter them in React. That would expose already-invoiced data unnecessarily and would not protect direct API callers, so it is rejected.

### Submit selected session IDs explicitly

The group invoice form will maintain the selected session IDs and submit them in the existing `events` field alongside `eventGroup`. Hourly item generation will operate on the selected session set. The server will verify group membership, invoice status, pricing mode, non-empty selection, and association consistency before committing.

The existing individual-event behavior remains unchanged: individual invoices continue using event associations without an event-group field.

### Handle legacy group invoices conservatively

When determining remaining sessions, a group-level invoice with no rows in `booking_invoice_events` will be interpreted as covering all sessions in that group. New group invoices will always write explicit association rows. No migration will attempt to infer which sessions old invoice items represented.

This may make some historically partial-but-unassociated invoices appear fully billed, but it favors preventing duplicate customer charges and matches the old all-or-nothing group workflow.

### Preserve dashboard grouping while changing eligibility

Dashboard data will continue to expose group invoices for review/payment. Invoiceable-group filtering will additionally use the count of sessions not covered by either explicit session associations or a legacy group-level invoice. A partially invoiced hourly group remains in the invoiceable section; a fully invoiced group does not.

## Risks / Trade-offs

- [Risk] A legacy group invoice has no session associations and cannot reveal its exact covered sessions. -> Treat it as covering all sessions, document the conservative behavior, and add regression coverage.
- [Risk] Two administrators may prepare the same remaining session concurrently. -> Recheck invoice associations inside the invoice transaction and reject any session that became invoiced.
- [Risk] Client-submitted line items could omit or add event IDs relative to selected sessions. -> Validate selected event IDs and group membership server-side; preserve event associations from the validated request rather than trusting display state.
- [Risk] Dashboard aggregates may become inconsistent if invoiceability is computed separately from preparation. -> Use the same invoiced-session semantics for both queries and cover partial/complete cases with database and REST tests.
- [Trade-off] Hourly group invoices may produce multiple invoices for one group. -> This is intentional; each invoice retains the group association and explicit session associations for review and auditability.

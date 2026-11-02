## Purpose

Provide administrators with a clear, accurate invoice-preparation workflow for individual events and event groups, including optional deposits, hourly session charges, and progressive per-session pricing.

## Requirements

### Requirement: Invoice preparation distinguishes individual and group modes

The system SHALL provide invoice preparation data that identifies whether the invoice covers individual events or an event group and includes the contact display name, contact email, event or group name, and all source event identifiers. Administrators SHALL be able to reach individual invoice preparation with multiple selected events from the contact-focused invoicing workflow. For hourly-billed event groups, the preparation SHALL include only sessions that have no invoice association. For progressive per-session event groups, the preparation SHALL include the complete group and SHALL remain an all-or-nothing invoice workflow.

#### Scenario: Prepare an individual invoice for multiple events

- **WHEN** an administrator requests an invoice for multiple individual events belonging to the same contact
- **THEN** the system returns one invoice preparation card for that contact containing every selected event and its identifier
- **AND** the preparation data includes the contact display name and the names of all selected events

#### Scenario: Prepare an hourly group invoice with uninvoiced sessions

- **WHEN** an administrator requests an invoice for an hourly-billed event group
- **THEN** the system returns one group invoice preparation card containing the group name, contact display name, contact email, and every group session without an invoice association
- **AND** the preparation identifies the group’s hourly rate

#### Scenario: Prepare an event-group invoice

- **WHEN** an administrator requests an invoice for an event group
- **THEN** the system returns one group invoice preparation card containing the group name, contact display name, contact email, and all invoiceable group sessions
- **AND** the preparation data identifies the group’s assigned rate and whether that rate contains per-session pricing

#### Scenario: Prepare a progressive group invoice

- **WHEN** an administrator requests an invoice for a progressive per-session event group
- **THEN** the system returns one group invoice preparation card containing the complete group and all group sessions
- **AND** the preparation identifies the group’s assigned progressive rate
- **AND** the workflow does not offer partial session selection

#### Scenario: Group has no remaining invoiceable hourly sessions

- **WHEN** every session in an hourly-billed event group has an invoice association
- **THEN** the group invoice preparation contains no invoiceable sessions
- **AND** the administrator cannot submit an invoice for that group

### Requirement: Group invoices without per-session pricing show hourly session lines

When the rate assigned to an event group has no configured per-session pricing, the system SHALL create one editable event-hire line for each selected, uninvoiced group session using that rate’s hourly price, with the session date and time included in the line description. Administrators SHALL be able to select one or more such sessions before preparing the invoice.

#### Scenario: Prepare hourly group session lines

- **WHEN** the rate assigned to an event group has no configured per-session pricing
- **AND** the administrator selects one or more uninvoiced group sessions
- **THEN** the system creates one line for every selected session
- **AND** each line includes the session date and time
- **AND** each line cost equals the session duration multiplied by the standard hourly rate

#### Scenario: Exclude already-invoiced hourly sessions

- **WHEN** an hourly group contains sessions that are already associated with an invoice
- **THEN** those sessions are not selectable for the new group invoice
- **AND** they do not produce invoice lines

#### Scenario: Apply standard-rate session discounts

- **WHEN** an hourly group session qualifies for an existing duration discount
- **THEN** the prepared invoice includes the applicable discount for that selected session

### Requirement: Group invoices with per-session pricing use progressive tiers

When the rate assigned to an event group has a configured two-tier per-session definition, the system SHALL calculate the group hire as a fixed first-tier charge followed by a marginal additional-session charge for the complete group. Administrators SHALL NOT be able to create a partial invoice for only some sessions of such a group.

#### Scenario: Group sessions fit within the fixed tier

- **WHEN** the number of group sessions is less than or equal to the first tier count
- **THEN** the system creates one line for the fixed first-tier price
- **AND** the system omits the additional-session line

#### Scenario: Group sessions exceed the fixed tier

- **WHEN** the number of group sessions exceeds the first tier count
- **THEN** the system creates one line for the fixed first-tier price
- **AND** creates a second line for the number of additional sessions multiplied by the additional-session price

#### Scenario: Progressive group cannot be partially invoiced

- **WHEN** an administrator attempts to submit an invoice containing only some sessions from a progressive per-session group
- **THEN** the system rejects the request
- **AND** no invoice is created

#### Scenario: Progressive lines explain their coverage

- **WHEN** a progressive group invoice is prepared
- **THEN** the fixed line identifies the number of sessions covered by the first tier
- **AND** the additional line identifies the number of sessions charged at the marginal rate

### Requirement: Administrators can edit and submit prepared invoice lines

The system SHALL allow administrators to edit invoice line descriptions and costs before submission, while preserving the selected event or event-group association and contact information when the invoice is sent. For an hourly group invoice, the system SHALL preserve exactly the selected session associations and SHALL reject a selection that is not wholly contained in the supplied group, contains an already-invoiced session, contains a session from a progressive group, or is empty. The system SHALL navigate an administrator to the admin dashboard after an invoice-send request receives a successful HTTP response and SHALL keep the administrator on the invoice preparation form when the request does not receive a successful HTTP response.

#### Scenario: Submit a partial hourly group invoice

- **WHEN** an administrator submits a prepared hourly group invoice containing one or more selected sessions
- **THEN** the system creates one invoice associated with the event group
- **AND** the system preserves every selected session as an association with that invoice
- **AND** the system does not associate unselected group sessions with that invoice

#### Scenario: Reject an invalid hourly group selection

- **WHEN** an administrator submits a group invoice with a session that does not belong to the supplied group or is already invoiced
- **THEN** the system rejects the request
- **AND** no invoice or invoice-session associations are created

#### Scenario: Submit a combined individual invoice

- **WHEN** an administrator submits a prepared individual invoice containing multiple events
- **THEN** the system creates one invoice associated with the contact and preserves all selected event links through the invoice items
- **AND** the system preserves every selected event as an association with that invoice

#### Scenario: Submit a group invoice

- **WHEN** an administrator submits a prepared event-group invoice
- **THEN** the system creates one invoice associated with the event group and preserves the group association and prepared line items

#### Scenario: Edit a prepared line

- **WHEN** an administrator changes a line description or cost before submission
- **THEN** the submitted invoice uses the edited value for that line
- **AND** the system retains the source event association when the line represents an event or session

#### Scenario: Successfully send an invoice

- **WHEN** an administrator submits a prepared invoice
- **AND** the invoice-send request returns a response where `ok` is true
- **THEN** the system navigates the administrator to `/admin`

#### Scenario: Invoice send fails

- **WHEN** an administrator submits a prepared invoice
- **AND** the invoice-send request returns a response where `ok` is false or no response
- **THEN** the system keeps the administrator on the invoice preparation form

### Requirement: Dashboard exposes remaining hourly group invoiceability

The system SHALL keep an hourly event group in the invoiceable admin workflow while it has at least one session without an invoice association, including when earlier invoices cover other sessions. The system SHALL exclude the group from that workflow when all of its sessions are invoiced. A historical group invoice with no per-session associations SHALL be treated as covering every session in that group.

#### Scenario: Partially invoiced hourly group remains invoiceable

- **WHEN** an hourly event group has at least one invoiced session and at least one uninvoiced session
- **THEN** the group appears in the invoiceable workflow
- **AND** a new invoice preparation exposes only the uninvoiced sessions

#### Scenario: Fully invoiced hourly group is not invoiceable

- **WHEN** every session in an hourly event group has an invoice association
- **THEN** the group does not appear in the invoiceable workflow

#### Scenario: Legacy group invoice covers all sessions

- **WHEN** a group has a historical group-level invoice with no per-session associations
- **THEN** the system treats every session in that group as invoiced
- **AND** the group does not become invoiceable solely because its session associations are absent

### Requirement: Individual invoice preparation calculates event hire and optional deposit

The system SHALL calculate individual event-hire lines from each event’s duration and assigned hourly rate, apply the existing duration discount behavior, and expose a cleaning-deposit option that is disabled by default and adds at most one deposit line per invoice.

#### Scenario: Prepare individual event-hire lines

- **WHEN** an individual invoice contains one or more events
- **THEN** the system creates an editable event-hire line for each event using duration multiplied by its assigned hourly rate
- **AND** applicable duration discounts are represented in the prepared invoice

#### Scenario: Cleaning deposit is disabled by default

- **WHEN** an administrator opens an individual invoice preparation card
- **THEN** the cleaning-deposit option is unchecked
- **AND** no cleaning-deposit line is included in the invoice total

#### Scenario: Add one cleaning deposit to a combined invoice

- **WHEN** an administrator enables the cleaning-deposit option on a combined individual invoice
- **THEN** the system adds exactly one cleaning-deposit line to that invoice regardless of how many events it contains

### Requirement: Administrators can review invoice items and invoice association

The system SHALL display every item on an existing invoice with its description and cost, display the invoice-level associated event or event group name and date/time when that association exists, and display the sum of all item costs as the invoice total. Invoices without an association SHALL remain reviewable.

#### Scenario: Review an invoice associated with events

- **WHEN** an administrator opens an existing invoice associated with one or more events
- **THEN** the invoice review displays each item description and cost
- **AND** displays the associated event name and date/time in the invoice header
- **AND** displays a total equal to the sum of all item costs

#### Scenario: Review an invoice associated with an event group

- **WHEN** an administrator opens an existing invoice associated with an event group
- **THEN** the invoice review displays the event-group name and date/time in the invoice header
- **AND** displays every item description and cost

#### Scenario: Review an invoice without an association

- **WHEN** an administrator opens an invoice without an event or event-group association
- **THEN** the review displays all items in one invoice item list
- **AND** calculates the total from every displayed item

#### Scenario: Review an invoice with no items

- **WHEN** an administrator opens an invoice whose item collection is empty
- **THEN** the review displays a total of zero
- **AND** does not fail because invoice association data is absent

### Requirement: Administrators can find invoiceable individual events by contact

The system SHALL provide an authenticated admin workflow that allows an administrator to select a contact and retrieve all matching events that are approved individual events with no invoice association, without restricting the results by date.

#### Scenario: Retrieve all invoiceable events for a contact

- **WHEN** an authenticated administrator selects a contact
- **THEN** the system returns every approved event for that contact that is not part of an event group and has no invoice association
- **AND** the results include events regardless of their date

#### Scenario: Exclude non-invoiceable events

- **WHEN** an authenticated administrator selects a contact
- **THEN** the system excludes events that are not approved
- **AND** excludes events that belong to an event group
- **AND** excludes events with any invoice association

#### Scenario: Contact has no invoiceable events

- **WHEN** an authenticated administrator selects a contact with no matching invoiceable events
- **THEN** the workflow displays an explicit empty state
- **AND** the workflow does not offer submission of an invoice with no selected events

### Requirement: Administrators can select contact events for combined invoicing

The system SHALL allow an administrator to select all or a subset of the retrieved invoiceable individual events and continue to the existing individual invoice preparation flow.

#### Scenario: Select all invoiceable events

- **WHEN** an administrator chooses the select-all action
- **THEN** every displayed invoiceable event becomes selected
- **AND** the workflow shows the number of selected events

#### Scenario: Select a subset of invoiceable events

- **WHEN** an administrator selects one or more individual events
- **THEN** only those events are included when the administrator continues
- **AND** the workflow shows the number of selected events

#### Scenario: Continue without selecting events

- **WHEN** an administrator has selected no events
- **THEN** the workflow prevents continuation to invoice preparation
- **AND** explains that at least one event must be selected

#### Scenario: Create one invoice for selected events

- **WHEN** an administrator continues with one or more selected events
- **THEN** the existing individual invoice preparation flow opens with every selected event
- **AND** the eventual invoice preserves every selected event association

### Requirement: Administrators can create zero-total individual invoices as paid without emailing them

The system SHALL provide a no-email action for individual-event invoice preparations when the live invoice total, displayed in GBP to two decimal places, is £0.00. The action SHALL appear alongside the existing Send Invoice action, which SHALL remain available for administrators who want to email a free invoice. The no-email action SHALL be available only for individual invoices, SHALL use the current editable invoice items and event associations, and SHALL create the invoice as paid without generating or sending an email. The server SHALL verify that the request is for an individual invoice with at least one associated event and that its total is £0.00; a failed validation SHALL create no invoice or associations.

#### Scenario: Show the no-email action for a live zero total

- **WHEN** an administrator prepares an individual invoice and its current displayed total is £0.00
- **THEN** the preparation shows a visually distinct no-email action alongside Send Invoice
- **AND** both actions use the current invoice items and event selection

#### Scenario: Update action availability when edited items change the total

- **WHEN** an administrator edits invoice items or changes the cleaning-deposit option
- **THEN** the no-email action is shown if and only if the current displayed invoice total is £0.00
- **AND** the existing Send Invoice action remains available

#### Scenario: Do not offer no-email creation for event-group invoices

- **WHEN** an administrator prepares an event-group invoice, including one whose total is £0.00
- **THEN** the no-email action is not shown

#### Scenario: Create and mark a zero-total individual invoice paid without email

- **WHEN** an administrator submits the no-email action for an individual invoice with at least one associated event and a total of £0.00
- **THEN** the system creates one invoice with the submitted items and selected event associations
- **AND** the invoice is marked paid with a paid timestamp and has no sent timestamp
- **AND** the system does not generate an invoice PDF or send an email
- **AND** the administrator is navigated to the admin dashboard after success

#### Scenario: Reject a nonzero or non-individual no-email request

- **WHEN** the server receives a no-email invoice request whose total is not £0.00, which has no associated individual event, or which is for an event group
- **THEN** the request fails
- **AND** no invoice or event associations are created
- **AND** the administrator remains on the invoice preparation form

#### Scenario: Email a free invoice by choice

- **WHEN** an administrator chooses Send Invoice for an individual invoice whose total is £0.00
- **THEN** the existing invoice-send workflow emails the invoice as usual

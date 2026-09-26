## MODIFIED Requirements

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

## ADDED Requirements

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

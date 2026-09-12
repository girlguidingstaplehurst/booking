## Purpose

Provide administrators with a clear, accurate invoice-preparation workflow for individual events and event groups, including optional deposits, hourly session charges, and progressive per-session pricing.

## Requirements

### Requirement: Invoice preparation distinguishes individual and group modes

The system SHALL provide invoice preparation data that identifies whether the invoice covers individual events or an event group and includes the contact display name, contact email, event or group name, and all source event identifiers.

#### Scenario: Prepare an individual invoice for multiple events

- **WHEN** an administrator requests an invoice for multiple individual events belonging to the same contact
- **THEN** the system returns one invoice preparation card for that contact containing every selected event and its identifier
- **AND** the preparation data includes the contact display name and the names of all selected events

#### Scenario: Prepare an event-group invoice

- **WHEN** an administrator requests an invoice for an event group
- **THEN** the system returns one group invoice preparation card containing the group name, contact display name, contact email, and all group sessions
- **AND** the preparation data identifies the group’s assigned rate and whether that rate contains per-session pricing

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

### Requirement: Group invoices without per-session pricing show hourly session lines

When the rate assigned to an event group has no configured per-session pricing, the system SHALL create one editable event-hire line for each group session using that rate’s hourly price, with the session date and time included in the line description.

#### Scenario: Prepare hourly group session lines

- **WHEN** the rate assigned to an event group has no configured per-session pricing
- **THEN** the system creates one line for every session in the group
- **AND** each line includes the session date and time
- **AND** each line cost equals the session duration multiplied by the standard hourly rate

#### Scenario: Apply standard-rate session discounts

- **WHEN** an hourly group session qualifies for an existing duration discount
- **THEN** the prepared invoice includes the applicable discount for that session

### Requirement: Group invoices with per-session pricing use progressive tiers

When the rate assigned to an event group has a configured two-tier per-session definition, the system SHALL calculate the group hire as a fixed first-tier charge followed by a marginal additional-session charge.

#### Scenario: Group sessions fit within the fixed tier

- **WHEN** the number of group sessions is less than or equal to the first tier count
- **THEN** the system creates one line for the fixed first-tier price
- **AND** the system omits the additional-session line

#### Scenario: Group sessions exceed the fixed tier

- **WHEN** the number of group sessions exceeds the first tier count
- **THEN** the system creates one line for the fixed first-tier price
- **AND** creates a second line for the number of additional sessions multiplied by the additional-session price

#### Scenario: Progressive lines explain their coverage

- **WHEN** a progressive group invoice is prepared
- **THEN** the fixed line identifies the number of sessions covered by the first tier
- **AND** the additional line identifies the number of sessions charged at the marginal rate

### Requirement: Administrators can edit and submit prepared invoice lines

The system SHALL allow administrators to edit invoice line descriptions and costs before submission, while preserving the selected event or event-group association and contact information when the invoice is sent.

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

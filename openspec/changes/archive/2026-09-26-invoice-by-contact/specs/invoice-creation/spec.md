## MODIFIED Requirements

### Requirement: Invoice preparation distinguishes individual and group modes

The system SHALL provide invoice preparation data that identifies whether the invoice covers individual events or an event group and includes the contact display name, contact email, event or group name, and all source event identifiers. Administrators SHALL be able to reach individual invoice preparation with multiple selected events from the contact-focused invoicing workflow.

#### Scenario: Prepare an individual invoice for multiple events

- **WHEN** an administrator requests an invoice for multiple individual events belonging to the same contact
- **THEN** the system returns one invoice preparation card for that contact containing every selected event and its identifier
- **AND** the preparation data includes the contact display name and the names of all selected events

#### Scenario: Prepare an event-group invoice

- **WHEN** an administrator requests an invoice for an event group
- **THEN** the system returns one group invoice preparation card containing the group name, contact display name, contact email, and all group sessions
- **AND** the preparation data identifies the group’s assigned rate and whether that rate contains per-session pricing

## ADDED Requirements

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

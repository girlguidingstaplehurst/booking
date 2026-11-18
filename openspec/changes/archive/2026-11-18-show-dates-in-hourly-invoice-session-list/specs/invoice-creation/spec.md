# Spec Delta

## MODIFIED Requirements

### Requirement: Invoice preparation distinguishes individual and group modes

The system SHALL provide invoice preparation data that identifies whether the invoice covers individual events or an event group and includes the contact display name, contact email, event or group name, and all source event identifiers. Administrators SHALL be able to reach individual invoice preparation with multiple selected events from the contact-focused invoicing workflow. For hourly-billed event groups, the preparation SHALL include only sessions that have no invoice association, and each selectable session SHALL be identifiable by its event name and date/time. For progressive per-session event groups, the preparation SHALL include the complete group and SHALL remain an all-or-nothing invoice workflow.

#### Scenario: Prepare an individual invoice for multiple events

- **WHEN** an administrator requests an invoice for multiple individual events belonging to the same contact
- **THEN** the system returns one invoice preparation card for that contact containing every selected event and its identifier
- **AND** the preparation data includes the contact display name and the names of all selected events

#### Scenario: Prepare an hourly group invoice with uninvoiced sessions

- **WHEN** an administrator requests an invoice for an hourly-billed event group
- **THEN** the system returns one group invoice preparation card containing the group name, contact display name, contact email, and every group session without an invoice association
- **AND** the preparation identifies the group’s hourly rate
- **AND** each selectable session is displayed with its event name and date/time

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

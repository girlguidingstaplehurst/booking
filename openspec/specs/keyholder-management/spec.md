# keyholder-management Specification

## Purpose

Provide administrators with a reusable, identity-based directory of keyholders and a consistent way to assign them to booking entry and exit responsibilities.

## Requirements

### Requirement: Administrators can manage keyholder records

The system SHALL allow an authenticated administrator to view keyholders and create or edit records containing a name, a unique key number, and an active state. The system SHALL identify each record with a stable UUID and SHALL NOT provide an in-application delete operation.

#### Scenario: Administrator creates a keyholder

- **WHEN** an authenticated administrator submits a valid name and unused key number
- **THEN** the system creates an active keyholder with a stable UUID
- **AND** the keyholder appears in the keyholder directory with its name and key number

#### Scenario: Administrator tries to reuse a key number

- **WHEN** an authenticated administrator creates or edits a keyholder with a key number already assigned to another keyholder
- **THEN** the system rejects the operation
- **AND** the existing keyholder records remain unchanged

#### Scenario: Administrator deactivates a keyholder

- **WHEN** an authenticated administrator changes a keyholder from active to inactive
- **THEN** the system persists the inactive state
- **AND** the keyholder remains visible in the directory with its inactive state
- **AND** the system does not delete the keyholder record

#### Scenario: Administrator edits a keyholder identity or key number

- **WHEN** an authenticated administrator edits a keyholder name or key number with valid values
- **THEN** the system updates that keyholder record without changing its UUID

### Requirement: Administrators can assign keyholders to events

The system SHALL allow an authenticated administrator to assign separate keyholders for event entry and exit using keyholder UUID references. Assignment controls SHALL offer active keyholders by name and SHALL NOT display key numbers.

#### Scenario: Administrator assigns event keyholders

- **WHEN** an authenticated administrator selects keyholders for event entry and exit
- **THEN** the system stores the selected keyholder identities on the event
- **AND** the event displays the current names of the assigned keyholders
- **AND** the assignment controls do not expose key numbers

#### Scenario: Inactive keyholder is already assigned to an event

- **WHEN** a keyholder assigned to an existing event is deactivated
- **THEN** the event retains the keyholder UUID reference
- **AND** the event continues to display the current keyholder name
- **AND** the inactive keyholder is excluded from new assignment choices

#### Scenario: No event keyholder is assigned

- **WHEN** an event has no entry or exit keyholder assignment
- **THEN** the corresponding assignment remains empty
- **AND** the event remains eligible for the existing missing-keyholder workflow

### Requirement: Event groups use one keyholder for entry and exit

The system SHALL allow an authenticated administrator to select one active keyholder when creating an event group and SHALL apply that keyholder to both entry and exit for every generated event instance. The event-group assignment control SHALL display names only. Client-side event-group validation SHALL reject an unassigned keyholder before submission.

#### Scenario: Administrator creates an event group with a keyholder

- **WHEN** an authenticated administrator selects an active keyholder and creates an event group
- **THEN** every generated event instance references that keyholder for both entry and exit
- **AND** the event-group form does not display the key number

#### Scenario: Inactive keyholder cannot be selected for a new event group

- **WHEN** an administrator opens the event-group keyholder selector after a keyholder has been deactivated
- **THEN** the inactive keyholder is not offered as a selectable option

#### Scenario: Unassigned event group is rejected client-side

- **WHEN** an administrator submits an event group while the keyholder selector remains set to `Unassigned`
- **THEN** the form displays a keyholder validation error
- **AND** the event-group request is not sent

## MODIFIED Requirements

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

## MODIFIED Requirements

### Requirement: Event-group duplication is server-authoritative and transactional

The system SHALL provide an authenticated duplication operation that accepts the source group identifier, an editable rate, an editable keyholder, and new date/time instances. The server SHALL copy only the source group’s immutable setup, validate the selected rate and active keyholder, validate the submitted instances and booking conflicts, and create the new group and all sessions atomically. For event-group schedules, a submitted instance SHALL conflict with an existing event only when its time range overlaps that event’s time range; proximity within 30 minutes without overlap SHALL NOT by itself cause a conflict. A failed validation or conflict SHALL leave both the source and destination absent or unchanged.

#### Scenario: Valid duplication creates a new group

- **WHEN** an authenticated administrator submits a valid source group, active rate, active keyholder, and non-overlapping new schedule
- **THEN** the system creates a new event group with the source name, details, visibility, and contact
- **AND** it uses the submitted rate and keyholder
- **AND** it creates the submitted sessions as approved group events
- **AND** it does not copy invoices or source session identifiers

#### Scenario: Duplication permits a non-overlapping schedule near an existing event

- **WHEN** an authenticated administrator submits a new group session whose time range does not overlap an existing event but begins or ends within 30 minutes of it
- **THEN** the duplication succeeds if all other validation passes
- **AND** the new group and its sessions are committed atomically

#### Scenario: Duplication rejects an inactive keyholder

- **WHEN** the duplication request selects an inactive or missing keyholder
- **THEN** the system returns a validation error
- **AND** it creates no destination group or sessions

#### Scenario: Duplication rejects an invalid rate

- **WHEN** the duplication request selects a missing or invalid rate
- **THEN** the system returns a validation error
- **AND** it creates no destination group or sessions

#### Scenario: Duplication rejects overlapping instances

- **WHEN** one or more submitted instances overlap an existing event or otherwise fail schedule validation
- **THEN** the system returns a conflict or validation error
- **AND** it creates no destination group or sessions

#### Scenario: Duplication rejects conflicting instances

- **WHEN** one or more submitted instances conflict with an existing booking or otherwise fail schedule validation
- **THEN** the system returns a conflict or validation error
- **AND** it creates no destination group or sessions

#### Scenario: Duplication preserves ordinary booking clearance behavior elsewhere

- **WHEN** an ordinary event, public booking, or event-date update is submitted within 30 minutes of an existing event without overlapping it
- **THEN** the existing 30-minute conflict rule remains in effect

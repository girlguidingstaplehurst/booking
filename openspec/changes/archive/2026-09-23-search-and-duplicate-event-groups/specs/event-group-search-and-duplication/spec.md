## Purpose

Provide administrators with a searchable historical event-group directory and a controlled workflow for creating a new event group from an existing group’s reusable setup.

## ADDED Requirements

### Requirement: Administrators can search historical event groups

The system SHALL provide an authenticated Event Group Search widget at the bottom of the Dashboard that searches event-group titles case-insensitively using partial matches. The widget SHALL send no query for fewer than three entered characters, SHALL search as the user types after the minimum is reached, and SHALL display matching groups in descending order by the latest session end date.

#### Scenario: Search waits for the minimum query length

- **WHEN** an administrator enters fewer than three characters in Event Group Search
- **THEN** the system does not send a search request and displays no search results

#### Scenario: Search executes as the administrator types

- **WHEN** an administrator enters at least three characters
- **THEN** the system sends a debounced authenticated search request for the title query
- **AND** matching historical and current event groups are returned regardless of whether their sessions have completed

#### Scenario: Search matches titles case-insensitively

- **WHEN** an administrator searches for a partial title using different capitalization
- **THEN** the system returns event groups whose titles contain the query without case sensitivity

#### Scenario: Search results are newest first

- **WHEN** multiple event groups match the title query
- **THEN** the system displays them in descending order by each group’s latest session end date

#### Scenario: Search has no matches

- **WHEN** an administrator enters a query of at least three characters that matches no event-group title
- **THEN** the widget displays an explicit no-results state

### Requirement: Search results provide event-group review navigation

Each matching event group SHALL be rendered using the existing event-group card presentation and SHALL provide a Review action linking to the authenticated review route for that group.

#### Scenario: Administrator reviews a search result

- **WHEN** an administrator activates Review on a matching event-group result
- **THEN** the application opens the group review route for that group

### Requirement: Administrators can open a duplicate event-group form

The authenticated event-group review page SHALL provide a Duplicate Event Group action that opens a dedicated duplicate form for the reviewed group.

#### Scenario: Administrator starts duplication

- **WHEN** an administrator activates Duplicate Event Group on an event-group review page
- **THEN** the application opens a dedicated duplicate form for the source group
- **AND** the duplicate form initially contains no event dates while retaining the source group’s time values as editable defaults

### Requirement: Duplicate forms preserve setup while limiting editable fields

The duplicate form SHALL copy the source group’s name, details, visibility, and contact as non-editable values. The form SHALL allow the administrator to edit the rate, keyholder, and new date/time instances. The system SHALL NOT copy source invoices, session identifiers, or existing event instances.

#### Scenario: Duplicate form displays copied setup

- **WHEN** an administrator opens a duplicate form for an existing event group
- **THEN** the form displays the source name, details, visibility, and contact
- **AND** those fields cannot be edited
- **AND** the rate and keyholder retain the source selections while remaining editable

#### Scenario: Duplicate form starts with a new schedule

- **WHEN** an administrator opens a duplicate form
- **THEN** no source dates are selected
- **AND** the source group’s time-of-day values are retained in the date/time controls
- **AND** those time values remain editable
- **AND** the administrator can add new valid dates before submitting

#### Scenario: Invalid inherited option remains visible

- **WHEN** the source rate or keyholder is no longer a valid selectable option
- **THEN** the duplicate form still displays that inherited option as the selected value
- **AND** the form displays a validation error for that field
- **AND** valid replacement options remain available

#### Scenario: Invalid setup prevents duplication

- **WHEN** the administrator submits while the selected rate or keyholder is invalid
- **THEN** the system displays a field validation error
- **AND** it does not create a new event group

### Requirement: Event-group duplication is server-authoritative and transactional

The system SHALL provide an authenticated duplication operation that accepts the source group identifier, an editable rate, an editable keyholder, and new date/time instances. The server SHALL copy only the source group’s immutable setup, validate the selected rate and active keyholder, validate the submitted instances and booking conflicts, and create the new group and all sessions atomically. A failed validation or conflict SHALL leave both the source and destination absent or unchanged.

#### Scenario: Valid duplication creates a new group

- **WHEN** an authenticated administrator submits a valid source group, active rate, active keyholder, and non-conflicting new schedule
- **THEN** the system creates a new event group with the source name, details, visibility, and contact
- **AND** it uses the submitted rate and keyholder
- **AND** it creates the submitted sessions as approved group events
- **AND** it does not copy invoices or source session identifiers

#### Scenario: Duplication rejects an inactive keyholder

- **WHEN** the duplication request selects an inactive or missing keyholder
- **THEN** the system returns a validation error
- **AND** it creates no destination group or sessions

#### Scenario: Duplication rejects an invalid rate

- **WHEN** the duplication request selects a missing or invalid rate
- **THEN** the system returns a validation error
- **AND** it creates no destination group or sessions

#### Scenario: Duplication rejects conflicting instances

- **WHEN** one or more submitted instances conflict with an existing booking or otherwise fail schedule validation
- **THEN** the system returns a conflict or validation error
- **AND** it creates no destination group or sessions

## MODIFIED Requirements

### Requirement: Administrators can list rate definitions

The system SHALL provide an authenticated admin view and API response containing each rate definition's identifier, description, pricing mode, and pricing configuration, including hourly price, fixed session price, or progressive per-session pricing as applicable. The available rate definitions SHALL be usable by individual-event creation and review workflows, including fixed-session definitions.

#### Scenario: List existing rates

- **WHEN** an authenticated administrator opens the rates screen or an individual-event rate selector
- **THEN** the system displays available rate definitions with their descriptions and an understandable summary of the configured pricing mode and price

#### Scenario: List a fixed-session rate

- **WHEN** an authenticated administrator retrieves rates containing a fixed-session definition
- **THEN** the response and individual-event rate selector identify that definition as fixed-session pricing and include its configured session price

#### Scenario: Unauthenticated rate listing

- **WHEN** an unauthenticated request attempts to retrieve rate definitions
- **THEN** the system rejects the request and does not return rate data

### Requirement: Administrators can assign a fixed-session rate to an individual event

The system SHALL allow an authenticated administrator to select an existing fixed-session rate when creating an individual event or reviewing an existing individual event. The selected rate identifier SHALL be persisted on that event, and subsequent invoice preparation SHALL use the selected fixed session price once for the event's billable session.

#### Scenario: Create an individual event with a fixed-session rate

- **WHEN** an authenticated administrator creates an individual event and selects a valid fixed-session rate
- **THEN** the event is created with that rate identifier
- **AND** later invoice preparation uses the configured fixed session price rather than calculating a charge from elapsed hourly duration

#### Scenario: Change an individual event to a fixed-session rate during review

- **WHEN** an authenticated administrator reviews an individual event and changes its rate to a valid fixed-session definition
- **THEN** the event retains the new rate identifier
- **AND** later invoice preparation uses the new fixed session price

#### Scenario: Preserve existing rate choices

- **WHEN** an administrator creates or reviews an individual event
- **THEN** hourly and progressive per-session rates remain selectable
- **AND** selecting a fixed-session rate does not alter the event's dates, contact details, status, or other event attributes

#### Scenario: Reject an unavailable rate assignment

- **WHEN** an administrator attempts to assign a rate identifier that does not exist or cannot be assigned
- **THEN** the system rejects the assignment with a meaningful error
- **AND** the event retains its previous rate assignment or is not created

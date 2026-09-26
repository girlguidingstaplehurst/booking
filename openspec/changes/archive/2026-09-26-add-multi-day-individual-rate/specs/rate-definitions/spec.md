## MODIFIED Requirements

### Requirement: Administrators can list rate definitions

The system SHALL provide an authenticated admin view and API response containing each rate definition's identifier, description, pricing mode, and pricing configuration, including hourly price, fixed session price, progressive per-session pricing, or multi-day duration pricing as applicable. The available rate definitions SHALL be usable by individual-event creation and review workflows, including fixed-session and multi-day definitions. Rate selectors for event groups SHALL exclude multi-day definitions.

#### Scenario: List a multi-day rate

- **WHEN** an authenticated administrator retrieves rates containing a multi-day definition
- **THEN** the response and individual-event rate selector identify the definition as multi-day pricing and include its initial period count, initial daily rate, later daily rate, and hourly remainder rate

#### Scenario: List existing rates

- **WHEN** an authenticated administrator opens the rates screen or an individual-event rate selector
- **THEN** the system displays all available rate definitions with their descriptions and an understandable summary of the configured pricing mode and price

#### Scenario: List a fixed-session rate

- **WHEN** an authenticated administrator retrieves rates containing a fixed-session definition
- **THEN** the response and individual-event rate selector identify that definition as fixed-session pricing and include its configured session price

#### Scenario: Unauthenticated rate listing

- **WHEN** an unauthenticated request attempts to retrieve rate definitions
- **THEN** the system rejects the request and does not return rate data

#### Scenario: Exclude multi-day rates from event groups

- **WHEN** an administrator opens an event-group rate selector
- **THEN** multi-day rate definitions are not offered as selectable options
- **AND** hourly, fixed-session, and progressive per-session options remain governed by their existing compatibility rules

### Requirement: Administrators can create a rate definition

The system SHALL allow an authenticated administrator to create a rate definition with an immutable identifier, description, and exactly one valid pricing mode: hourly with a non-negative hourly price, fixed-session with a non-negative session price, progressive per-session pricing with the existing two-tier configuration, or multi-day pricing with a positive initial 24-hour period count and non-negative initial daily, later daily, and hourly remainder rates.

#### Scenario: Create a multi-day rate

- **WHEN** the administrator submits a valid identifier, description, initial period count, initial daily rate, later daily rate, hourly remainder rate, and multi-day pricing mode
- **THEN** the system creates the rate as multi-day pricing and returns all configured duration pricing values

#### Scenario: Create an hourly-only rate

- **WHEN** the administrator submits a valid identifier, description, and hourly price with hourly pricing selected
- **THEN** the system creates the rate as hourly pricing and returns the created definition

#### Scenario: Create a fixed-session rate

- **WHEN** the administrator submits a valid identifier, description, and non-negative fixed session price with fixed-session pricing selected
- **THEN** the system creates the rate as fixed-session pricing and returns the configured session price

#### Scenario: Create a progressive per-session rate

- **WHEN** the administrator submits a valid first tier with a positive session count and fixed total price plus a valid additional-session price with progressive pricing selected
- **THEN** the system stores the per-session definition as an ordered array containing `{count, price}` followed by `{price}`

#### Scenario: Reject invalid multi-day rate creation

- **WHEN** a multi-day definition has a missing or non-positive initial period count, a negative daily rate, a negative hourly remainder rate, or pricing fields belonging to another mode
- **THEN** the system rejects the request with a meaningful validation error and does not create the rate

#### Scenario: Reject invalid or ambiguous rate creation

- **WHEN** the submitted identifier, description, or monetary values fail validation, or the identifier is already in use
- **THEN** the system rejects the request with a meaningful validation error and does not create a partial rate

#### Scenario: Reject invalid rate creation

- **WHEN** the submitted identifier, description, or monetary values fail validation, or the identifier is already in use
- **THEN** the system rejects the request with a meaningful validation error and does not create a partial rate

### Requirement: Administrators can edit a rate definition

The system SHALL allow an authenticated administrator to update a rate's description and exactly one valid pricing mode, including changes to or from multi-day pricing, without changing its identifier.

#### Scenario: Update an existing multi-day rate

- **WHEN** the administrator submits valid changes to a multi-day rate's duration pricing values
- **THEN** the system persists the changes in place and returns the updated rate definition
- **AND** existing event and event-group references to the rate identifier remain intact

#### Scenario: Update an existing rate

- **WHEN** the administrator submits valid changes for an existing rate, including a change between hourly, fixed-session, progressive, and multi-day pricing
- **THEN** the system persists the changes and returns the updated rate definition

#### Scenario: Attempt to edit a missing rate

- **WHEN** the administrator submits an update for an identifier that does not exist
- **THEN** the system returns a not-found error and does not create a new rate

#### Scenario: Preserve rate references

- **WHEN** an administrator edits a rate that is referenced by events or event groups
- **THEN** the system updates the definition in place while preserving the existing identifier and references

## ADDED Requirements

### Requirement: Multi-day pricing calculates individual-event duration charges

The system SHALL apply multi-day pricing only to individual events using elapsed 24-hour periods. Each of the first configured full periods SHALL be charged at the initial daily rate, each later full period SHALL be charged at the later daily rate, and remaining hours SHALL be charged at the hourly remainder rate capped at the daily rate for the tier containing the remainder.

#### Scenario: Calculate an event within the initial tier

- **WHEN** an individual event lasts 26 hours and has two initial periods at 100, a later daily rate of 80, and an hourly remainder rate of 5
- **THEN** the charge is 110, consisting of one initial daily rate plus two hourly hours capped at the initial daily rate

#### Scenario: Calculate an event crossing into later periods

- **WHEN** an individual event lasts 74 hours and has two initial periods at 100, a later daily rate of 80, and an hourly remainder rate of 5
- **THEN** the charge is 290, consisting of two initial periods, one later period, and two remainder hours capped at the later daily rate

#### Scenario: Cap a high hourly remainder

- **WHEN** an individual event has remaining hours whose hourly cost exceeds the daily rate for the current tier
- **THEN** the remainder charge is capped at that current tier's daily rate

#### Scenario: Do not apply multi-day pricing to event groups

- **WHEN** an event group is prepared for invoicing with a multi-day rate identifier
- **THEN** the system rejects the incompatible assignment or prevents the rate from being selected
- **AND** existing event-group pricing behavior is unchanged

#### Scenario: Exact full-period duration

- **WHEN** an individual event duration is an exact multiple of 24 hours
- **THEN** the system charges only the applicable full-period rates and does not add an hourly remainder charge

### Requirement: Rate editor supports multi-day pricing validation

The rate editor SHALL expose multi-day pricing and validate its initial period count, initial daily rate, later daily rate, and hourly remainder rate before submission. It SHALL display actionable field-level feedback and SHALL continue validating only fields belonging to the selected pricing mode.

#### Scenario: Multi-day mode is available

- **WHEN** an administrator opens the add or edit rate form
- **THEN** the pricing controls include a multi-day duration pricing option
- **AND** selecting it displays fields for initial period count, initial daily rate, later daily rate, and hourly remainder rate

#### Scenario: Invalid multi-day fields

- **WHEN** an administrator selects multi-day pricing and enters a missing or non-positive period count, or a negative monetary value
- **THEN** the relevant field is marked invalid with an actionable validation message
- **AND** the form cannot be submitted

#### Scenario: Edit an existing multi-day rate

- **WHEN** an administrator opens an existing multi-day rate for editing
- **THEN** multi-day pricing is selected
- **AND** all configured multi-day fields are populated

#### Scenario: Submit a valid multi-day rate

- **WHEN** an administrator enters valid required rate details and multi-day pricing values
- **THEN** the form becomes eligible for submission
- **AND** the submitted rate identifies multi-day pricing with the configured values

### Requirement: Rate definitions preserve existing pricing compatibility

The system SHALL preserve existing hourly, fixed-session, and progressive per-session rate behavior for individual events and event groups. Adding or editing multi-day fields SHALL NOT alter dates, contacts, statuses, rate identifiers, or unrelated pricing configuration.

#### Scenario: Existing modes remain selectable

- **WHEN** an administrator creates or reviews an individual event or event group
- **THEN** existing compatible hourly, fixed-session, and progressive per-session rates remain selectable
- **AND** multi-day pricing is available only in individual-event workflows

#### Scenario: Change pricing mode without stale values

- **WHEN** an administrator changes a rate definition from multi-day pricing to another mode
- **THEN** the saved definition contains only the selected mode's pricing configuration
- **AND** stale multi-day values do not affect later calculations

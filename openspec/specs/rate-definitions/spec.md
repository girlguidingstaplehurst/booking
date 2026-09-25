# rate-definitions Specification

## Purpose

Provide administrators with a secure, understandable way to maintain reusable hourly, fixed-session, and progressive per-session rate definitions used by booking workflows.

## Requirements

### Requirement: Administrators can list rate definitions

The system SHALL provide an authenticated admin view and API response containing each rate definition's identifier, description, pricing mode, and pricing configuration, including hourly price, fixed session price, or progressive per-session pricing as applicable.

#### Scenario: List existing rates

- **WHEN** an authenticated administrator opens the rates screen
- **THEN** the system displays all available rate definitions with their descriptions and an understandable summary of the configured pricing mode and price

#### Scenario: List a fixed-session rate

- **WHEN** an authenticated administrator retrieves rates containing a fixed-session definition
- **THEN** the response identifies that definition as fixed-session pricing and includes its configured session price

#### Scenario: Unauthenticated rate listing

- **WHEN** an unauthenticated request attempts to retrieve rate definitions
- **THEN** the system rejects the request and does not return rate data

### Requirement: Administrators can create a rate definition

The system SHALL allow an authenticated administrator to create a rate definition with an immutable identifier, description, and exactly one valid pricing mode: hourly with a non-negative hourly price, fixed-session with a non-negative session price, or progressive per-session pricing with the existing two-tier configuration.

#### Scenario: Create an hourly-only rate

- **WHEN** the administrator submits a valid identifier, description, and hourly price with hourly pricing selected
- **THEN** the system creates the rate as hourly pricing and returns the created definition

#### Scenario: Create a fixed-session rate

- **WHEN** the administrator submits a valid identifier, description, and non-negative fixed session price with fixed-session pricing selected
- **THEN** the system creates the rate as fixed-session pricing and returns the configured session price

#### Scenario: Create a progressive per-session rate

- **WHEN** the administrator submits a valid first tier with a positive session count and fixed total price plus a valid additional-session price with progressive pricing selected
- **THEN** the system stores the per-session definition as an ordered array containing `{count, price}` followed by `{price}`

#### Scenario: Reject invalid or ambiguous rate creation

- **WHEN** the submitted identifier, description, or monetary values fail validation, or the identifier is already in use
- **THEN** the system rejects the request with a meaningful validation error and does not create a partial rate

#### Scenario: Reject invalid rate creation

- **WHEN** the submitted identifier, description, or monetary values fail validation, or the identifier is already in use
- **THEN** the system rejects the request with a meaningful validation error and does not create a partial rate

### Requirement: Administrators can edit a rate definition

The system SHALL allow an authenticated administrator to update a rate's description and exactly one valid pricing mode without changing its identifier.

#### Scenario: Update an existing rate

- **WHEN** the administrator submits valid changes for an existing rate, including a change between hourly, fixed-session, and progressive pricing
- **THEN** the system persists the changes and returns the updated rate definition

#### Scenario: Attempt to edit a missing rate

- **WHEN** the administrator submits an update for an identifier that does not exist
- **THEN** the system returns a not-found error and does not create a new rate

#### Scenario: Preserve rate references

- **WHEN** an administrator edits a rate that is referenced by events or event groups
- **THEN** the system updates the definition in place while preserving the existing identifier and references

### Requirement: Fixed-session pricing charges one configured amount per session

The system SHALL represent fixed-session pricing with a non-negative session price and SHALL use that price once for each billable session associated with the selected rate.

#### Scenario: Calculate a fixed-session event

- **WHEN** an event uses a fixed-session rate with a session price of 80
- **THEN** the calculated charge for that event's session is 80 regardless of the event's elapsed hourly duration

#### Scenario: Calculate multiple fixed-session group sessions

- **WHEN** an event group contains three billable sessions using a fixed-session rate priced at 80 per session
- **THEN** the calculated charge for the group sessions is 240

#### Scenario: Fixed-session price cannot be negative

- **WHEN** a fixed-session definition contains a negative session price
- **THEN** the system rejects the definition with a validation error

### Requirement: Per-session pricing uses an unambiguous two-tier format

The system SHALL represent configured per-session pricing as an ordered array whose first item contains `count` and `price`, whose second item contains `price`, and whose empty array means no per-session pricing.

#### Scenario: Interpret the two-tier definition

- **WHEN** a rate contains `[{"count":10,"price":150},{"price":13.5}]`
- **THEN** the first ten sessions are represented by a fixed total price of 150 and each session beyond ten is represented by an additional price of 13.5

#### Scenario: Validate per-session structure

- **WHEN** a submitted per-session definition has a non-positive count, a negative price, missing required tier values, or more than the supported two tiers
- **THEN** the system rejects the definition with a validation error

### Requirement: Rate editor provides actionable client-side validation feedback

The rate editor SHALL expose hourly, fixed-session, and progressive per-session pricing modes. It SHALL validate the fields belonging to the selected mode before submission and SHALL present an actionable error beside each invalid field using the same field-level feedback convention as the administrator event forms.

#### Scenario: Fixed-session mode is available

- **WHEN** an administrator opens the add or edit rate form
- **THEN** the pricing-type controls include a fixed-session pricing option
- **AND** selecting it displays the fixed session price field

#### Scenario: Empty new rate form

- **WHEN** an administrator opens the new rate form
- **THEN** the form is considered invalid until the required identifier, description, and selected pricing fields contain valid values
- **AND** the Save action is disabled

#### Scenario: Invalid hourly pricing

- **WHEN** an administrator selects hourly pricing and enters a missing or negative hourly rate
- **THEN** the hourly rate field is marked invalid with a validation message
- **AND** the form cannot be submitted

#### Scenario: Invalid progressive pricing

- **WHEN** an administrator selects progressive per-session pricing and enters a missing, fractional, or non-positive session count, or a negative price
- **THEN** the relevant per-session field is marked invalid with a validation message
- **AND** the form cannot be submitted

#### Scenario: Invalid fixed-session pricing

- **WHEN** an administrator selects fixed-session pricing and enters a missing or negative session price
- **THEN** the session price field is marked invalid with a validation message
- **AND** the form cannot be submitted

#### Scenario: Valid fixed-session pricing

- **WHEN** an administrator selects fixed-session pricing and enters a non-negative session price together with valid required rate details
- **THEN** the form becomes eligible for submission
- **AND** the submitted rate identifies fixed-session pricing and includes the configured session price

#### Scenario: Edit an existing fixed-session rate

- **WHEN** an administrator opens an existing fixed-session rate for editing
- **THEN** the fixed-session pricing option is selected
- **AND** the configured session price is populated in the fixed session price field

#### Scenario: Existing pricing modes remain available

- **WHEN** an administrator uses the rate editor
- **THEN** hourly and progressive per-session pricing remain selectable
- **AND** selecting either mode displays and validates only that mode's pricing fields

#### Scenario: Correcting a validation error

- **WHEN** an administrator changes an invalid field to a valid value
- **THEN** its validation feedback is cleared after validation
- **AND** Save becomes enabled when no other form errors remain

### Requirement: Rate editor communicates submission state

The rate editor SHALL prevent duplicate submissions while a request is in progress and SHALL preserve a form-level message when the server rejects an otherwise client-valid request.

#### Scenario: Saving a valid rate

- **WHEN** an administrator submits a valid rate
- **THEN** the Save action shows its loading state and is disabled until the request completes

#### Scenario: Server rejects a rate

- **WHEN** the server rejects a submitted rate, such as because its identifier already exists
- **THEN** the editor displays the server-provided error as a form-level message
- **AND** the administrator can correct the form and retry

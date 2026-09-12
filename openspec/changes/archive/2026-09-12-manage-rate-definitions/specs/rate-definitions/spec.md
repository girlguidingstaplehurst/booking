## Purpose

Provide administrators with a secure, understandable way to maintain the reusable hourly and progressive per-session rate definitions used by booking workflows.

## ADDED Requirements

### Requirement: Administrators can list rate definitions

The system SHALL provide an authenticated admin view and API response containing each rate definition's identifier, description, hourly price, and per-session pricing configuration.

#### Scenario: List existing rates

- **WHEN** an authenticated administrator opens the rates screen
- **THEN** the system displays all available rate definitions with their descriptions, hourly prices, and whether per-session pricing is configured

#### Scenario: Unauthenticated rate listing

- **WHEN** an unauthenticated request attempts to retrieve rate definitions
- **THEN** the system rejects the request and does not return rate data

### Requirement: Administrators can create a rate definition

The system SHALL allow an authenticated administrator to create a rate definition with an immutable identifier, description, non-negative hourly price, and optional two-tier per-session pricing.

#### Scenario: Create an hourly-only rate

- **WHEN** the administrator submits a valid identifier, description, and hourly price with no per-session pricing
- **THEN** the system creates the rate with an empty per-session array and returns the created definition

#### Scenario: Create a progressive per-session rate

- **WHEN** the administrator submits a valid first tier with a positive session count and fixed total price plus a valid additional-session price
- **THEN** the system stores the per-session definition as an ordered array containing `{count, price}` followed by `{price}`

#### Scenario: Reject invalid rate creation

- **WHEN** the submitted identifier, description, or monetary values fail validation, or the identifier is already in use
- **THEN** the system rejects the request with a meaningful validation error and does not create a partial rate

### Requirement: Administrators can edit a rate definition

The system SHALL allow an authenticated administrator to update a rate's description, hourly price, and optional per-session pricing without changing its identifier.

#### Scenario: Update an existing rate

- **WHEN** the administrator submits valid changes for an existing rate
- **THEN** the system persists the changes and returns the updated rate definition

#### Scenario: Attempt to edit a missing rate

- **WHEN** the administrator submits an update for an identifier that does not exist
- **THEN** the system returns a not-found error and does not create a new rate

#### Scenario: Preserve rate references

- **WHEN** an administrator edits a rate that is referenced by events or event groups
- **THEN** the system updates the definition in place while preserving the existing identifier and references

### Requirement: Per-session pricing uses an unambiguous two-tier format

The system SHALL represent configured per-session pricing as an ordered array whose first item contains `count` and `price`, whose second item contains `price`, and whose empty array means no per-session pricing.

#### Scenario: Interpret the two-tier definition

- **WHEN** a rate contains `[{"count":10,"price":150},{"price":13.5}]`
- **THEN** the first ten sessions are represented by a fixed total price of 150 and each session beyond ten is represented by an additional price of 13.5

#### Scenario: Validate per-session structure

- **WHEN** a submitted per-session definition has a non-positive count, a negative price, missing required tier values, or more than the supported two tiers
- **THEN** the system rejects the definition with a validation error

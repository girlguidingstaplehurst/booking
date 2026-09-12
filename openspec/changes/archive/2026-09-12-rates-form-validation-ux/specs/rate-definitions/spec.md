## ADDED Requirements

### Requirement: Rate editor provides actionable client-side validation feedback

The rate editor SHALL validate entered rate values before submission and SHALL present an actionable error beside each invalid field using the same field-level feedback convention as the administrator event forms.

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

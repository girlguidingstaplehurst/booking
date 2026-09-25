## MODIFIED Requirements

### Requirement: Rate editor provides actionable client-side validation feedback

The rate editor SHALL expose hourly, fixed-session, and progressive per-session pricing modes. It SHALL validate the fields belonging to the selected mode before submission and SHALL present an actionable error beside each invalid field using the same field-level feedback convention as the administrator event forms.

#### Scenario: Fixed-session mode is available

- **WHEN** an administrator opens the add or edit rate form
- **THEN** the pricing-type controls include a fixed-session pricing option
- **AND** selecting it displays the fixed session price field

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

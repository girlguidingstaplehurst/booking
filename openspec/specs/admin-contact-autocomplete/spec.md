## Purpose

This capability lets administrators quickly reuse known booking contacts while retaining the ability to enter new contacts manually during event creation.

## Requirements

### Requirement: Administrators can retrieve existing contacts
The system SHALL provide an authenticated admin endpoint that returns the existing booking contacts, including each contact's name and email address.

#### Scenario: Contact list is returned
- **WHEN** an authenticated administrator requests the contacts list
- **THEN** the system returns a successful JSON response containing the available contact names and email addresses

#### Scenario: Unauthenticated contact-list request
- **WHEN** a request for the contacts list lacks valid admin authentication
- **THEN** the system rejects the request and does not disclose contact data

### Requirement: Existing contacts can populate admin creation forms
The admin event and event-group creation forms SHALL provide a contact name autocomplete that filters existing contacts client-side and, when an existing contact is selected, populates both the contact name and email fields.

#### Scenario: Matching contacts are suggested
- **WHEN** an administrator types a contact name into the autocomplete
- **THEN** the form displays existing contacts whose names match the entered text without requiring another server request

#### Scenario: Existing contact is selected
- **WHEN** an administrator selects a suggested contact
- **THEN** the form sets the contact name and email fields to that contact's stored values

#### Scenario: No matching contacts exist
- **WHEN** an administrator enters a name that does not match an existing contact
- **THEN** the form allows the entered name to remain and does not prevent manual email entry

### Requirement: Contact details remain editable
The admin creation forms SHALL allow administrators to edit the contact name and email after selecting an existing contact, and SHALL submit the resulting values using the existing event and event-group contact fields.

#### Scenario: Existing email is corrected
- **WHEN** an administrator selects an existing contact and changes the email address before submission
- **THEN** the form submits the changed email address rather than restoring the previously selected value

#### Scenario: New contact is submitted
- **WHEN** an administrator enters a contact name and valid new email address without selecting a suggestion
- **THEN** the form submits the new contact values successfully subject to the existing validation rules

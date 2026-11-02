## ADDED Requirements

### Requirement: Administrators can create zero-total individual invoices as paid without emailing them

The system SHALL provide a no-email action for individual-event invoice preparations when the live invoice total, displayed in GBP to two decimal places, is £0.00. The action SHALL appear alongside the existing Send Invoice action, which SHALL remain available for administrators who want to email a free invoice. The no-email action SHALL be available only for individual invoices, SHALL use the current editable invoice items and event associations, and SHALL create the invoice as paid without generating or sending an email. The server SHALL verify that the request is for an individual invoice with at least one associated event and that its total is £0.00; a failed validation SHALL create no invoice or associations.

#### Scenario: Show the no-email action for a live zero total
- **WHEN** an administrator prepares an individual invoice and its current displayed total is £0.00
- **THEN** the preparation shows a visually distinct no-email action alongside Send Invoice
- **AND** both actions use the current invoice items and event selection

#### Scenario: Update action availability when edited items change the total
- **WHEN** an administrator edits invoice items or changes the cleaning-deposit option
- **THEN** the no-email action is shown if and only if the current displayed invoice total is £0.00
- **AND** the existing Send Invoice action remains available

#### Scenario: Do not offer no-email creation for event-group invoices
- **WHEN** an administrator prepares an event-group invoice, including one whose total is £0.00
- **THEN** the no-email action is not shown

#### Scenario: Create and mark a zero-total individual invoice paid without email
- **WHEN** an administrator submits the no-email action for an individual invoice with at least one associated event and a total of £0.00
- **THEN** the system creates one invoice with the submitted items and selected event associations
- **AND** the invoice is marked paid with a paid timestamp and has no sent timestamp
- **AND** the system does not generate an invoice PDF or send an email
- **AND** the administrator is navigated to the admin dashboard after success

#### Scenario: Reject a nonzero or non-individual no-email request
- **WHEN** the server receives a no-email invoice request whose total is not £0.00, which has no associated individual event, or which is for an event group
- **THEN** the request fails
- **AND** no invoice or event associations are created
- **AND** the administrator remains on the invoice preparation form

#### Scenario: Email a free invoice by choice
- **WHEN** an administrator chooses Send Invoice for an individual invoice whose total is £0.00
- **THEN** the existing invoice-send workflow emails the invoice as usual

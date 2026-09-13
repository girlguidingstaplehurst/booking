## MODIFIED Requirements

### Requirement: Administrators can edit and submit prepared invoice lines

The system SHALL allow administrators to edit invoice line descriptions and costs before submission, while preserving the selected event or event-group association and contact information when the invoice is sent. The system SHALL navigate an administrator to the admin dashboard after an invoice-send request receives a successful HTTP response and SHALL keep the administrator on the invoice preparation form when the request does not receive a successful HTTP response.

#### Scenario: Submit a combined individual invoice

- **WHEN** an administrator submits a prepared individual invoice containing multiple events
- **THEN** the system creates one invoice associated with the contact and preserves all selected event links through the invoice items
- **AND** the system preserves every selected event as an association with that invoice

#### Scenario: Submit a group invoice

- **WHEN** an administrator submits a prepared event-group invoice
- **THEN** the system creates one invoice associated with the event group and preserves the group association and prepared line items

#### Scenario: Edit a prepared line

- **WHEN** an administrator changes a line description or cost before submission
- **THEN** the submitted invoice uses the edited value for that line
- **AND** the system retains the source event association when the line represents an event or session

#### Scenario: Successfully send an invoice

- **WHEN** an administrator submits a prepared invoice
- **AND** the invoice-send request returns a response where `ok` is true
- **THEN** the system navigates the administrator to `/admin`

#### Scenario: Invoice send fails

- **WHEN** an administrator submits a prepared invoice
- **AND** the invoice-send request returns a response where `ok` is false or no response
- **THEN** the system keeps the administrator on the invoice preparation form

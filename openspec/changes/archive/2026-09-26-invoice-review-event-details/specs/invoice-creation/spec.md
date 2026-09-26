## ADDED Requirements

### Requirement: Administrators can review invoice items and invoice association

The system SHALL display every item on an existing invoice with its description and cost, display the invoice-level associated event or event group name and date/time when that association exists, and display the sum of all item costs as the invoice total. Invoices without an association SHALL remain reviewable.

#### Scenario: Review an invoice associated with events

- **WHEN** an administrator opens an existing invoice associated with one or more events
- **THEN** the invoice review displays each item description and cost
- **AND** displays the associated event name and date/time in the invoice header
- **AND** displays a total equal to the sum of all item costs

#### Scenario: Review an invoice associated with an event group

- **WHEN** an administrator opens an existing invoice associated with an event group
- **THEN** the invoice review displays the event-group name and date/time in the invoice header
- **AND** displays every item description and cost

#### Scenario: Review an invoice without an association

- **WHEN** an administrator opens an invoice without an event or event-group association
- **THEN** the review displays all items in one invoice item list
- **AND** calculates the total from every displayed item

#### Scenario: Review an invoice with no items

- **WHEN** an administrator opens an invoice whose item collection is empty
- **THEN** the review displays a total of zero
- **AND** does not fail because invoice association data is absent

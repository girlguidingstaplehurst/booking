## MODIFIED Requirements

### Requirement: Dashboard displays complete event and invoice actions

The system SHALL display Dashboard event, event-group, calendar, review, invoice creation, and invoice payment actions without failing when optional invoice collections are absent or incomplete. The Dashboard SHALL limit individual-event invoice and keyholder workflow lists to approved events and SHALL NOT display an approval action on Dashboard event cards.

#### Scenario: Dashboard receives an event without invoices

- **WHEN** the Dashboard receives an event whose invoice collection is absent or null
- **THEN** the event renders normally, is eligible for invoicing when its other data indicates that no invoice exists and its status is approved, and does not throw a rendering error

#### Scenario: Dashboard receives an event group without invoices

- **WHEN** the Dashboard receives an event group whose invoice collection is absent or null
- **THEN** the event group renders normally, is eligible for invoicing, and does not throw a rendering error

#### Scenario: Dashboard displays an outstanding invoice

- **WHEN** an event or event group has an invoice whose status is not paid
- **THEN** the Dashboard displays a link to the invoice and a payment action for that invoice

#### Scenario: Dashboard hides the approval action

- **WHEN** an administrator views an individual event in the Dashboard's approval section
- **THEN** the Dashboard does not display an `Approve` action on the event card

#### Scenario: Dashboard shows only approved events for invoicing

- **WHEN** the Dashboard builds the `Events to be invoiced` section
- **THEN** it displays individual events with no invoices only when their status is `approved`
- **AND** it does not display unapproved individual events in that section

#### Scenario: Dashboard shows only approved events needing keyholders

- **WHEN** the Dashboard builds the `Needing keyholders` section
- **THEN** it displays individual events missing an entry or exit keyholder only when their status is `approved`
- **AND** it does not display unapproved individual events in that section

#### Scenario: Dashboard preserves event-group workflow behavior

- **WHEN** the Dashboard receives an event group eligible for invoice creation
- **THEN** the event group remains governed by its existing invoice eligibility behavior
- **AND** the Dashboard does not require or infer a separate event-group approval status

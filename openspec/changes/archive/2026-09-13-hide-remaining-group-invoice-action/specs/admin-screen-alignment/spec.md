## MODIFIED Requirements

### Requirement: Dashboard displays complete event and invoice actions

The system SHALL display Dashboard event, event-group, booked-event, review,
invoice creation, and invoice payment actions without failing when optional
invoice collections are absent or incomplete. The Dashboard SHALL limit
individual-event invoice and keyholder workflow lists to approved events, SHALL
NOT display an approval action on Dashboard event cards, and SHALL replace the
redundant event calendar with event-group and booked-event card sections. Event
group cards in the `Event groups with remaining sessions` section SHALL provide
the group review action without displaying a direct `Create Invoice` action;
event groups in the `Events to be invoiced` section SHALL retain direct group
invoice creation.

#### Scenario: Dashboard receives an event without invoices

- **WHEN** the Dashboard receives an event whose invoice collection is absent
  or null
- **THEN** the event renders normally, is eligible for invoicing when its other
  data indicates that no invoice exists and its status is approved, and does not
  throw a rendering error

#### Scenario: Dashboard receives an event group without invoices

- **WHEN** the Dashboard receives an event group whose invoice collection is
  absent or null
- **THEN** the event group renders normally, is eligible for invoicing, and
  does not throw a rendering error

#### Scenario: Dashboard displays an outstanding invoice

- **WHEN** an event or event group has an invoice whose status is not paid
- **THEN** the Dashboard displays a link to the invoice and a payment action
  for that invoice

#### Scenario: Dashboard hides the approval action

- **WHEN** an administrator views an individual event in the Dashboard's
  approval section
- **THEN** the Dashboard does not display an `Approve` action on the event card

#### Scenario: Dashboard shows only approved events for invoicing

- **WHEN** the Dashboard builds the `Events to be invoiced` section
- **THEN** it displays individual events with no invoices only when their status
  is `approved`
- **AND** it does not display unapproved individual events in that section

#### Scenario: Dashboard shows only approved events needing keyholders

- **WHEN** the Dashboard builds the `Needing keyholders` section
- **THEN** it displays individual events missing an entry or exit keyholder
  only when their status is `approved`
- **AND** it does not display unapproved individual events in that section

#### Scenario: Dashboard preserves event-group workflow behavior

- **WHEN** the Dashboard receives an event group eligible for invoice creation
- **THEN** the event group remains governed by its existing invoice eligibility
  behavior
- **AND** the Dashboard does not require or infer a separate event-group
  approval status

#### Scenario: Dashboard displays remaining event groups

- **WHEN** an event group has at least one session whose end date is today or a
  later date
- **THEN** the Dashboard displays the group in a separate event-group section
- **AND** the group uses its existing card header color

#### Scenario: Remaining-session group cards provide review without invoice creation

- **WHEN** an event group has at least one session whose end date is today or a
  later date and is displayed in the `Event groups with remaining sessions`
  section
- **THEN** the Dashboard displays the group review action
- **AND** the Dashboard does not display a `Create Invoice` action on that card

#### Scenario: Invoice-eligible group cards retain direct invoice creation

- **WHEN** an event group has no invoices and is displayed in the `Events to be
  invoiced` section
- **THEN** the Dashboard displays a `Create Invoice` action targeting the
  existing event-group invoice preparation flow

#### Scenario: Dashboard hides completed event groups

- **WHEN** every session in an event group ended before today
- **THEN** the Dashboard does not display the event group in the event-group
  section

#### Scenario: Dashboard displays booked individual events

- **WHEN** an approved individual event has an end date today or later and is
  not displayed in any existing Dashboard workflow section
- **THEN** the Dashboard displays the event in the booked-events section
- **AND** an event that ended before today is not displayed in that section

#### Scenario: Dashboard highlights an event active today

- **WHEN** a displayed booked individual event has a start date on or before
  today and an end date on or after today
- **THEN** its card header uses the existing purple color used elsewhere in the
  admin interface

#### Scenario: Dashboard does not highlight a non-active booked event

- **WHEN** a displayed booked individual event starts after today
- **THEN** its card header uses the normal individual-event color

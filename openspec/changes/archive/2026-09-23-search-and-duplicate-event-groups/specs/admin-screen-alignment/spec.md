## MODIFIED Requirements

### Requirement: Dashboard displays complete event and invoice actions

The system SHALL display Dashboard event, event-group, booked-event, review, invoice creation, invoice payment, and historical event-group search actions without failing when optional invoice collections are absent or incomplete. The Dashboard SHALL limit individual-event invoice and keyholder workflow lists to approved events, SHALL NOT display an approval action on Dashboard event cards, and SHALL replace the redundant event calendar with event-group and booked-event card sections. Event group cards in the `Event groups with remaining sessions` section SHALL provide the group review action without displaying a direct `Create Invoice` action; event groups in the `Events to be invoiced` section SHALL retain direct group invoice creation. The Dashboard SHALL provide an Event Group Search widget at the bottom that searches historical and current group titles and links matching results to group review.

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

#### Scenario: Dashboard displays remaining event groups

- **WHEN** an event group has at least one session whose end date is today or a later date
- **THEN** the Dashboard displays the group in a separate event-group section
- **AND** the group uses its existing card header color

#### Scenario: Remaining-session group cards provide review without invoice creation

- **WHEN** an event group has at least one session whose end date is today or a later date and is displayed in the `Event groups with remaining sessions` section
- **THEN** the Dashboard displays the group review action
- **AND** the Dashboard does not display a `Create Invoice` action on that card

#### Scenario: Invoice-eligible group cards retain direct invoice creation

- **WHEN** an event group has no invoices and is displayed in the `Events to be invoiced` section
- **THEN** the Dashboard displays a `Create Invoice` action targeting the existing event-group invoice preparation flow

#### Scenario: Dashboard hides completed event groups

- **WHEN** every session in an event group ended before today
- **THEN** the Dashboard does not display the event group in the event-group section

#### Scenario: Dashboard displays booked individual events

- **WHEN** an approved individual event has an end date today or later and is not displayed in any existing Dashboard workflow section
- **THEN** the Dashboard displays the event in the booked-events section
- **AND** an event that ended before today is not displayed in that section

#### Scenario: Dashboard highlights an event active today

- **WHEN** a displayed booked individual event has a start date on or before today and an end date on or after today
- **THEN** its card header uses the existing purple color used elsewhere in the admin interface

#### Scenario: Dashboard does not highlight a non-active booked event

- **WHEN** a displayed booked individual event starts after today
- **THEN** its card header uses the normal individual-event color

#### Scenario: Dashboard displays historical event-group search

- **WHEN** an authenticated administrator views the Dashboard
- **THEN** the Dashboard displays an Event Group Search widget below the existing Dashboard sections
- **AND** matching results use the existing event-group card presentation and provide a Review action

#### Scenario: Search results remain available for completed groups

- **WHEN** an administrator searches for a title belonging to an event group whose sessions have all ended
- **THEN** the matching group can appear in the search results even though it is absent from the operational event-group sections

### Requirement: Administrators can review an event group and reach its sessions

The system SHALL provide an authenticated route for reviewing an event group. The group review view SHALL show the group summary and invoice references, provide an action to create a new invoice for the group using the existing group invoice workflow, provide a Duplicate Event Group action that opens the dedicated duplicate form, and list each session that ends today or later with a link to that session’s individual event review route, where an administrator can move the session when necessary.

#### Scenario: Administrator opens an event-group review page

- **WHEN** an administrator selects an event group review action from the Dashboard
- **THEN** the application opens an authenticated group review page for that group
- **AND** the page shows the group name and its session date range

#### Scenario: Administrator creates a new group invoice

- **WHEN** an administrator activates the group invoice action from the group card or group review page
- **THEN** the application opens the existing invoice preparation flow targeted at that event group
- **AND** the administrator can submit a new invoice associated with the group

#### Scenario: Group review lists remaining sessions

- **WHEN** an event group has sessions ending today or later
- **THEN** the group review page lists each such session with its date and time
- **AND** each listed session links to the existing individual event review route for that session

#### Scenario: Administrator moves a group session

- **WHEN** an administrator opens a listed session's individual review route and submits a new valid start and end date/time
- **THEN** the system updates that session's dates
- **AND** the group review and Dashboard can reflect the updated session dates
- **AND** the system prevents the session from being saved when the new range conflicts with an existing booking

#### Scenario: Group review omits completed sessions

- **WHEN** a group session ended before today
- **THEN** that session is not listed as a remaining session on the group review page

#### Scenario: Group review handles a group with no remaining sessions

- **WHEN** an administrator opens a group review page after all sessions ended
- **THEN** the page remains accessible
- **AND** it shows that no remaining sessions are available
- **AND** it does not offer a session link for a completed session

#### Scenario: Administrator starts duplicating from group review

- **WHEN** an administrator activates Duplicate Event Group on the group review page
- **THEN** the application opens the dedicated duplicate form for that group

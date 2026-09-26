## MODIFIED Requirements

### Requirement: Dashboard displays complete event and invoice actions

The system SHALL display Dashboard event, event-group, booked-event, review, invoice creation, and invoice payment actions without failing when optional invoice collections are absent or incomplete. The Dashboard SHALL limit individual-event invoice and keyholder workflow lists to approved events, SHALL NOT display an approval action on Dashboard event cards, and SHALL replace the redundant event calendar with event-group and booked-event card sections. The Dashboard SHALL provide an Event Group Search widget at the bottom that searches historical and current group titles and links matching results to group review. Each Dashboard section SHALL present a collapsible heading row, SHALL start collapsed when no saved section preference exists, SHALL display the total number of items in the section, and SHALL display a separate red-flag count only when one or more items use that section's existing red-flag visual urgency treatment. Red-flag count badges SHALL use a red background with white text. The Dashboard SHALL persist each section's expanded or collapsed state in a browser cookie and restore that state on reload.

#### Scenario: Dashboard sections start collapsed without a saved preference

- **WHEN** an authenticated administrator opens the Dashboard without a valid saved section-state preference
- **THEN** every non-empty Dashboard section displays its heading row with its total item count
- **AND** every section's cards are collapsed and hidden

#### Scenario: Dashboard restores saved section states

- **WHEN** an authenticated administrator reloads the Dashboard with a valid saved section-state preference
- **THEN** each recognized section is expanded or collapsed according to its saved state
- **AND** a section not present in the saved preference remains collapsed

#### Scenario: Administrator toggles a Dashboard section

- **WHEN** an administrator activates a section heading row
- **THEN** the section cards toggle between visible and hidden
- **AND** the new expanded or collapsed state is persisted for subsequent Dashboard loads

#### Scenario: Dashboard displays section counts

- **WHEN** a Dashboard section contains one or more event or event-group cards
- **THEN** its heading row displays the total number of cards in that section
- **AND** the total count remains visible whether the section is expanded or collapsed

#### Scenario: Dashboard displays red-flag count only when applicable

- **WHEN** a Dashboard section contains one or more cards using that section's existing red-flag visual urgency treatment
- **THEN** its heading row displays the number of red-flagged cards in a red-background badge with white text
- **AND** the red-flag count is not displayed when no cards in the section are red-flagged

#### Scenario: Dashboard handles an invalid section-state preference

- **WHEN** the Dashboard cannot parse or validate its saved section-state preference
- **THEN** it treats the preference as absent and starts all sections collapsed

#### Scenario: Dashboard displays historical event-group search

- **WHEN** an authenticated administrator views the Dashboard
- **THEN** the Dashboard displays an Event Group Search widget below the existing Dashboard sections
- **AND** matching results use the existing event-group card presentation and provide a Review action

#### Scenario: Search results remain available for completed groups

- **WHEN** an administrator searches for a title belonging to an event group whose sessions have all ended
- **THEN** the matching group can appear in the search results even though it is absent from the operational event-group sections

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

- **WHEN** an event group has at least one session whose end date is today or later and is displayed in the `Event groups with remaining sessions` section
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

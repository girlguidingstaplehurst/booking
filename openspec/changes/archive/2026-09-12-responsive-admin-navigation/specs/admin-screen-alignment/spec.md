## MODIFIED Requirements

### Requirement: Dashboard-linked admin screens use a consistent presentation

The system SHALL present the Dashboard, event creation, event-group creation, event review, invoice creation, and invoice management screens using a consistent admin page structure, responsive spacing, page heading treatment, content grouping, and action hierarchy aligned with the Rates screens. The shared admin navigation SHALL provide responsive desktop and narrow-viewport behavior while exposing Dashboard and Rates as its only navigation items.

#### Scenario: Administrator opens a Dashboard-linked screen on desktop

- **WHEN** an authenticated administrator opens any Dashboard-linked admin screen on a desktop viewport
- **THEN** the screen presents a consistent branded page header and content layout with primary actions placed predictably and content grouped into readable cards or sections
- **AND** the shared admin navigation displays Dashboard and Rates as horizontal links with a clear current-route indication

#### Scenario: Administrator opens a Dashboard-linked screen on a narrow viewport

- **WHEN** an authenticated administrator opens any Dashboard-linked admin screen on a narrow viewport
- **THEN** headings, forms, cards, buttons, invoice tables, and calendar content remain usable without requiring horizontal page scrolling
- **AND** the shared admin navigation displays a menu control instead of requiring the horizontal links to fit

#### Scenario: Administrator opens the admin navigation drawer

- **WHEN** an authenticated administrator activates the admin navigation menu control on a narrow viewport
- **THEN** a right-side navigation drawer opens containing only Dashboard and Rates
- **AND** each drawer link indicates whether its route is current

#### Scenario: Administrator navigates from the admin navigation drawer

- **WHEN** an authenticated administrator selects Dashboard or Rates in the admin navigation drawer
- **THEN** the application navigates to the selected existing route
- **AND** the drawer closes after navigation

#### Scenario: Administrator hovers or activates an admin navigation link

- **WHEN** an authenticated administrator hovers over or navigates to an admin navigation link on the light-blue navigation bar
- **THEN** the link uses white for current-page emphasis and brand-colored hover treatment that remains readable against the light-blue background

#### Scenario: Administrator navigates between admin screens

- **WHEN** an authenticated administrator navigates from the Dashboard to an event, event-group, invoice, or Rates screen
- **THEN** the shared admin navigation and page-level navigation preserve the existing routes and provide a consistent indication of the current context

### Requirement: Dashboard displays complete event and invoice actions

The system SHALL display Dashboard event, event-group, calendar, approval, review, invoice creation, and invoice payment actions without failing when optional invoice collections are absent or incomplete.

#### Scenario: Dashboard receives an event without invoices

- **WHEN** the Dashboard receives an event whose invoice collection is absent or null
- **THEN** the event renders normally, is eligible for invoicing when its other data indicates that no invoice exists, and does not throw a rendering error

#### Scenario: Dashboard receives an event group without invoices

- **WHEN** the Dashboard receives an event group whose invoice collection is absent or null
- **THEN** the event group renders normally, is eligible for invoicing, and does not throw a rendering error

#### Scenario: Dashboard displays an outstanding invoice

- **WHEN** an event or event group has an invoice whose status is not paid
- **THEN** the Dashboard displays a link to the invoice and a payment action for that invoice

### Requirement: Administrators can mark Dashboard invoices as paid

The system SHALL allow an authenticated administrator to mark an outstanding invoice as paid from the Dashboard using the existing authenticated payment operation.

#### Scenario: Mark an outstanding invoice as paid

- **WHEN** the administrator activates the payment action for an outstanding Dashboard invoice and the payment operation succeeds
- **THEN** the system marks the invoice as paid and refreshes the Dashboard data so the invoice no longer appears as outstanding

#### Scenario: Payment operation fails

- **WHEN** the administrator activates the payment action and the payment operation fails or returns an error
- **THEN** the system keeps the invoice outstanding, stops the loading state, and presents a meaningful failure state without falsely showing the invoice as paid

#### Scenario: Payment action is already in progress

- **WHEN** the administrator activates a payment action while its payment operation is already in progress
- **THEN** the system prevents duplicate submissions for that invoice until the operation completes

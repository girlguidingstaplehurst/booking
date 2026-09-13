# admin-screen-alignment Specification

## Purpose

Provide administrators with a consistent, responsive workflow for managing events, event groups, invoices, and the Dashboard actions that connect those screens.

## Requirements

### Requirement: Dashboard-linked admin screens use a consistent presentation

The system SHALL present the Dashboard, event creation, event-group creation, event review, invoice creation, invoice management, and keyholder management screens using a consistent admin page structure, responsive spacing, page heading treatment, content grouping, and action hierarchy aligned with the Rates screens. The shared admin navigation SHALL provide responsive desktop and narrow-viewport behavior while exposing Dashboard, Rates, and Keyholders as its only navigation items. Event creation and event-group creation forms SHALL use consistent full-width green primary submit actions while retaining their distinct action labels.

#### Scenario: Administrator opens a Dashboard-linked screen on desktop

- **WHEN** an authenticated administrator opens any Dashboard-linked admin screen on a desktop viewport
- **THEN** the screen presents a consistent branded page header and content layout with primary actions placed predictably and content grouped into readable cards or sections
- **AND** the shared admin navigation displays Dashboard, Rates, and Keyholders as horizontal links with a clear current-route indication

#### Scenario: Administrator opens a Dashboard-linked screen on a narrow viewport

- **WHEN** an authenticated administrator opens any Dashboard-linked admin screen on a narrow viewport
- **THEN** headings, forms, cards, buttons, invoice tables, calendar content, and keyholder content remain usable without requiring horizontal page scrolling
- **AND** the shared admin navigation displays a menu control instead of requiring the horizontal links to fit

#### Scenario: Administrator opens the admin navigation drawer

- **WHEN** an authenticated administrator activates the admin navigation menu control on a narrow viewport
- **THEN** a right-side navigation drawer opens containing only Dashboard, Rates, and Keyholders
- **AND** each drawer link indicates whether its route is current

#### Scenario: Administrator navigates from the admin navigation drawer

- **WHEN** an authenticated administrator selects Dashboard, Rates, or Keyholders in the admin navigation drawer
- **THEN** the application navigates to the selected existing route
- **AND** the drawer closes after navigation

#### Scenario: Administrator hovers or activates an admin navigation link

- **WHEN** an authenticated administrator hovers over or navigates to an admin navigation link on the light-blue navigation bar
- **THEN** the link uses white for current-page emphasis and brand-colored hover treatment that remains readable against the light-blue background

#### Scenario: Administrator navigates between admin screens

- **WHEN** an authenticated administrator navigates from the Dashboard to an event, event-group, invoice, Rates, or keyholder screen
- **THEN** the shared admin navigation and page-level navigation preserve the existing routes and provide a consistent indication of the current context

#### Scenario: Administrator enters short event details

- **WHEN** an administrator enters non-empty Event Details content shorter than 50 characters in either creation form
- **THEN** the form accepts the content without a minimum-length validation error

#### Scenario: Administrator exceeds the event details maximum

- **WHEN** an administrator enters more than 50,000 characters in Event Details in either creation form
- **THEN** the form marks the field invalid and prevents submission

#### Scenario: Administrator leaves event details empty

- **WHEN** an administrator leaves Event Details empty in either creation form
- **THEN** the form marks the field required and prevents submission

#### Scenario: Administrator creates an individual event

- **WHEN** an administrator opens the individual event creation form
- **THEN** the Hiring Rate selector displays hourly-only rate definitions and excludes progressive per-session rate definitions

#### Scenario: Administrator creates an event group

- **WHEN** an administrator opens the event-group creation form
- **THEN** the Event Group Rate selector displays both hourly-only and progressive per-session rate definitions

#### Scenario: Administrator reviews an individual event

- **WHEN** an administrator opens the Hiring Rate selector while reviewing an individual event
- **THEN** the selector permits choosing hourly-only rate definitions and excludes progressive per-session rate definitions from new selections

#### Scenario: Existing individual event has a progressive rate

- **WHEN** an individual event being reviewed already has a progressive per-session rate assigned
- **THEN** the current rate remains visible as the selected option
- **AND** that current progressive rate option is disabled
- **AND** other progressive per-session rates cannot be selected

#### Scenario: Administrator submits the individual event creation form

- **WHEN** the individual event creation form is displayed
- **THEN** its primary action is a full-width green button labeled `Create Events`
- **AND** the existing vertical spacing after the action is retained

#### Scenario: Administrator submits the event-group creation form

- **WHEN** the event-group creation form is displayed
- **THEN** its primary action is a full-width green button labeled `Create Event Group`
- **AND** the existing vertical spacing after the action is retained

#### Scenario: Administrator creates an invoice

- **WHEN** an administrator opens the invoice creation screen
- **THEN** the `Send Invoice` action is green and spans the full width of its invoice card footer

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

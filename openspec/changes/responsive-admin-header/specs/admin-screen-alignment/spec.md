## MODIFIED Requirements

### Requirement: Dashboard-linked admin screens use a consistent presentation

The system SHALL present the Dashboard, event creation, event-group creation, event review, invoice creation, invoice management, and keyholder management screens using a consistent admin page structure, responsive spacing, page heading treatment, content grouping, and action hierarchy aligned with the Rates screens. The shared admin navigation SHALL provide responsive desktop and narrow-viewport behavior while exposing Dashboard, Rates, and Keyholders as its only navigation items. The admin header SHALL preserve its existing horizontal branded presentation on desktop viewports and SHALL present a centered, vertically ordered, overflow-safe branded presentation on narrow viewports. Event creation and event-group creation forms SHALL use consistent full-width green primary submit actions while retaining their distinct action labels.

#### Scenario: Administrator opens a Dashboard-linked screen on desktop

- **WHEN** an authenticated administrator opens any Dashboard-linked admin screen on a desktop viewport
- **THEN** the screen presents a consistent branded page header and content layout with primary actions placed predictably and content grouped into readable cards or sections
- **AND** the admin header retains the horizontal logo, account controls, and full `Booking Administration` heading presentation
- **AND** the shared admin navigation displays Dashboard, Rates, and Keyholders as horizontal links with a clear current-route indication

#### Scenario: Administrator opens a Dashboard-linked screen on a narrow viewport

- **WHEN** an authenticated administrator opens any Dashboard-linked admin screen on a narrow viewport
- **THEN** headings, forms, cards, buttons, invoice tables, calendar content, and keyholder content remain usable without requiring horizontal page scrolling
- **AND** the admin header centers the logo and places a compact `Admin` heading below it
- **AND** the administrator email and exit control appear below the heading in a readable vertical order
- **AND** the shared admin navigation displays a menu control instead of requiring the horizontal links to fit

#### Scenario: Administrator has a long email address on a narrow viewport

- **WHEN** an authenticated administrator with an email address longer than the available narrow-viewport header width opens a Dashboard-linked admin screen
- **THEN** the email text is reduced to a compact readable size
- **AND** the email wraps within the header without widening the page or causing horizontal scrolling
- **AND** the exit control remains available below or alongside the wrapped email without being clipped

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

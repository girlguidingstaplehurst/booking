## MODIFIED Requirements

### Requirement: Dashboard-linked admin screens use a consistent presentation

The system SHALL present the Dashboard, event creation, event-group creation, event review, invoice creation, invoice management, and keyholder management screens using a consistent admin page structure, responsive spacing, page heading treatment, content grouping, and action hierarchy aligned with the Rates screens. The shared admin navigation SHALL provide responsive desktop and narrow-viewport behavior while exposing Dashboard, Rates, and Keyholders as its only navigation items.

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

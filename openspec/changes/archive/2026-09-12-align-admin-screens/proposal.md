## Why

The admin screens reached from the Dashboard use an older, inconsistent layout language than the new Rates screens. This makes navigation and common actions harder to scan, and the Dashboard exposes invoice payment controls that currently do not perform an action.

## What Changes

- Align the Dashboard, event creation, event-group creation, event review, invoice creation, and invoice management screens with the Rates page structure and visual language.
- Establish a shared admin page header and consistent page spacing, responsive card layouts, form presentation, and primary/secondary action treatment.
- Preserve the existing workflows, routes, API contracts, event grouping, invoice display, and calendar behavior while refreshing their presentation.
- Make Dashboard invoice payment actions functional and refresh the affected data after a successful payment.
- Normalize optional invoice collections before rendering Dashboard event and event-group invoice content so incomplete responses do not cause rendering failures.
- Add focused frontend coverage for the new shared behavior and the repaired invoice action.

## Capabilities

### New Capabilities

- `admin-screen-alignment`: Provides a consistent, responsive presentation and reliable invoice actions across the Dashboard-linked administration screens.

### Modified Capabilities

<!-- No existing capability requirements change. The rate-definitions capability is only the visual reference for this work. -->

## Impact

- Affected frontend screens: `src/admin/Dashboard.js`, `CreateEvents.js`, `CreateEventGroup.js`, `ReviewEvent.js`, `CreateInvoice.js`, and `ManageInvoice.js`.
- Affected shared frontend components: `src/admin/components/PageHeader.js`, `AdminLayout.js`, and shared button/action components as needed.
- Affected frontend tests: new or updated tests covering screen structure, invoice payment behavior, and defensive invoice rendering.
- No API or database schema changes are expected.

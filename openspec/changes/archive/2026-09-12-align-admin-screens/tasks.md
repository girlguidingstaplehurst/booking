## 1. Shared Admin Presentation

- [x] 1.1 Extend `PageHeader` and shared admin layout/navigation patterns for Dashboard-linked pages, including responsive header action wrapping; verify the existing Rates screen and all admin routes still render with the same navigation.
- [x] 1.2 Align `Dashboard.js` with the Rates page shell, move primary create actions into the page header, and standardize section/card spacing and action hierarchy; verify Dashboard content and links remain available at desktop and narrow viewport widths.
- [x] 1.3 Align `CreateEvents.js` and `CreateEventGroup.js` with the shared page header, form grouping, responsive spacing, and action treatment; verify both forms preserve their current route, fields, validation, and submit destinations.
- [x] 1.4 Align `ReviewEvent.js`, `CreateInvoice.js`, and `ManageInvoice.js` with the shared page header and responsive card/content patterns; verify event details, invoice tables, invoice links, and existing actions remain accessible.
- [x] 1.4a Remove the redundant Review Event breadcrumb now that its `PageHeader` provides the page context; verify the review screen retains its page title, event details, and navigation actions.
- [x] 1.4b Remove the redundant Create Invoice breadcrumb now that its `PageHeader` provides the page context; verify invoice recipient cards and invoice actions remain accessible.
- [x] 1.4c Remove redundant breadcrumbs from the event creation and event-group creation screens now that their `PageHeader` components provide page context; verify both forms retain their fields and submit actions.
- [x] 1.5 Ensure Dashboard-linked cards, forms, invoice tables, and the calendar avoid horizontal overflow on narrow viewports; verify with the frontend production build and focused rendered-screen checks where available.

## 2. Dashboard Invoice Behavior

- [x] 2.1 Normalize absent or null event and event-group invoice collections before Dashboard filtering and rendering; verify events and groups without invoices render and remain eligible for invoice creation.
- [x] 2.2 Implement the Dashboard mark-paid action using the existing authenticated invoice endpoint, with per-invoice loading state, duplicate-submission prevention, success revalidation, and failure feedback; verify successful payment removes the invoice from outstanding work after refresh.
- [x] 2.3 Keep `ManageInvoice` mark-paid behavior consistent with the Dashboard payment flow without changing the existing API contract; verify paid and failed responses leave correct UI state.

## 3. Verification

- [x] 3.1 Add focused frontend tests for invoice normalization, outstanding-invoice rendering, successful Dashboard payment, failed payment feedback, and duplicate-submission prevention; verify they pass with `npm test -- --watchAll=false`.
- [x] 3.2 Run the complete frontend test suite and production build, then resolve any routing, Chakra rendering, or responsive layout regressions; verify with `npm test -- --watchAll=false` and `npm run build`.

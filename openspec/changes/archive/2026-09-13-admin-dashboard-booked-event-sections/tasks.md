## 1. API And Persistence

- [x] 1.1 Add an authenticated API contract for updating an individual event's start and end date/time, including success, not-found, invalid-range, and booking-conflict responses; verify the OpenAPI document describes the operation and request body.
- [x] 1.2 Implement the database date-update operation with transaction-safe validation, excluding the target session from its own conflict check and rejecting overlaps with other bookings; verify unit or integration tests cover valid moves and conflicts.
- [x] 1.3 Implement the REST handler and regenerate the generated Go REST, model, mock, and test-client files; verify `go generate ./...` completes and `go test ./...` passes.

## 2. Dashboard Sections

- [x] 2.1 Replace the Dashboard calendar data and rendering with normalized event-group and booked-event collections while preserving the existing approval, invoice, keyholder, payment, and review actions; verify the calendar is absent and the new sections render from representative loader data.
- [x] 2.2 Derive remaining group sessions and filter completed groups using an inclusive calendar-date comparison against the start of today; verify groups with sessions ending today remain visible and groups whose sessions all ended yesterday are hidden.
- [x] 2.3 Derive approved booked individual events not present in any workflow section, excluding events that ended before today; verify future events display normally and duplicate workflow cards are not created.
- [x] 2.4 Apply the existing purple header treatment only to individual booked events whose inclusive start/end dates contain today, while retaining the existing event-group color; verify single-day, multi-day, today-ending, and future-event styling cases.
- [x] 2.5 Add group-card review and new-invoice actions, reusing `/admin/create-invoice?eventGroup=<group-id>` for group invoice creation; verify both links contain the expected group ID and existing invoice preparation behavior remains intact.

## 3. Group Review And Session Navigation

- [x] 3.1 Add an authenticated `/admin/review-group/:groupID` route and loader that derives the group summary and associated sessions from the existing admin event response; verify valid, unknown, and no-remaining-session groups render explicit states without throwing.
- [x] 3.2 Build the group review page with group dates, invoice references, a new group invoice action, and chronologically sorted sessions ending today or later; verify completed sessions are omitted and remaining sessions link to `/admin/review/:eventID`.
- [x] 3.3 Add the individual review date/time move interaction and connect it to the authenticated update API, including loading, success refresh, validation, and conflict-error states; verify a successful move updates displayed dates and a conflict leaves the original dates unchanged.

## 4. Verification And Build

- [x] 4.1 Extend Dashboard and group-review frontend tests for normalization, date boundaries, workflow exclusion, group invoice navigation, session links, active purple styling, and failed date moves; verify `npm test -- --watchAll=false` passes.
- [x] 4.2 Run the required production frontend build and verify generated `build/` assets include the replacement Dashboard and group review route; run `npm run build`.
- [x] 4.3 Run the complete repository verification after generation and build; verify `go test ./...` and the focused frontend tests pass with no unrelated source changes.

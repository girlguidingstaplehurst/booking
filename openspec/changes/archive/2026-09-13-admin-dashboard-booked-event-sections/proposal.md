## Why

The admin Dashboard's month calendar duplicates events already surfaced in
approval, invoice, and keyholder workflow sections, while providing no direct
route for reviewing event groups. Replacing it with focused cards will expose
booked events that need no current workflow action, keep active-today events
visually prominent, and give administrators a clear path to inspect group
sessions and create a new group invoice.

## What Changes

- Replace the Dashboard's read-only event calendar with an event-group section
  and an individual booked-event card section.
- Show event groups while at least one group session ends today or later; retain
  the existing event-group card color.
- Provide a group review route showing the group summary, invoices, and
  remaining sessions, with links to each session's individual review route,
  where session dates can be moved when necessary.
- Allow administrators to create a new invoice for a group from the group card
  and group review page using the existing group invoice preparation flow.
- Show approved individual events not already present in the existing workflow
  sections when their event end date is today or later.
- Use the existing purple header color for individual booked-event cards active
  on today's date, where the date is inclusively between the event start and end
  dates; use the normal event color for other displayed booked events.
- Preserve the existing approval, invoice, keyholder, payment, event review,
  and responsive admin navigation behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `admin-screen-alignment`: Replace the redundant Dashboard calendar with
  actionable event-group and booked-event sections, including group
  review/session navigation and active-event visual treatment.

## Impact

- `src/admin/Dashboard.js` and its tests will change to derive the two new
  sections from the existing admin event and event-group payload.
- A new admin group review screen and route will be added, using existing event
  review and group invoice routes where possible.
- The OpenAPI contract and generated Go REST files will need a session-date
  update operation unless an existing equivalent is identified during
  implementation; group review data itself can be assembled from the existing
  admin event response.
- Existing group invoice creation at
  `/admin/create-invoice?eventGroup=<group-id>` will be reused; no separate
  invoice resend operation is planned.
- The production frontend build and frontend tests will require regeneration
  and verification according to repository workflow.

## Context

The Dashboard currently receives an authenticated `AdminEventList` containing
individual events and aggregate event groups. Individual events include
`eventGroupID`, invoice references, status, visibility, keyholders, and date
times. Event groups include their aggregate date range and invoices, but not
session IDs. The individual event records therefore remain the source for
group-session links. See `proposal.md` and the modified
`admin-screen-alignment` requirements for the user-visible contract.

## Goals / Non-Goals

**Goals:**

- Derive workflow exclusions, remaining group sessions, and booked-event cards
  consistently from the normalized Dashboard payload.
- Keep group-level review read-only while linking each remaining session to an
  individual review route that supports moving that session.
- Reuse the existing group invoice preparation flow for creating a new invoice.
- Preserve responsive admin card layouts and the existing authenticated route
  structure.

**Non-Goals:**

- No group metadata editing or group-level bulk session editing on the new
  group page; sessions are moved one at a time from their individual review
  pages.
- No invoice resend endpoint or special resend semantics.
- No changes to invoice calculation, invoice payment, or event approval; the
  individual event review page gains only the required session date/time move
  action.
- No change to the admin event API date horizon unless the existing payload
  proves insufficient during implementation.

## Decisions

### Derive sections from one normalized event set

Keep the existing Dashboard normalization and calculate the four workflow
collections first. Build the booked-event collection from approved individual
events that are not members of any of those collections and whose end date is
today or later. This prevents a card from appearing both in an action section
and the completed-work section.

The booked-event date filter compares calendar dates rather than the current
instant. An event ending at any time today is displayed. Its active styling is
separate: use the purple header when its start date is on or before today and
its end date is on or after today. Future events remain visible with the normal
event header color.

### Treat group activity as a session-level calculation

Associate individual events with their group using `eventGroupID`, then retain
an event group when at least one associated session has an end date today or
later. The group card remains in its existing color because a group can become
active repeatedly across multiple sessions. Session lists on the group review
page use the same end-date rule and are sorted chronologically.

This is preferred over using only the aggregate group `to` value because the
individual sessions provide the IDs required for navigation and make the
remaining-session behavior explicit.

### Add a group review route backed by existing data

Add an authenticated admin route and page for a group ID. Its loader should
obtain the existing admin event list, select the requested group, and collect
the associated individual events. This avoids a new API contract while the
existing 18-month admin response contains the group and its sessions.

The page presents the group summary, invoice references, and remaining
sessions. Each session links to `/admin/review/:eventID`. The individual review
screen must expose a date/time edit action backed by a new authenticated
session-date update operation, including booking-conflict protection. If no
remaining sessions exist, the page remains a valid review destination and
shows an empty state.

An invoice action navigates to
`/admin/create-invoice?eventGroup=<group-id>`. This intentionally creates a new
group invoice through the established preparation and send flow rather than
introducing a resend operation.

### Preserve the existing card action model

Individual booked-event cards retain the existing Review action. Group cards
use a group Review action and a new invoice action. Existing workflow cards
retain their current invoice payment and invoice creation actions. The calendar
dependency and rendering are removed from the Dashboard once the card sections
are in place.

## Risks / Trade-offs

- [Risk] The admin event endpoint's 18-month horizon may omit sessions outside
  that range. -> Mitigation: preserve the current endpoint behavior for this
  change and verify the Dashboard's expected horizon; introduce an explicit
  group-detail endpoint only if requirements demand sessions beyond it.
- [Risk] Date-only comparisons can differ from timestamps around timezone
  boundaries. -> Mitigation: normalize both event timestamps and the current
  date using the application's existing dayjs/local timezone conventions before
  comparing calendar dates.
- [Risk] Reusing the aggregate group object without session records could make
  a group review page incomplete. -> Mitigation: derive sessions from
  individual events and test grouped, ungrouped, completed, and remaining
  session cases.
- [Risk] A new group review route can expose an unknown or no-longer-returned
  group ID. -> Mitigation: render an explicit not-found or empty state instead
  of throwing, and keep the route behind the existing admin authentication.
- [Risk] Moving an already invoiced or partially completed session can affect
  invoice descriptions and operational commitments. -> Mitigation: keep the
  change limited to date/time movement, require explicit per-session
  submission, and preserve existing invoice associations; confirm any
  business-specific invoice policy during implementation.

## Migration Plan

1. Add the Dashboard derivation and group review route/page behind the existing
   admin application.
2. Add focused Dashboard and group review tests, then run the frontend suite.
3. Run `npm run build` to regenerate the production frontend assets.
4. If the existing API payload is sufficient, deploy without a database or API
   migration. Rollback consists of restoring the previous frontend build and
   Dashboard route behavior.

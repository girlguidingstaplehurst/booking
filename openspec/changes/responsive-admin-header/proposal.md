## Why

The admin header is difficult to scan and use on a mobile viewport because its logo, long account email, exit link, and full `Booking Administration` heading compete in a horizontal layout. A mobile-specific header hierarchy will preserve the desktop presentation while making the authenticated admin context readable without horizontal scrolling.

## What Changes

- Change the narrow-viewport admin header to a centered vertical arrangement.
- Display the existing logo above a compact `Admin` heading on narrow viewports.
- Reduce mobile logo and account text sizing so common mobile widths remain readable.
- Allow long administrator email addresses to wrap within the header rather than widening the page.
- Place the exit link below the email on narrow viewports while preserving the existing exit destination.
- Preserve the existing desktop header layout, branding colors, authentication data, and navigation bar.
- Add focused responsive header coverage for text content, long-email wrapping behavior, and desktop/mobile presentation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `admin-screen-alignment`: Require the shared admin header to present a centered, vertically ordered, overflow-safe layout on narrow viewports while retaining the existing desktop branded header.

## Impact

- Affects `src/admin/components/AdminHeader.js` and focused frontend tests for that component.
- Reuses the existing Chakra UI responsive style props and theme breakpoints; no new dependencies are required.
- Updates the `admin-screen-alignment` OpenSpec delta only; no API, route, authentication, database, or generated-file changes are expected.

## Why

Successful public bookings currently return users to the home page without a dedicated confirmation message. A CMS-managed thank-you page provides a clear completion experience while keeping the main confirmation wording editable by content editors, and the React-owned return link protects the navigation affordance from accidental CMS changes.

## What Changes

- Add a `/thank-you` public route that displays the Contentful `thank-you` managed page.
- Redirect users to `/thank-you` after a successful public booking submission.
- Render a React-owned link from the thank-you page back to `/`.
- Configure the Go service to serve the SPA entry point for direct visits and refreshes of `/thank-you`.
- Extend the Playwright public-booking flow to verify the thank-you destination and return link while continuing to verify persistence.

## Capabilities

### New Capabilities

- `public-booking-confirmation`: Provide a CMS-backed confirmation page after successful public booking submissions, with a protected return-to-home navigation link.

### Modified Capabilities

- `acceptance-testing`: Require the public booking acceptance workflow to verify the post-submit thank-you page and its return link.

## Impact

- Frontend route configuration and public booking submission behavior in `src/index.js` and `src/AddEvent.js`.
- The React managed-content page composition, likely via a small dedicated confirmation page component.
- Fiber SPA fallback routing in `internal/service/service.go`.
- The browser acceptance test in `e2e/public-booking.spec.js`.
- Contentful remains the source for the `thank-you` page content; no API or database schema changes are expected.

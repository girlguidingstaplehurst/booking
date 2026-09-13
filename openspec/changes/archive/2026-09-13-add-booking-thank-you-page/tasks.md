## 1. Frontend Confirmation Route

- [x] 1.1 Add a React confirmation page composition that renders `ManagedContent` with the Contentful entry name `thank-you` and a visible React Router link to `/`; verify the component renders the application-owned link independently of CMS content.
- [x] 1.2 Register the confirmation page at `/thank-you` in the public React route tree; verify the route renders through client-side navigation and direct route resolution.
- [x] 1.3 Change successful `AddEvent` submission handling to navigate to `/thank-you` while preserving the existing error path; verify failed responses remain on the booking form and successful responses reach the confirmation route.

## 2. Service Routing

- [x] 2.1 Add `/thank-you` to the Fiber `htmlPaths` SPA fallback allowlist; verify a direct request or browser refresh for `/thank-you` serves the embedded React application instead of a not-found response.

## 3. Acceptance Coverage

- [x] 3.1 Extend `e2e/public-booking.spec.js` to assert that a successful public booking navigates to `/thank-you` and exposes a return link targeting `/`; verify the existing PostgreSQL persistence assertion remains passing.
- [x] 3.2 Publish or verify the Contentful `thank-you` `klgcPage` entry in the target environment; verify the rendered confirmation page displays its managed content without making the React-owned return link dependent on CMS copy.

## 4. Verification

- [x] 4.1 Run the focused frontend tests and production build; verify the new route and confirmation page compile successfully and the generated frontend is updated as required by the repository workflow.
- [x] 4.2 Run the relevant Go tests and the public booking Playwright flow against the configured E2E environment; verify the success redirect, return link, direct-route behavior, and persisted booking outcome.

## Why

Opening `/admin` without a session currently starts a protected route loader before the `RequireAuth` component can redirect the browser. The resulting `401` clears storage and reloads the same URL, creating a refresh loop instead of taking the user to login. Invalid or expired tokens use the same reload-based recovery and can produce browser-dependent repeated refreshes.

## What Changes

- Guard the complete `/admin` route subtree before any protected child loader runs.
- Redirect users with no stored token to `/login`.
- Treat a rejected, expired, or otherwise invalid token as an unauthorised session and redirect to `/login` without reloading the current admin URL.
- Preserve normal authenticated admin navigation and API behavior.
- Add automated coverage for direct access to admin URLs, missing sessions, and invalid-token API responses.

## Capabilities

### New Capabilities

- `admin-authentication`: Defines browser behavior for entering and leaving authenticated admin routes.

### Modified Capabilities

<!-- No existing capability describes production admin browser authentication behavior. -->

## Impact

- React Router admin route configuration and authentication guard components.
- Frontend authenticated request helpers used by admin data loaders and mutations.
- Frontend unit/integration tests and browser acceptance coverage.
- No public API contract or server authentication policy change is required; the existing `401 Unauthorized` response remains authoritative for rejected tokens.

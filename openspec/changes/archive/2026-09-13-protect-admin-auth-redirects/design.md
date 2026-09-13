## Context

The `/admin` route currently places `RequireAuth` around the rendered outlet, but React Router executes the matched child route loader before that component can redirect. Admin request helpers also respond to `401` by deleting the token and calling `window.location.reload()`, which retries the same protected URL. See `proposal.md` and `specs/admin-authentication/spec.md` for the required behavior.

## Goals / Non-Goals

**Goals:**

- Establish one authentication gate for the complete `/admin` route subtree.
- Prevent protected child loaders from running when no token exists.
- Convert rejected-session recovery from reload-and-retry to a single redirect to `/login`.
- Keep the server as the authority for token validity.
- Cover both route entry and request-level rejection with tests.

**Non-Goals:**

- Changing Google OAuth configuration or server-side token validation.
- Introducing a new session or refresh-token mechanism.
- Changing the public API contract or replacing the existing `401` response.
- Persisting authentication across browser tabs or changing session-storage duration.

## Decisions

### Use layered route authentication checks

Add an authentication check to the `/admin` route itself so navigation without a token redirects to `/login`. React Router executes matched loaders in parallel, so this parent loader cannot by itself prevent a child loader from starting. Wrap each protected admin child loader with the same check; the wrapper returns the login redirect before invoking the protected data loader when no token is present.

This layered approach is preferred over relying only on `RequireAuth`, because an element guard cannot prevent a matched loader from making a protected request. The existing `RequireAuth` can remain as a defensive rendering guard, but it is no longer the primary protection for route data loading.

### Keep server validation authoritative

The route-entry check only determines whether a token is available. It must not treat locally decoded claims as proof that the token is valid. If the server rejects the token, the request layer clears storage and navigates to `/login`.

Client-side JWT parsing may be hardened separately if needed, but expiry or claim parsing is not required to satisfy this change because the server response remains authoritative.

### Redirect instead of reload on `401`

Centralise unauthorised handling in the shared authenticated request helpers used by both loaders and mutations. On `401`, remove the token and navigate to `/login` using a redirect/navigation operation rather than `window.location.reload()`. The redirect target is outside the `/admin` subtree, so it cannot immediately trigger protected loaders.

This is preferred over returning fallback data from an unauthorised loader, because fallback data can make an unauthorised page appear valid and leaves each caller to handle the authentication failure independently.

### Test the boundary at both levels

Add route-level tests proving that missing-token navigation to the dashboard and nested admin URLs redirects before protected loaders run. Add request-helper tests proving that a `401` clears the token and navigates to `/login` without invoking a reload. Retain existing valid-token tests to ensure authenticated navigation is unchanged.

## Risks / Trade-offs

- [Risk] A `401` from an admin mutation may occur after a user action and lose the in-progress action. -> Mitigation: redirect consistently to login, which is safer than retrying an operation with an invalid credential; cover mutation handling in tests.
- [Risk] A request can receive `401` while another request is already redirecting. -> Mitigation: make unauthorised navigation idempotent or guard it so multiple failures do not create competing navigations.
- [Risk] Direct browser refreshes on nested admin URLs may still depend on the server's HTML fallback routes. -> Mitigation: keep this change limited to client authentication and track missing fallback paths separately unless testing shows they block the required scenarios.

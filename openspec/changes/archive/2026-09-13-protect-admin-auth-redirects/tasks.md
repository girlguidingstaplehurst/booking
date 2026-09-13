## 1. Protect Admin Route Entry

- [x] 1.1 Add parent and child-loader authentication checks to the `/admin` route subtree, accounting for React Router's parallel loader execution, and verify protected child loaders are not called in missing-token route tests
- [x] 1.2 Retain the rendered `RequireAuth` fallback and reconcile it with the route-level guard, then verify valid-token navigation continues to render the requested admin page

## 2. Handle Rejected Sessions

- [x] 2.1 Replace reload-based `401` handling in the shared authenticated fetch helper with token clearing and a single redirect to `/login`, and verify `window.location.reload` is not invoked
- [x] 2.2 Apply the same rejected-session behavior to authenticated POST and PUT requests, and verify a mutation receiving `401` does not retry the admin URL
- [x] 2.3 Make unauthorised navigation safe when multiple requests fail together, and verify the login route remains stable after redirect

## 3. Test Authentication Boundaries

- [x] 3.1 Add route tests for `/admin` with no token and for representative nested `/admin/...` URLs, verifying redirect location and absence of protected loader requests
- [x] 3.2 Add request-helper tests for invalid or expired-token `401` responses, verifying storage is cleared and login navigation occurs without a page reload
- [x] 3.3 Run the frontend test suite with `npm test -- --watchAll=false` and verify the new and existing admin tests pass
- [x] 3.4 Run `npm run build` and verify the production frontend build completes successfully

## Why

The project has unit tests and direct API integration tests, but no repeatable way to verify the application from the browser through the REST service and PostgreSQL. Google sign-in is unsuitable for unattended headless-browser tests, so the local test environment needs a deliberately scoped authentication path that preserves the browser/API bearer-token contract without automating Google.

## What Changes

- Add a Playwright-based acceptance-test suite that runs against an already-running service at `localhost:8080`.
- Cover representative public and admin workflows through the rendered web application and assert their persisted PostgreSQL results.
- Add an explicit, fail-closed local E2E authentication mode using a configured test credential and deterministic test identity.
- Add a distinct Skaffold/Kubernetes E2E configuration so normal local development continues to use Google authentication.
- Treat PostgreSQL lifecycle as an environment concern: the suite assumes a newly launched ephemeral database and does not truncate or reset tables itself.
- Add readiness and environment validation so the suite fails clearly when the service, database-backed API, or E2E authentication mode is unavailable.
- Keep external side effects such as CAPTCHA and email delivery safe for acceptance runs.

## Capabilities

### New Capabilities

- `acceptance-testing`: Browser-driven acceptance tests that exercise the application through the service and verify durable database behavior in a disposable E2E environment.
- `local-e2e-authentication`: Explicit local-only authentication behavior for unattended acceptance tests, without changing production Google authentication.

### Modified Capabilities

- None.

## Impact

- Go service authentication setup and configuration.
- Local Kubernetes/Skaffold deployment configuration.
- New Playwright test code, browser tooling, and npm scripts.
- PostgreSQL-backed acceptance-test assertions and test environment documentation.
- CI or developer commands that prepare the ephemeral E2E environment; the test command itself will consume, not own, that environment.

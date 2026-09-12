## 1. Local E2E Authentication

- [x] 1.1 Add explicit authentication-mode configuration with Google as the default, fail-closed handling for unknown modes, and startup validation for a missing E2E credential; verify normal service configuration still selects Google authentication and invalid E2E configuration fails startup.
- [x] 1.2 Implement the E2E bearer-credential path with exact configured-token matching and a deterministic test identity while preserving the existing admin middleware boundary; verify accepted, wrong, missing, and malformed credentials with focused Go tests.
- [x] 1.3 Define a JWT-shaped E2E test credential contract containing the claims needed by the frontend and document that the credential is supplied through the environment rather than committed; verify the browser authentication setup can decode the configured credential.

## 2. E2E Environment

- [x] 2.1 Add a distinct Skaffold profile or Kubernetes overlay for E2E authentication configuration without enabling the bypass in the ordinary local deployment; verify rendered manifests contain E2E mode only for the E2E configuration.
- [x] 2.2 Configure the E2E environment to use ephemeral PostgreSQL, disabled CAPTCHA, and non-delivering or excluded email-producing workflows; verify the service starts and migrations complete against the E2E database.
- [x] 2.3 Define the environment variables and startup contract shared by the service and Playwright, including the test credential and database connection; verify a missing required value produces a clear startup or preflight failure.

## 3. Playwright Harness

- [x] 3.1 Add Playwright dependencies, configuration, and an npm acceptance-test command that targets `localhost:8080` without starting or stopping Skaffold; verify the command fails clearly when the service is unavailable.
- [x] 3.2 Add preflight checks for service reachability, database-backed readiness, E2E authentication configuration, and the configured JWT-shaped credential; verify checks complete before any browser workflow starts.
- [x] 3.3 Create authenticated browser-context setup that injects the E2E credential into `sessionStorage["token"]` before navigation; verify `/admin` loads without Google interaction and admin requests carry the bearer credential.
- [x] 3.4 Configure failure screenshots, traces, and useful report output while leaving the externally managed environment running after failures; verify diagnostics are produced for an intentional browser assertion failure.
- [x] 3.5 Add a PostgreSQL assertion helper that connects to the service database using the E2E connection configuration and performs read-only business-state checks; verify it does not truncate tables or reset application data.

## 4. Acceptance Workflows

- [x] 4.1 Add a public booking journey that submits valid page data with CAPTCHA disabled and asserts both success UI and persisted booking/contact state; verify it passes against a fresh E2E environment.
- [x] 4.2 Add an authenticated rates journey covering create, list, and update through the admin pages and asserting the resulting rate state in PostgreSQL; verify it passes using only browser actions for mutations.
- [x] 4.3 Add an authenticated keyholder journey covering create and active-state update through the admin pages and asserting PostgreSQL state; verify it passes without direct API calls replacing UI actions.
- [x] 4.4 Add an authenticated event or event-group journey covering the supported non-email path and asserting event, contact, rate, and keyholder persistence; verify it passes against the migrated E2E schema.
- [x] 4.5 Exclude or defer invoice and approval journeys until email and content dependencies have a non-delivering test path; verify the initial suite cannot send real messages.

## 5. Verification and Documentation

- [x] 5.1 Document how to launch the fresh Skaffold E2E environment, provide the shared credential, run the acceptance command, and inspect failures; verify the documented commands match the checked-in configuration.
- [x] 5.2 Run the existing Go and frontend unit suites alongside the acceptance suite and fix regressions caused by the authentication/configuration changes; verify `go test ./...` and the relevant npm test command pass.
- [x] 5.3 Run the full browser suite against a freshly recreated ephemeral environment and verify all browser, API, and PostgreSQL assertions pass without test-owned teardown.

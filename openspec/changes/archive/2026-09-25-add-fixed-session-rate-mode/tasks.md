## 1. Data model and API contract

- [x] 1.1 Add a reversible PostgreSQL migration for nullable `booking_rates.session_price`, preserving existing hourly and progressive rate data; verify the migration applies and rolls back against the project database schema.
- [x] 1.2 Extend `api/public-api.yaml` with an explicit rate pricing-mode representation and fixed-session price fields, including mode-specific validation and compatibility for existing hourly/progressive rates; verify the contract passes OpenAPI validation.
- [x] 1.3 Run `go generate ./...` to regenerate REST models, handlers, clients, mocks, and related generated artifacts; verify generated code is cleanly formatted and compiles.

## 2. Backend rate handling

- [x] 2.1 Add server-side validation that accepts exactly one valid pricing mode and rejects missing, negative, or conflicting mode-specific values; verify hourly, fixed-session, progressive, and invalid payload unit tests.
- [x] 2.2 Update PostgreSQL rate reads, creates, and updates to persist and return the explicit mode and fixed session price while preserving existing identifiers and references; verify database-backed rate CRUD tests.
- [x] 2.3 Update invoice preparation/calculation inputs and logic so a fixed-session rate charges one session price per standalone event and per group session, without changing hourly or progressive results; verify focused calculation tests for zero/positive durations and multiple group sessions.
- [x] 2.4 Extend authenticated REST and integration coverage for creating, listing, and updating fixed-session rates and for rejecting invalid mode combinations; verify `go test ./internal/rest/...` and the relevant integration test when its service/database prerequisites are available.

## 3. Admin frontend

- [x] 3.1 Add fixed-session mode controls and session-price field validation to the rate editor, including edit/reinitialize behavior and disabled Save state for invalid values; verify focused React tests for rendering, validation, and request payloads.
- [x] 3.2 Update rate summaries and rate-selection display to identify fixed-session prices as per-session amounts while keeping existing hourly/progressive filtering and selection behavior; verify `Rates.test.js` and `RateSelect.test.js`.
- [x] 3.3 Update frontend invoice calculation fixtures and tests for fixed-session event and group charges; verify the invoice calculation test suite passes without regressions.
- [x] 3.4 Add or update end-to-end coverage for creating and editing a fixed-session rate and using it in a billable workflow; verify the targeted Playwright test against the configured E2E environment.

## 4. Verification and delivery

- [x] 4.1 Run formatting, generated-code checks, Go unit tests, and frontend tests; verify `go test ./...` and `npm test -- --watchAll=false` pass or document environment-specific prerequisites.
- [x] 4.2 Run `npm run build` to refresh the embedded production frontend and verify the production build succeeds.
- [x] 4.3 Review the migration, API compatibility behavior, generated diffs, and fixed-session invoice examples; verify `openspec validate add-fixed-session-rate-mode --type change --strict` passes.

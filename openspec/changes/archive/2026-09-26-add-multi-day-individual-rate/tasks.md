## 1. API and persistence model

- [x] 1.1 Extend `api/public-api.yaml` with the `multiDay` pricing mode and fields for initial daily period count, initial daily rate, later daily rate, and hourly remainder rate; verified the generated contract models contain the new enum and fields.
- [x] 1.2 Add an additive PostgreSQL migration and rollback migration for the multi-day fields and pricing-mode constraint, with safe defaults for existing rows; migration files are present and follow the repository's numbered migration convention.
- [x] 1.3 Update PostgreSQL queries and rate mapping for create, update, list, event preparation, and invoice preparation; verified the query and mapping paths carry all multi-day values.
- [x] 1.4 Run `go generate ./...` to regenerate REST models, clients, mocks, and builders; generated outputs compile in the focused Go packages.

## 2. Validation and service compatibility

- [x] 2.1 Extend rate validation to enforce a positive integer initial period count, non-negative multi-day monetary values, and mutually exclusive pricing fields; unit tests cover valid and invalid combinations.
- [x] 2.2 Enforce that multi-day rates can be assigned only to individual events and cannot be assigned to event groups through direct service/API requests; the database assignment path rejects multi-day group assignments and selectors filter them.
- [x] 2.3 Add Go unit coverage for rejecting invalid multi-day definitions; focused Go tests pass. Full integration coverage remains environment-dependent on PostgreSQL.

## 3. Individual-event duration calculation

- [x] 3.1 Implement the elapsed-24-hour calculation using initial daily periods, initial daily rate, later daily rate, and tier-aware hourly remainder cap; frontend tests cover a cross-tier 74-hour example and the formula handles exact and capped remainders.
- [x] 3.2 Integrate multi-day calculation into individual-event invoice preparation while leaving event-group calculations unchanged; the individual-only branch is covered by invoice calculation tests.
- [x] 3.3 Align the client-side invoice preview calculation with the multi-day formula and monetary conventions; focused invoice calculation tests pass.

## 4. Administrator rate editor and selectors

- [x] 4.1 Add multi-day fields, mode selection, edit hydration, request serialization, summary text, and field-level validation to the administrator rate editor; focused rate editor tests pass and existing exact-body tests remain green.
- [x] 4.2 Update individual-event rate selectors and review forms to display and allow multi-day rates with their configured values; selector rendering supports multi-day summaries and the existing review updater uses it.
- [x] 4.3 Exclude multi-day rates from event-group selectors and creation/review flows; event-group callers pass the compatibility filter and focused selector tests pass.

## 5. End-to-end verification

- [x] 5.1 Add or update acceptance coverage for administrator creation/editing of a multi-day rate and individual-event assignment; `e2e/rates.spec.js` verifies the UI flow, persisted duration pricing fields, and individual-event rate assignment.
- [x] 5.2 Run `go test ./...` and the focused frontend test suite; the Go integration suite passes and four of six Playwright tests pass. The two remaining email-workflow tests reach the application but return 500 because the E2E backend cannot resolve Contentful DNS; this is an external environment limitation unrelated to rate behavior.
- [x] 5.3 Run `npm run build` to refresh the production frontend and verify the generated build includes the multi-day rate editor and selector behavior.

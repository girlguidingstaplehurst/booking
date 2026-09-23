## 1. API Contract and Generated Code

- [x] 1.1 Add an authenticated event-group title-search operation and response schema to `api/public-api.yaml`, including a bounded query/result contract, and verify the OpenAPI document validates.
- [x] 1.2 Add an authenticated event-group duplication operation and request schema to `api/public-api.yaml`, including source group ID, editable rate/keyholder, and instances, and verify the contract documents validation/conflict responses.
- [x] 1.3 Run `go generate ./...` and verify generated REST models, interfaces, mocks, and test clients include both operations without manual edits to generated files.

## 2. Backend Search and Duplication

- [x] 2.1 Implement a PostgreSQL historical event-group title search that performs case-insensitive partial matching, groups sessions by group, orders by latest session end descending, returns card data, and enforces a result limit; verify unit/database tests cover current, completed, case-varied, and newest-first matches.
- [x] 2.2 Implement a server-authoritative duplication transaction that loads immutable source setup, accepts only rate/keyholder/instances as overrides, validates source existence, active keyholder, valid rate, instances, and booking conflicts, and rolls back on failure; verify tests cover successful creation and every rejected validation path.
- [x] 2.3 Add REST handlers that require existing administrator authentication, map search/duplication validation and conflict failures to the documented error format/statuses, and do not expose or accept immutable setup overrides; verify handler tests cover authenticated success and failure responses.
- [x] 2.4 Add integration coverage proving duplicated groups copy setup but not invoices or source event IDs and that failed duplication creates no partial destination records; verify with the generated test client and database assertions.

## 3. Frontend Search and Navigation

- [x] 3.1 Add an authenticated Dashboard Event Group Search widget below existing sections with a controlled title input, no request below three characters, debounced live requests, loading/no-results states, and stale-response protection; verify frontend tests cover threshold, typing, debounce, clearing, and empty results.
- [x] 3.2 Render search results with the existing event-group card presentation, descending server-provided date order, and Review links to `/admin/review-group/:groupID`; verify frontend tests cover completed groups, card content, ordering, and navigation.
- [x] 3.3 Add the Duplicate Event Group action to group review and register the authenticated `/admin/duplicate-event-group/:groupID` route with a refresh-safe loader; verify review and routing tests cover the link and source-group loading.

## 4. Duplicate Form

- [x] 4.1 Implement the duplicate form with copied non-editable name, details, visibility, and contact, editable rate/keyholder selectors, empty dates, and retained editable source time values; verify rendered tests confirm only the specified fields are editable and no source dates are copied.
- [x] 4.2 Preserve invalid inherited rate and keyholder options in their selectors while displaying validation errors and valid replacement options; verify tests cover inactive/missing inherited values, correction, and blocked submission.
- [x] 4.3 Submit duplication requests with only source ID, selected editable references, and new instances, handle API validation/conflict errors, prevent duplicate submissions, and navigate to the Dashboard after success; verify tests cover payload shape, errors, loading, and successful navigation.

## 5. Verification and Documentation

- [x] 5.1 Update relevant frontend and backend tests for search, group review duplication navigation, duplicate form behavior, API validation, transactionality, and generated clients; verify `npm test -- --watchAll=false` and targeted Go tests pass.
- [x] 5.2 Run `go test ./...` and verify all backend packages, generated mocks, and integration-compatible tests compile and pass in the configured environment; run `mage e2ETest` and verify all end-to-end tests pass.
- [x] 5.3 Run `openspec validate --change "search-and-duplicate-event-groups" --strict` and verify all planning artifacts and requirement scenarios validate before implementation is considered complete.

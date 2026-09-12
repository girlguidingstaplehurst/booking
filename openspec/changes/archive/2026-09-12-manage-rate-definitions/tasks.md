## 1. API Contract and Data Model

- [x] 1.1 Define typed per-session tier schemas and create/update rate request/response operations in `api/public-api.yaml`, including authentication, validation constraints, and 404/409/422 error responses; verify the contract parses successfully.
- [x] 1.2 Add a migration that changes the `per_session` empty default and existing empty values from `{}` to `[]` without changing non-empty rate definitions; verify the migration applies and rolls back against the supported PostgreSQL schema.
- [x] 1.3 Run `go generate ./...` to regenerate REST models, handlers, mocks, and test clients from the API contract; verify generated output is clean and `go test ./...` compiles.

## 2. Backend Rate Management

- [x] 2.1 Add validated PostgreSQL methods for creating and updating rate definitions while preserving immutable identifiers and existing foreign-key references; verify unit or database tests cover hourly-only, progressive, duplicate, and missing-rate cases.
- [x] 2.2 Implement authenticated REST handlers for rate creation and update with meaningful validation, conflict, not-found, and server-error responses; verify handler tests cover rejected malformed tier arrays and successful responses.
- [x] 2.3 Ensure rate reads consistently return `perSession: []` for rates without per-session pricing and reject or clearly report unsupported legacy shapes; verify list and edit API tests cover both empty and populated definitions.

## 3. Admin Rate Screens

- [x] 3.1 Add an authenticated admin rates route and navigation entry that loads the existing rate list; verify an administrator can navigate from the dashboard and see descriptions, hourly prices, and per-session availability.
- [x] 3.2 Build the create rate form with immutable identifier, description, hourly price, optional per-session toggle, first-tier count/fixed price, and additional-session price fields using existing Formik, Yup, Chakra UI, and admin request patterns; verify client-side validation and successful navigation after creation.
- [x] 3.3 Build the edit rate form with the identifier read-only and existing rate values populated, including empty and progressive per-session states; verify successful updates and meaningful API errors are displayed without losing form state.
- [x] 3.4 Keep `RateSelect` and existing event/event-group screens compatible with the updated rate response shape; verify existing frontend tests and rate-selection behavior still pass.

## 4. Verification

- [x] 4.1 Add or update frontend tests for rate list, create, edit, hourly-only, progressive per-session, and validation states; verify with `npm test -- --watchAll=false`.
- [x] 4.2 Run `go test ./...` and the relevant integration/client tests with the configured database and service; verify rate definitions can be created, listed, edited in place, and remain assignable by their original identifiers.
- [x] 4.3 Run the repository generation/build checks, including `go generate ./...` and `npm run build`, and verify no generated files or production build artifacts are stale.

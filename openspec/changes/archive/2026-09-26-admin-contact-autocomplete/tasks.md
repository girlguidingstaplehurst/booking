## 1. API Contract and Backend

- [x] 1.1 Add the authenticated `GET /api/v1/admin/contacts` operation and contact-list response schema to `api/public-api.yaml`, then verify the contract describes name/email output and unauthorized/error responses
- [x] 1.2 Add the database and REST service interfaces for listing contacts, implement the PostgreSQL query against `booking_contacts`, and verify backend package tests cover returned name/email records and query errors
- [x] 1.3 Implement the authenticated REST handler and regenerate OpenAPI server, model, mock, and client artifacts; verify `go generate ./...` completes successfully
- [x] 1.4 Add endpoint authorization coverage proving unauthenticated requests receive an authorization failure and no contact data

## 2. Frontend Contact Control

- [x] 2.1 Add an authenticated contacts fetch helper and reusable admin contact autocomplete component that loads contacts once and handles an empty or malformed response without disabling manual entry; verify component tests cover loading and fetch-failure behavior
- [x] 2.2 Implement case-insensitive client-side name filtering, suggestion rendering, keyboard/click selection, and email-based option identity; verify tests cover matching, no matches, duplicate names, and selection
- [x] 2.3 Integrate the autocomplete with the existing Formik name/email values in `CreateEvents` and `CreateEventGroup`; verify selecting an existing contact populates both fields while editing remains possible

## 3. Form and Regression Coverage

- [x] 3.1 Add form tests covering new-contact manual entry, selected-contact submission, and edited email values for both creation forms; verify existing validation and submission payload expectations remain intact
- [x] 3.2 Run the focused frontend tests and `go test ./...`, then verify the complete change has no regressions in admin event or event-group creation

## 1. Contract And Data Model

- [x] 1.1 Update `api/public-api.yaml` with an explicit invoice-preparation response carrying mode, contact identity, event/group context, session metadata, hourly rate data, discount data, and per-session tiers; verify the contract describes individual contact grouping and group ownership.
- [x] 1.2 Update invoice-preparation database queries to join contact and the event group’s single assigned rate, preserve event identifiers, and return the rate’s hourly and per-session pricing; verify query tests cover individual and group records.
- [x] 1.3 Regenerate REST models, handlers, mocks, and test clients with `go generate ./...`; verify generated output compiles and no generated files are hand-edited.

## 2. Invoice Preparation API

- [x] 2.1 Replace the email-keyed invoice preparation mapping with explicit individual and group preparation cards while preserving one card per contact for individual events; verify API tests cover multiple events for one contact and group sessions.
- [x] 2.2 Add an invoice-event association migration, backfill existing single-event ownership, and persist every submitted individual event ID while retaining event-group ownership; verify submission tests confirm one invoice retains all expected event associations and items.
- [x] 2.3 Replace `standard_rate` and `per_session_rate` with one `rate` foreign key through a database migration, migrate existing groups from their standard rate, update event-group creation to persist the single selection, and verify the migration and creation request.

## 3. Calculation And Admin UI

- [x] 3.1 Add a focused invoice calculation layer for individual event hire, duration discounts, and one-time cleaning deposits; verify unit tests cover the default-off checkbox, one deposit for multiple events, and event-specific rates.
- [x] 3.2 Add hourly group-session calculation with date/time descriptions and assigned-rate duration pricing; verify tests cover one line per session and applicable discounts.
- [x] 3.3 Add progressive group calculation using a fixed first-tier line and an additional-session line only when the session count exceeds the tier count; verify tests cover exact-boundary and above-boundary counts and omit zero additional charges.
- [x] 3.4 Rework the create-invoice screen and editable invoice card to show contact/event/group context, mode-specific lines, pricing explanations, editable values, and the cleaning-deposit checkbox; verify focused frontend tests cover both modes and responsive rendering.
- [x] 3.5 Submit the redesigned preparation values through the existing authenticated invoice-send flow without discarding administrator edits; verify the UI test confirms edited descriptions and costs reach the request body.

## 4. Verification And Compatibility

- [x] 4.1 Add or update backend tests for preparation response shape, contact/group joins, rate branches, and invoice association validation; verify with `go test ./...`.
- [x] 4.2 Add or update frontend tests for combined individual invoices, hourly group sessions, progressive tiers, deposit behavior, and line editing; verify with `npm test -- --watchAll=false`.
- [x] 4.3 Run the production generation/build workflow and verify `go generate ./...` and `npm run build` complete successfully with the generated contract and UI changes.
- [x] 4.4 Verify existing invoices remain retrievable and sendable after both migrations, including backfilled event associations; document the migration rollback boundary using a pre-change invoice fixture or integration test.

## 1. Admin API Contract

- [x] 1.1 Add the authenticated event-note create operation and note request/response schemas to `api/public-api.yaml`, and expose notes only on the admin event-detail response; run `go generate ./...` and verify generated API, model, mock, and client artifacts are updated from the contract.

## 2. Note Persistence

- [x] 2.1 Add an additive PostgreSQL migration for event notes with event ownership, content, author email, server-generated submission time, and an event/time ordering index; verify both up and down migrations are valid and document that down removes note data.
- [x] 2.2 Implement note creation and ordered retrieval in the PostgreSQL layer, including event existence and non-empty plain-text validation; verify unit/database tests cover persistence, event association, and newest-first ordering.

## 3. Authenticated REST Behavior

- [x] 3.1 Implement note creation and include notes in individual event detail responses, deriving author email from authenticated request context and submission time from persistence; verify REST tests cover metadata trust, unauthorized access, missing events, invalid content, and notes not leaking into public/group projections.

## 4. Event Review UI

- [x] 4.1 Add a plain-text note composer and note history to the individual event Review screen, render content as text with line breaks, display author and submission time newest first, and refresh after successful submission; verify frontend tests cover submission, order, metadata display, and safe text rendering.

## 5. Verification

- [x] 5.1 Run `go test ./...` and `npm test -- --watchAll=false`, then run `npm run build`; verify all tests pass and the production frontend build succeeds.

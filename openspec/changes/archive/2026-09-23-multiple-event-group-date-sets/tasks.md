## 1. Date-set state and generation

- [x] 1.1 Refactor the date-selection state model so the event-group form starts with one independent date set and can add or remove sets; verify existing one-off event-group creation still renders and submits one instance.
- [x] 1.2 Extend date-set occurrence generation so each set independently supports one-off and weekly schedules, exclusions, previews, and local wall-clock times; verify weekly generation and daylight-saving-transition tests pass.
- [x] 1.3 Combine remaining occurrences from all date sets in deterministic set order and validate each set before submission; verify invalid or empty sets prevent submission.
- [x] 1.4 Add exact duplicate `{ from, to }` detection across date sets with an actionable validation message; verify duplicate schedules cannot be submitted and non-duplicates are preserved.

## 2. Event-group form integration

- [x] 2.1 Update the Create Event Group date section to render independent date-set controls, add/remove actions, per-set errors, and per-set previews; verify adding, editing, excluding, and removing a set leaves other sets unchanged.
- [x] 2.2 Wire the combined occurrence list into the existing event-group POST request without changing the API payload shape; verify a form with two weekly date sets sends every remaining concrete instance.
- [x] 2.3 Ensure the date controls expose one-off and weekly recurrence only and do not expose monthly recurrence; verify the rendered form and submission behavior.

## 3. Regression and verification

- [x] 3.1 Add or update frontend tests for one-off mode, multiple weekly schedules, exclusions, invalid ranges, empty sets, duplicate occurrences, and deterministic flattening; verify `npm test -- --watchAll=false` passes.
- [x] 3.2 Run the production frontend build and verify generated assets reflect the updated Create Event Group workflow with `npm run build`.
- [ ] 3.3 Run relevant Go tests to verify the unchanged event-group API and persistence path continue accepting flattened concrete instances with `go test ./...` (blocked: integration test requires PostgreSQL at `localhost:5432`).

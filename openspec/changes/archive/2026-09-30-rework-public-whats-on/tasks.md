## 1. Public API contract

- [x] 1.1 Define the dedicated What's On endpoint and unified public display-item response schemas in `api/public-api.yaml`, including visibility-safe fields only; verify the contract is valid and leaves the booking availability endpoint unchanged.
- [x] 1.2 Regenerate REST models, handlers, mocks, and test clients with `go generate ./...`; verify generated artifacts are updated without hand edits and compilation succeeds.

## 2. Public event selection and grouping

- [x] 2.1 Implement dedicated What's On event selection using complete interval overlap while preserving existing implicit period defaults and parameter validation; verify boundary, spanning-period, and outside-period tests pass without changing booking availability behavior.
- [x] 2.2 Query the event-group relationship and group-level visibility for public events without exposing administrative fields; verify private groups and private sessions are excluded.
- [x] 2.3 Build and order unified grouped/standalone display items by earliest included event and order nested events deterministically; verify grouped, standalone, mixed-visibility, and tie-ordering tests pass.
- [x] 2.4 Add the What's On REST handler and database-facing tests for the new response shape; verify public endpoint integration tests cover the complete display model and `/api/v1/events` remains compatible.

## 3. What's On rendering

- [x] 3.1 Replace the flat event mapping in `src/WhatsOn.js` with large display-item cards containing nested event cards, while retaining the existing implicit-period loader and empty-state behavior; verify the component renders grouped and standalone items correctly.
- [x] 3.2 Add frontend tests for nested cards, chronological server order, private-event exclusion, and an empty public schedule; verify `npm test -- --watchAll=false` passes for the focused tests.

## 4. Verification

- [x] 4.1 Run `go test ./...` and verify backend unit, REST, and generated-client tests pass.
- [x] 4.2 Run `npm run build` and verify the production frontend builds successfully with the new public response model.

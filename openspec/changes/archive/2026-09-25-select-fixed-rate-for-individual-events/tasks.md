## 1. Inspect and confirm existing rate-assignment paths

- [x] 1.1 Trace admin individual-event creation, rate loading, and event persistence to identify any fixed-session filtering or defaulting.
- [x] 1.2 Trace admin event review rate updates and confirm the existing API validates and persists the selected rate identifier.
- [x] 1.3 Confirm invoice preparation reads the individual event's selected rate and already handles fixed-session pricing.

## 2. Update admin individual-event creation

- [x] 2.1 Expose existing fixed-session rate definitions in the individual-event creation selector with a clear per-session price label.
- [x] 2.2 Ensure a selected fixed-session rate is included in the creation request and remains compatible with hourly and progressive rates.
- [x] 2.3 Add frontend tests for displaying, selecting, and submitting a fixed-session rate during individual-event creation.
- [x] 2.4 Add or update backend tests for creating an individual event with a fixed-session rate, including invalid-rate handling.

## 3. Update admin event review

- [x] 3.1 Expose existing fixed-session rate definitions in the event-review rate updater.
- [x] 3.2 Ensure changing an event to a fixed-session rate persists the identifier and reports assignment errors without losing the prior rate.
- [x] 3.3 Add frontend tests for selecting and submitting a fixed-session rate during review.
- [x] 3.4 Add backend or integration coverage for review-time fixed-session assignment.

## 4. Verify invoice behavior and generated assets

- [x] 4.1 Add or update invoice-preparation coverage proving the selected fixed-session rate is used for an individual event.
- [x] 4.2 Run `npm test -- --watchAll=false` and focused rate/event tests.
- [x] 4.3 Run `go test ./...`.
- [x] 4.4 Run `npm run build` and include the regenerated production frontend assets if JavaScript changed.
- [x] 4.5 Regenerate OpenAPI artifacts only if the API contract changed, then verify generated files are consistent. (No API contract change; regeneration not applicable.)

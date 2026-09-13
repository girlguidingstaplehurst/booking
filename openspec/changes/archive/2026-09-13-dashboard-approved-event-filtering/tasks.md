## 1. Dashboard Filtering

- [x] 1.1 Update Dashboard section derivation so individual events in `Events to be invoiced` require `status === "approved"`, and verify the existing invoice and event-group predicates remain unchanged.
- [x] 1.2 Update Dashboard section derivation so individual events in `Needing keyholders` require `status === "approved"`, and verify approved events with either missing keyholder remain visible.
- [x] 1.3 Remove the Dashboard event-card `Approve` action while preserving the `Review` action and the event review screen's functional approval controls; verify no Dashboard approval button is rendered.

## 2. Dashboard Tests

- [x] 2.1 Add Dashboard test data and assertions proving provisional or awaiting-documents individual events are excluded from invoicing and missing-keyholder sections while approved events remain eligible.
- [x] 2.2 Add a Dashboard test proving the approval-section event card has no `Approve` action and still exposes `Review`; verify the test suite passes.

## 3. Verification

- [x] 3.1 Run the focused Dashboard tests with `npm test -- --watchAll=false Dashboard.test.js` and verify all Dashboard behavior passes.
- [x] 3.2 Run `npm test -- --watchAll=false` and `npm run build` to verify the complete frontend test suite and production build succeed.

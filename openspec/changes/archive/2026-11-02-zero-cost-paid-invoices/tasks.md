## 1. API Contract

- [x] 1.1 Add an authenticated zero-cost invoice creation operation to `api/public-api.yaml` using the existing invoice request data, then run `go generate ./...` and verify the generated REST and client code expose it.

## 2. Atomic Invoice Persistence and API

- [x] 2.1 Add a transactional persistence path that accepts only individual invoices with associated events and a GBP total of £0.00 at penny precision, and stores the invoice as paid with its items and event associations; verify success and rejection cases leave the expected database state.
- [x] 2.2 Implement the authenticated API handler using the transactional path without invoking PDF generation, email delivery, or mark-as-sent; verify handler tests cover success, invalid requests, and that no email/PDF dependencies are called.

## 3. Invoice Preparation UI

- [x] 3.1 Calculate and display invoice totals using the same per-line penny precision as persistence; verify tests cover fractional-penny values and the £0.00 boundary.
- [x] 3.2 Add a visually distinct no-email button beside Send Invoice when an individual invoice's live displayed total is £0.00, submit the current items and event selection to the new operation, and preserve the existing send action; verify component tests cover changing totals, successful navigation, failed requests, group exclusion, and sending a free invoice.

## 4. Regression Verification

- [x] 4.1 Run `go test ./...` and `npm test -- --watchAll=false`, then run `npm run build`; verify existing invoice, email, and frontend behavior remains passing and the production frontend builds.

## 1. Dashboard Action Rendering

- [x] 1.1 Update the Dashboard event-group card action rendering so cards in `Event groups with remaining sessions` retain `Review` but omit `Create Invoice`; verify the existing group review link remains `/admin/review-group/<group id>`.
- [x] 1.2 Preserve direct group invoice creation for cards in `Events to be invoiced`; verify the link remains `/admin/create-invoice?eventGroup=<group id>`.

## 2. Regression Coverage

- [x] 2.1 Add a Dashboard test with an invoice-eligible group and remaining session, scoping assertions to each section to verify the remaining-session card has no `Create Invoice` link and the invoice section retains it.
- [x] 2.2 Run `npm test -- --watchAll=false Dashboard.test.js` and verify the Dashboard test suite passes.

## 3. Frontend Verification

- [x] 3.1 Run `npm run build` and verify the production frontend build completes without errors.

## 1. Invoice Submission Navigation

- [x] 1.1 Update `EditableInvoiceCard` to use React Router navigation and navigate to `/admin` only when the invoice-send response has `ok === true`; verify the existing request endpoint, payload, and loading behavior remain unchanged.
- [x] 1.2 Keep failed or missing invoice-send responses on the invoice preparation form; verify navigation is not called for unsuccessful responses.

## 2. Frontend Coverage

- [x] 2.1 Extend `EditableInvoiceCard.test.js` with a memory-router success case that submits an invoice and verifies the router reaches `/admin`.
- [x] 2.2 Add a failed-response case that verifies the router remains on the invoice form and the existing invoice payload is still submitted; verify with `npm test -- --watchAll=false src/admin/components/EditableInvoiceCard.test.js`.

## 3. Production Verification

- [x] 3.1 Run the frontend production build and verify it completes successfully with `npm run build`.

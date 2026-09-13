## Why

After an administrator successfully sends an invoice, the invoice preparation page remains visible even though the workflow is complete. This leaves the administrator without a clear return path and can make a completed submission appear unfinished.

## What Changes

- Navigate to the admin dashboard after the invoice-send request completes successfully.
- Treat only a `response.ok` result as successful navigation.
- Keep the administrator on the invoice form when the request fails.
- Preserve the existing invoice payload, backend endpoint, and submission behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `invoice-creation`: A successfully sent prepared invoice returns the administrator to the admin dashboard; failed sends remain on the preparation form.

## Impact

- Frontend: `src/admin/components/EditableInvoiceCard.js` and its submission test.
- Routing: uses the existing `/admin` route; no new route or API contract is required.
- Backend and generated API files: unchanged.

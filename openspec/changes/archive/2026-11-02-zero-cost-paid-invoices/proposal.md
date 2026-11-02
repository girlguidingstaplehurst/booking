## Why

Administrators need to record free individual events as invoices paid without contacting the customer. The existing invoice submission path always emails the invoice, even when its total is zero, while the separate mark-paid action is only available after an invoice exists.

## What Changes

- Add a no-email action to individual invoice preparation when the live displayed invoice total is £0.00.
- Keep the existing Send Invoice action available alongside it so administrators can choose to email a free invoice.
- Create zero-total invoices as paid while preserving their event associations and items; do not generate or send an invoice email for this action.
- Validate the zero-total condition on the server as well as controlling the action from the live displayed total in the UI.

## Capabilities

### New Capabilities

### Modified Capabilities
- `invoice-creation`: Add the no-email, create-as-paid workflow for zero-total individual invoices.

## Impact

- Admin invoice preparation UI and its tests.
- Authenticated REST API contract and handler for creating a zero-total paid invoice without email delivery.
- Invoice persistence logic and tests, including paid status/timestamp and preservation of individual event associations.
- Generated API and test-client artifacts will need regeneration during implementation.

# Proposal

## Why

Hourly event groups can contain several sessions with the same event name, so the invoice preparation selector does not give administrators enough information to choose the intended sessions. Showing each session's date and time makes the include list actionable and reduces selection errors.

## What Changes

- Display each hourly group session's name and date/time in the session-selection checkbox, using the session timestamps already returned by the API.
- Keep session selection, invoice calculations, and submission behavior unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `invoice-creation`: Make hourly group session choices identifiable by showing their date and time alongside the event name.

## Impact

- Frontend invoice preparation UI in `src/admin/components/EditableInvoiceCard.js` and its component tests.
- No API, database, dependency, or invoice-calculation changes are expected.

## Context

See `proposal.md` for motivation and `specs/invoice-creation/spec.md` for the behavior contract. The invoice preparation card already edits line items and displays their total. Its current submit action calls the authenticated send-invoice operation, whose handler creates the invoice, generates a PDF, sends email, and then marks the invoice sent. Invoice persistence already stores item amounts as PostgreSQL `money`, event associations, a paid timestamp, and an invoice status; the existing mark-paid operation updates paid timestamp and status separately.

## Goals / Non-Goals

**Goals:**
- Keep invoice totals, the no-email action's eligibility, and persisted GBP amounts consistent to penny precision.
- Create the zero-total invoice, its items and event links, and its paid state as one atomic operation.
- Keep the existing send-invoice path and its behavior unchanged.

**Non-Goals:**
- Zero-cost event-group invoices or changes to group session selection.
- Changes to invoice preparation, pricing, discounts, deposits, or email content beyond the eligibility and new action described in the spec.
- Database schema migrations; the current invoice columns and status support this state.

## Decisions

### Add a dedicated authenticated API operation

Add a distinct operation, proposed as `POST /api/v1/admin/invoices/zero-cost`, using the existing invoice request data for contact, items, and selected individual event IDs. The UI will call this operation only from the new action. Keeping the operation separate from `POST /api/v1/admin/send-invoice` makes the no-email outcome explicit and avoids changing the established send contract.

An alternative was adding a `sendEmail` or `markPaid` flag to the existing operation. That would make a single endpoint perform materially different side effects based on a request flag and increase the chance that a caller unintentionally bypasses email or payment handling.

### Create the invoice and paid state in one database transaction

The new persistence operation will insert the invoice with status `paid` and a paid timestamp in the same transaction as its event associations and items. It will not call the existing mark-paid endpoint after creating the invoice. A two-request or two-update sequence could leave an invoice raised but unpaid if the second step failed. The operation will reject group requests, missing individual event associations, and nonzero totals before committing any invoice data.

### Enforce the zero total on the server

The UI will derive button visibility from the live editable total, but the authenticated API must independently validate the request; browser visibility is not an authorization or business-rule boundary. Validation and storage will use the same two-decimal GBP precision as invoice amounts. Normalize each submitted line to penny precision before summing, and use that same normalized sum for the displayed total, so rounding a line for PostgreSQL `money` cannot make the UI and server disagree about whether the total is £0.00.

A UI-only check was rejected because callers can invoke the API directly. Summing unrounded binary floating-point values was also rejected because it can disagree with both the formatted total and persisted money values.

### Keep the no-email path outside PDF and email delivery

The new handler will persist and return success without invoking PDF generation, email content lookup, the email sender, or the sent-state update. The standard Send Invoice action remains beside it, including when the total is zero, and continues through the current email workflow.

### Regenerate generated API artifacts from the contract

Define the new operation in `api/public-api.yaml`, then use the repository's `go generate ./...` workflow to update generated REST and client code. Generated files are not hand-edited.

## Risks / Trade-offs

- [Risk] Client and database rounding can produce different totals for calculated hourly lines with fractional pennies. -> Normalize each line to GBP penny precision before displaying the sum and before server-side validation/storage; add boundary tests for fractional line amounts and values that round to £0.00.
- [Risk] A new endpoint could accidentally accept event-group or nonzero requests when called outside the UI. -> Validate invoice mode, associated individual events, and the normalized item total in the authenticated server/persistence path, with tests proving rejected requests leave no records.
- [Risk] Reusing invoice insertion logic could accidentally retain the default `raised` status or invoke existing email side effects. -> Keep a dedicated handler and transaction path, and test `paid` status/timestamp, absent sent timestamp, preserved associations/items, and no PDF/email calls.

## Migration Plan

No database migration is expected. Add the API contract and regenerate API artifacts, deploy the server and frontend together, and retain the existing send-invoice operation for compatibility. Rollback can remove the new UI/API path without changing existing invoice rows or the behavior of ordinary invoice sending.

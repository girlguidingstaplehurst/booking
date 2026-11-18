# Proposal

## Why

Viewing an existing invoice currently fails with HTTP 500 because the invoice-detail query orders associated events by the nonexistent `booking_events.from_date` column. The schema stores event start time in `event_start`, so invoice review is broken for invoices with event associations.

## What Changes

- Order associated invoice events by `booking_events.event_start` in the invoice-detail query.
- Extend PostgreSQL-backed regression coverage to verify `GetInvoiceByID` returns associated event details in start-time order without a missing-column error.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The existing `invoice-creation` capability already specifies that administrators can review invoices with associated event details; this change restores that existing behavior without changing the contract.

## Impact

- `internal/postgres/db.go`: invoice detail query ordering.
- PostgreSQL integration tests for invoice retrieval; these require `BOOKING_TEST_DATABASE_URL`.
- No API contract or database migration changes.

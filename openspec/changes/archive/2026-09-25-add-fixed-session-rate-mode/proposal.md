## Why

Administrators need to define rates for sessions such as half-day and full-day bookings without encoding a single price as a two-tier progressive per-session rate. A first-class fixed-session mode makes the pricing intent explicit and ensures invoices charge one configured amount per session.

## What Changes

- Add a fixed-session pricing mode to rate definitions with one non-negative session price.
- Preserve existing hourly and progressive per-session pricing modes and their behavior.
- Extend the admin rate editor and rate summaries to create, edit, and display fixed-session rates.
- Apply the fixed session price when calculating invoices for events and event groups.
- Extend API schemas, persistence, validation, generated clients, and automated tests for the new mode.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `rate-definitions`: Allow administrators to maintain fixed-session rates in addition to hourly and progressive per-session rates, with mode-specific validation and presentation.

## Impact

- OpenAPI contract and generated Go REST/model/client code.
- PostgreSQL rate persistence and migration history.
- Go REST validation and invoice preparation/calculation behavior.
- React admin rate editor, rate summaries, selectors, and invoice calculations.
- Rate unit, integration, frontend, and end-to-end tests.

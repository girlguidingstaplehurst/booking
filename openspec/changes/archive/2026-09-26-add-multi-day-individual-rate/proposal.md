## Why

The booking service currently supports hourly, fixed-session, and progressive per-session rates, but cannot represent pricing for long-running individual events where the first several 24-hour periods have one daily price and later periods have another. This change enables accurate multi-day pricing while preserving existing event-group pricing behavior.

## What Changes

- Add a duration-based multi-day pricing mode for individual events.
- Charge each of the first configured full 24-hour periods at an initial daily rate.
- Charge each subsequent full 24-hour period at a later daily rate.
- Charge remaining hours at an hourly rate, capped by the daily rate of the tier containing the remainder.
- Expose and validate the new pricing fields through the rate API and administrator rate editor.
- Allow multi-day rates for individual-event selection only; exclude them from event-group rate selection.
- Use the new calculation during individual-event invoice preparation without changing existing hourly, fixed-session, or progressive group calculations.
- Add persistence, API, frontend, unit, integration, and acceptance coverage as appropriate.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `rate-definitions`: extend reusable rate definitions with multi-day duration pricing and restrict that mode to individual events.

## Impact

- OpenAPI rate schemas and generated REST/client models.
- PostgreSQL `booking_rates` persistence and migrations.
- Go REST validation and rate mapping.
- React administrator rate editor and rate selectors.
- Individual-event invoice calculation and related tests.
- Existing event-group selectors and calculations require compatibility checks so their supported pricing modes remain unchanged.

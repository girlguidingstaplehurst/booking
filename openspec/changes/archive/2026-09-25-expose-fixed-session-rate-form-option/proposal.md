## Why

The rate API and editor logic already support fixed-session pricing, but the add/edit form does not expose a radio option for selecting that mode. Administrators therefore cannot create or switch to fixed-session rates through the UI, despite the capability being available elsewhere in the booking workflow.

## What Changes

- Add a visible fixed-session pricing option to the admin rate editor.
- Make the fixed-session price field reachable when that option is selected.
- Preserve existing hourly and progressive per-session form behavior and payloads.
- Add focused frontend coverage for selection, validation, edit initialization, and submission of fixed-session rates.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `rate-definitions`: Ensure the rate editor exposes all supported pricing modes, including fixed-session pricing, with actionable validation and save behavior.

## Impact

- React admin rate editor and its focused tests in `src/admin/Rates.js` and `src/admin/Rates.test.js`.
- No API, database, invoice-calculation, or rate-selector contract changes are expected; those fixed-session paths already exist.

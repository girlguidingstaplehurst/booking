## Why

Keyholder assignments currently store email addresses directly on bookings, which makes them difficult to manage, select, and update consistently. Administrators need a reusable directory of keyholders with stable identities and replaceable key numbers, while bookings should record who handled entry and exit without exposing key numbers in assignment controls.

## What Changes

- Add an authenticated admin keyholder directory with list, create, and edit screens.
- Store each keyholder with a UUID identity, name, unique key number, and active state.
- Allow administrators to deactivate keyholders who leave; do not provide an in-application delete action.
- Replace event keyholder email values with nullable references to keyholder UUIDs.
- Allow separate entry and exit keyholder assignments for individual events.
- Allow event groups to select one keyholder applied to both entry and exit for every generated instance.
- Exclude inactive keyholders from new assignment selectors while retaining existing assignments.
- Display keyholder names in assignment controls and booking views; keep key numbers visible only in the keyholder directory.
- Drop existing email-based keyholder assignments during migration because they do not need to be preserved.

## Capabilities

### New Capabilities

- `keyholder-management`: Manage keyholder records and assign active keyholders to events and event groups.

### Modified Capabilities

- `admin-screen-alignment`: Expose the keyholder management screen through the authenticated admin navigation while preserving responsive admin presentation.

## Impact

- OpenAPI contract and generated REST models/handlers for keyholder CRUD and assignment fields.
- PostgreSQL migrations and queries for the keyholder table, UUID foreign keys, uniqueness, and active-state filtering.
- Go REST service/database interfaces, validation, and tests.
- React admin routes, navigation, keyholder screens, event creation/review assignment controls, and tests.
- Existing email-based keyholder columns and values are replaced; no compatibility migration for old assignments is required.

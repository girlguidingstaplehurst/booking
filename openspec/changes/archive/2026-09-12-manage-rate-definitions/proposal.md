## Why

The service already stores reusable hourly rate definitions and has storage for per-session pricing, but administrators cannot create or edit those definitions. They currently depend on seeded data and the event workflow only exposes rates as selectable presets. This change adds an admin rate catalog so pricing definitions can be maintained without database changes.

## What Changes

- Add an authenticated admin screen listing existing rate definitions.
- Add create and edit workflows for rate definitions.
- Allow administrators to maintain a description and hourly price.
- Allow administrators to maintain the supported two-tier per-session definition:
  - a fixed total price for up to a configured session count;
  - a price for each session beyond that count.
- Represent rates without per-session pricing as an empty per-session array.
- Add authenticated API operations and persistence for creating and updating rate definitions.
- Validate rate identifiers, descriptions, monetary values, and per-session tier values.
- Keep event rate assignment and invoice calculation behavior unchanged.

## Capabilities

### New Capabilities

- `rate-definitions`: Manage reusable hourly and per-session rate definitions through the authenticated admin interface and API.

### Modified Capabilities

<!-- No existing OpenSpec capabilities are registered in this repository. -->

## Impact

- `api/public-api.yaml` gains rate-definition create and update contracts and a structured per-session model.
- Generated REST and model files will need regeneration from the API contract.
- PostgreSQL persistence gains create/update operations and normalizes the empty per-session value to `[]`.
- The React admin navigation gains a rate-management entry point and list/editor screens.
- Existing rate selection, event assignment, event-group creation, and invoice workflows remain consumers of the rate catalog but are not behaviorally changed.
- Tests are needed for API validation/persistence and the admin list/editor behavior.

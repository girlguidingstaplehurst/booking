## Context

The existing `booking_rates` table stores `id`, `description`, `hourly_rate`, `discount_table`, and a JSON `per_session` column. The API exposes rates through `GET /api/v1/admin/rates`, while the React admin currently uses rates only through the event and event-group creation forms and can assign an existing rate to an event. There are no rate mutation endpoints or rate-management routes.

The repository treats `api/public-api.yaml` as the source for generated REST and model code. Admin requests use the existing bearer-token helpers and the existing Go/PostgreSQL service layers.

## Goals / Non-Goals

**Goals:**

- Add authenticated CRUD-adjacent catalog management for listing, creating, and editing rate definitions.
- Make the supported per-session model explicit and validate it at the API boundary and persistence boundary.
- Preserve rate identifiers so existing event and event-group foreign-key references remain valid.
- Provide an admin list and focused create/edit forms consistent with the current Chakra UI admin screens.

**Non-Goals:**

- Deleting, archiving, or renaming rate identifiers.
- Changing event or event-group rate assignment.
- Applying per-session pricing during invoice generation.
- Adding new discount-table behavior.

## Decisions

### Use separate create and update admin endpoints

Add authenticated `POST /api/v1/admin/rates` and `PUT /api/v1/admin/rates/{rateID}` operations alongside the existing list endpoint. A separate update path makes identifier immutability explicit and avoids overloading event-rate assignment. Alternatives considered were a single upsert endpoint, which could accidentally create a missing rate, and a generic JSON patch endpoint, which would make validation and the UI less clear.

### Keep the rate identifier immutable

The identifier remains the primary key and foreign-key target for event and event-group references. The create form accepts it once; the edit form displays it as read-only. Deletion and renaming are deferred because they require a reference migration or lifecycle policy.

### Normalize per-session pricing to an array

Use `[]` for no per-session pricing and an ordered two-item array for progressive pricing:

```json
[
  { "count": 10, "price": 150.00 },
  { "price": 13.50 }
]
```

The first item is a fixed total for up to `count` sessions; the second is the price for each additional session. The UI presents these as three fields rather than a raw JSON editor. A database migration should convert the existing `{}` default and any empty values to `[]`, while non-empty legacy values require explicit validation before they are edited.

### Define an explicit API schema for rate payloads

Replace the current arbitrary map representation for `perSession` in the API contract with a typed array/item schema. Monetary fields remain numeric at the API boundary, with non-negative validation and a positive integer for the first-tier count. The existing `discountTable` is returned for compatibility but is not made editable by this change.

### Reuse the existing admin fetch/post and route patterns

The frontend should add a rates route under `AdminLayout`, use `AdminFetcher` and `AdminPoster`, and follow the existing Formik, Yup, Chakra UI, `RoundedButton`, loading, and error-display conventions. Existing `RateSelect` behavior should continue to consume the list endpoint without requiring event workflow redesign.

## Risks / Trade-offs

- [Risk] Existing `per_session` data may contain `{}` or undocumented non-empty shapes. -> [Mitigation] Add a migration for empty defaults, validate reads/edits, and surface an actionable error instead of silently rewriting unknown pricing.
- [Risk] Editing a shared rate changes the displayed definition for all future consumers and may affect existing invoice preparation. -> [Mitigation] Preserve identifiers and document that this iteration edits catalog definitions in place; do not alter invoice generation or historical invoice records.
- [Risk] Numeric JSON values can be represented inconsistently across Go, PostgreSQL, and JavaScript. -> [Mitigation] Validate finite non-negative values at the API boundary and use the repository's existing numeric conversion pattern for database money fields.
- [Risk] Generated REST files can become stale after contract changes. -> [Mitigation] Include `go generate ./...` and generated-code verification in the implementation tasks.

## Migration Plan

1. Apply the database migration that changes the empty `per_session` default from `{}` to `[]` and normalizes existing empty values.
2. Deploy the API and frontend changes together after regenerating contract-derived files.
3. If rollback is required, roll back application code first; retain the compatible JSON column data and reverse the default migration only if the previous binary must accept `{}` as its default.

## Open Questions

None that change the agreed scope or data model. The discount table remains read-only and deletion/archival is explicitly deferred.

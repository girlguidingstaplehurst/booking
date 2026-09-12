## Context

The current service stores `keyholder_in` and `keyholder_out` as nullable email text columns on `booking_events`. Event-group creation accepts one email and copies it to both columns for each generated instance. The admin React application has authenticated routes for Dashboard, Rates, event creation, event-group creation, and event review, but no keyholder directory or assignment update workflow.

See `proposal.md` for the motivation and `specs/keyholder-management/spec.md` for the behavioral contract.

## Goals / Non-Goals

**Goals:**

- Introduce a stable keyholder identity that can be referenced by bookings independently of a replaceable key number.
- Provide authenticated CRUD screens limited to list, create, edit, and active-state management; no application delete operation.
- Make active keyholders available by name for new event assignments while preserving references to deactivated keyholders.
- Support separate entry and exit assignments for individual events and one shared assignment for event groups.
- Replace the old email-based assignment representation without preserving existing assignment values.

**Non-Goals:**

- Preserving or importing existing email-based keyholder assignments.
- Recording historical key numbers or key-set usage on bookings.
- Managing physical key inventory, key-set replacement workflows, or audit history.
- Exposing keyholder email addresses or key numbers in booking assignment controls.

## Decisions

### Use a UUID keyholder identity and mutable unique key number

Create a `booking_keyholders` table with a UUID primary key, name, key number, and active flag. Enforce key-number uniqueness in the database and validate it at the API boundary. The UUID is the foreign-key target because key numbers may be changed or swapped without rewriting event assignments.

An inactive keyholder remains a valid referenced record. Listing and assignment queries distinguish active records from all records: active records are available for new selections, while all records can be resolved for existing bookings and directory management.

Alternative considered: use the key number as the foreign key. This would couple booking history to a replaceable physical key identifier and make key swaps require assignment rewrites, so it is rejected.

### Replace email columns with nullable UUID foreign keys

Add nullable `keyholder_in_id` and `keyholder_out_id` UUID columns referencing `booking_keyholders(id)`, then remove the old email columns and their indexes. Existing email values are intentionally discarded during the migration. Nullable references preserve the existing meaning of an unassigned entry or exit responsibility and keep the Dashboard missing-keyholder workflow intact.

Alternative considered: retain the email columns alongside the UUID fields for compatibility. This would create two sources of truth and preserve data the product no longer needs, so it is rejected.

### Expose keyholder management and assignment through authenticated admin APIs

Extend the versioned OpenAPI contract with endpoints to list keyholders, create a keyholder, and update a keyholder. The update operation covers name, key number, and active state; there is no delete endpoint. Add the keyholder UUID fields to event read and write models as needed by event review and assignment forms, and add the shared keyholder field to event-group creation.

The service validates required names, valid key numbers, and uniqueness conflicts before persistence. All endpoints use the existing admin authentication mechanism and return the repository's established error response shape.

Alternative considered: let the React client mutate keyholder data through an uncontracted endpoint. The project treats `api/public-api.yaml` as the API source of truth and generates REST code from it, so the contract-first route is required.

### Keep assignment labels separate from directory details

The keyholder directory displays name, key number, and active state. Event and event-group selectors display only active keyholder names, and event review displays assigned names only. Assignment payloads carry UUIDs, not display names or key numbers.

For an individual event, entry and exit are independent fields. For an event group, the selected keyholder UUID is copied into both fields when each instance is created. Editing the keyholder later changes the name resolved by existing assignments but does not alter the assignment UUID.

### Add a dedicated admin route and navigation item

Add a responsive `/admin/keyholders` route and include Keyholders alongside Dashboard and Rates in the shared desktop navigation and narrow-viewport drawer. Use the existing admin page, form, loader/fetcher, and Chakra UI patterns rather than introducing a new UI framework.

## Risks / Trade-offs

- [Risk] Deactivating a keyholder leaves an inactive name visible on existing bookings. -> [Mitigation] Preserve the UUID foreign key and show active state in the directory; exclude inactive records only from new selectors.
- [Risk] Dropping email assignments is irreversible. -> [Mitigation] Make the migration explicitly discard the old columns and verify that this is an intentional deployment decision; no compatibility path is required by the specification.
- [Risk] A unique key-number constraint can reject a key swap if both records are updated in separate requests. -> [Mitigation] Surface a clear conflict response and perform the swap in a sequence that temporarily uses an unused number or a transaction-capable administrative procedure.
- [Risk] Generated REST files can drift from the API contract. -> [Mitigation] Treat the OpenAPI document as authoritative and include generation plus Go/frontend tests in the implementation tasks.

## Migration Plan

1. Add the `booking_keyholders` table with UUID primary key, unique key number, name, and active state.
2. Add nullable UUID assignment columns to `booking_events` with foreign keys and indexes.
3. Deploy the service/API/UI that reads and writes the UUID columns and creates new keyholder records.
4. Drop the old email assignment columns and indexes in the same migration sequence, intentionally discarding their values.
5. Verify that existing events remain readable with empty assignments and that new assignment selectors include only active keyholders.

Rollback is a code/schema rollback only before the destructive column drop. After the old email columns are removed, restoring them cannot restore their discarded values; the deployment must therefore be treated as a coordinated, non-reversible data-model migration.

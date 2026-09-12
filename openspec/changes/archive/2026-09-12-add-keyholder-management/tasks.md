## 1. Data Model And Migration

- [x] 1.1 Add a migration for `booking_keyholders` with UUID primary key, required name, unique key number, and active state, and verify the migration applies successfully against PostgreSQL.
- [x] 1.2 Add nullable UUID entry and exit foreign-key columns and indexes to `booking_events`, remove the legacy email columns and indexes, and verify existing events remain queryable with empty assignments.
- [x] 1.3 Update database queries and persistence methods to read, create, update, deactivate, and assign keyholders by UUID, and verify database/service tests cover uniqueness conflicts and inactive referenced records.

## 2. API Contract And Service

- [x] 2.1 Extend `api/public-api.yaml` with authenticated keyholder list/create/update operations and UUID-based event and event-group assignment fields, and verify the contract validates.
- [x] 2.2 Regenerate the OpenAPI REST models, handlers, mocks, and test client from the contract, and verify generated output is up to date with `go generate ./...`.
- [x] 2.3 Implement keyholder API validation for required names, valid key numbers, duplicate key numbers, and active-state updates using the existing error response format, and verify unit tests cover success and failure responses.
- [x] 2.4 Implement event assignment updates with independent entry and exit UUIDs and event-group creation with one UUID copied to both assignments, and verify service tests cover individual and grouped events.
- [x] 2.5 Enforce existing admin authentication on all keyholder management and assignment operations, and verify unauthenticated requests are rejected.

## 3. Admin Keyholder Directory

- [x] 3.1 Add the authenticated `/admin/keyholders` route and loader/fetcher integration, and verify an administrator can open the screen through direct navigation.
- [x] 3.2 Build the keyholder directory showing name, key number, and active state with create and edit flows, and verify valid records appear after save.
- [x] 3.3 Add active-state controls with no delete action, and verify deactivated records remain visible in the directory but cannot be deleted through the UI.
- [x] 3.4 Handle duplicate-key and validation errors in the directory forms, and verify the existing record remains unchanged after a rejected save.
- [x] 3.5 Add responsive layout and focused frontend tests for listing, creating, editing, deactivating, and error states, and verify `npm test -- --watchAll=false` passes for the added coverage.

## 4. Event Assignment UI

- [x] 4.1 Replace email-based event assignment fields with active-keyholder selectors that display names only and submit UUIDs, and verify key numbers never appear in selector options.
- [x] 4.2 Add independent entry and exit selectors to individual event creation/review workflows, and verify each assignment can be changed without changing the other.
- [x] 4.3 Keep deactivated assigned keyholders resolvable and visible by current name while excluding them from new selections, and verify the missing-keyholder Dashboard behavior remains correct for empty assignments.
- [x] 4.4 Keep event-group creation to one active keyholder selector and apply the selected UUID to both entry and exit instances, and verify generated group events receive identical assignments.
- [x] 4.5 Update booking review and Dashboard presentation to show assigned names without key numbers, and verify existing admin screen tests cover assigned, unassigned, and deactivated cases.

## 5. Navigation And Verification

- [x] 5.1 Add Keyholders to the responsive desktop admin navigation and narrow-viewport drawer with current-route indication, and verify the drawer opens, navigates, and closes correctly.
- [x] 5.2 Run `go test ./...` and the focused frontend test suite, and resolve any generated-code or integration regressions.
- [x] 5.3 Run `openspec validate "add-keyholder-management" --type change --strict` and verify all planning requirements and scenarios pass validation.

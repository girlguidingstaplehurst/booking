## Context

The Dashboard derives its sections from the normalized event payload in `src/admin/Dashboard.js`. Individual events include `status`, invoice references, keyholder assignments, and an optional event-group identifier. Event groups are returned separately without a status field; the backend creates their event instances as approved and assigns the same keyholder for entry and exit.

## Goals / Non-Goals

**Goals:**

- Make Dashboard workflow eligibility reflect the event approval state.
- Remove an approval control that has no Dashboard action handler.
- Preserve existing invoice, review, calendar, and event-group behavior.
- Verify the behavior through focused Dashboard tests.

**Non-Goals:**

- Changing the approval API or the event review approval workflow.
- Adding approval status to event groups or changing event-group persistence.
- Changing backend queries, OpenAPI models, or invoice eligibility endpoints.

## Decisions

- **Filter in Dashboard section derivation.** Apply the approved-status predicate where the `Events to be invoiced` and `Needing keyholders` lists are assembled. This keeps the API contract unchanged and makes the two user-facing workflow rules explicit in one location.
  - **Alternative considered:** filter in the backend event-list query. Rejected because the Dashboard still needs unapproved events for its approval section and review navigation.
- **Use an exact approved status check.** An individual event qualifies only when `event.status === "approved"`; invoice and keyholder predicates remain otherwise unchanged.
  - **Alternative considered:** treat every status other than `cancelled` as eligible. Rejected because provisional and awaiting-documents events are precisely the records that must not enter these workflows.
- **Remove only the Dashboard approval action.** The existing approval controls on `ReviewEvent` remain the authoritative approval workflow.
  - **Alternative considered:** wire the Dashboard button to the approval endpoint. Rejected because the requested behavior removes the misleading action and the review screen already owns the complete approval flow.
- **Leave event groups outside the new predicate.** Their dashboard model has no status and their creation path already produces approved instances with keyholders, so changing the group API shape is unnecessary for this scope.
  - **Alternative considered:** add aggregate group approval status. Deferred because it would expand the API and domain behavior beyond the requested individual-event change.

## Risks / Trade-offs

- [Risk] Existing or future data could contain an event-group instance that is not approved or lacks keyholders. -> Mitigation: keep group behavior unchanged as explicitly scoped; revisit with an event-group status requirement if that invariant changes.
- [Risk] Removing the Dashboard button may reduce discoverability of approval for administrators who do not use event review. -> Mitigation: preserve the `Review` link and the functional `Approve Event` control on the review screen.
- [Trade-off] Unapproved events remain visible in the approval section and calendar, while disappearing from invoice/keyholder workflow sections. -> This is intentional so approval remains visible without allowing downstream workflows prematurely.

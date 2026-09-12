## Context

The event-group API and backend already require an active keyholder. The shared `KeyholderSelect` intentionally displays an `Unassigned` option because it is also used for individual events, where entry and exit keyholders are nullable and can be assigned later. The event-group form uses Formik/Yup validation, but the required-field behavior and request suppression need explicit regression coverage.

## Goals / Non-Goals

**Goals:**

- Preserve `Unassigned` in the reusable keyholder selector.
- Make the event-group form visibly reject an empty keyholder selection.
- Ensure invalid event-group submission stops before `AdminPoster` is called.
- Preserve optional keyholders for individual event creation and later assignment.

**Non-Goals:**

- Change the event-group API contract or generated models.
- Change database nullability or backend event-group validation.
- Remove `Unassigned` from the shared selector.
- Make individual event keyholders required.

## Decisions

### Keep the shared selector generic

The selector will continue to expose `Unassigned`; the parent form owns whether an empty value is valid. This avoids adding event-group-specific behavior to a control that is also used by individual event assignment.

### Keep validation at the event-group form boundary

The existing event-group schema remains the source of client-side required-field validation. The form must render the resulting error and prevent the submit callback from making an API request when `keyholder` is empty. This complements, rather than replaces, backend validation.

### Test request suppression, not only error text

The regression test will assert both visible validation feedback and that the event-group poster is not called. This protects the externally important behavior if the presentation wording changes later.

## Risks / Trade-offs

- [Risk] The shared selector may be reused in another required-assignment form in the future. -> Mitigate by keeping requiredness in each parent form rather than hard-coding it in the selector.
- [Risk] Client-side validation can be bypassed by a direct API caller. -> Retain the existing required API schema and backend active-keyholder validation.
- [Risk] Formik validation errors can be present but invisible to users. -> Render the field error through the keyholder form control and test the visible validation state.

## Migration Plan

No migration is required. This is a frontend validation and regression-test clarification around an existing backend contract. Existing valid event-group requests continue unchanged; invalid unassigned submissions are rejected earlier in the browser.

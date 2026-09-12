## Context

The rates editor in `src/admin/Rates.js` already uses Formik and Yup, but its inputs are native labels around Chakra inputs and do not expose Formik errors. The existing `FormFieldAndLabel` component is the established admin pattern for displaying an error beside a field and marking it invalid. The rates API and its server-side validation remain the source of final enforcement.

## Goals / Non-Goals

**Goals:**

- Make rate validation visible and actionable at the field that needs correction.
- Ensure a new incomplete form is visibly and functionally non-submittable.
- Keep hourly-only and progressive per-session validation conditional on the selected pricing mode.
- Prevent duplicate submissions and retain server rejection messages.
- Test the user-visible validation and submission states.

**Non-Goals:**

- Changing the rate API, database schema, or server validation rules.
- Replacing Formik, Yup, Chakra UI, or the existing admin form conventions.
- Adding client-side validation for rate identifiers beyond the current required/trimmed rule unless the API contract is expanded separately.

## Decisions

### Reuse the existing field feedback convention

Use `FormFieldAndLabel` for the editable text and numeric fields, passing the corresponding Formik error through `errValue` and Formik's change/blur handlers. This keeps rates consistent with Create Events rather than introducing a rates-specific error component. If the shared component needs a small accessibility improvement, preserve its existing API and add the minimum required behavior.

An alternative would be to use Chakra `FormControl` and `FormErrorMessage` independently for every rates field. That would provide more semantic control, but would duplicate an established project pattern and create inconsistent admin screens.

### Validate on mount and disable Save from Formik state

Configure Formik to validate the initial values and disable Save when either `formik.isValid` is false or the form is submitting. The button retains its loading state during the request. Validation remains conditional through the existing Yup schema, so inactive pricing fields do not block submission.

Relying only on the browser's `min` and `step` attributes is insufficient because those constraints do not provide consistent Formik errors and do not cover required conditional fields. Relying only on submit-time validation also leaves an empty new form appearing ready to save.

### Show field errors after interaction or attempted submission

Use Formik touched state where practical so the form does not show a wall of errors before the administrator interacts with it. After a submit attempt, all invalid fields should become eligible for feedback. This follows the Create Events interaction model while making the initial disabled state explicit.

### Normalize user-entered text at the request boundary

Trim the identifier and description when constructing the request body, in addition to validating them with Yup. This avoids accepting a value that is validated as meaningful but sent with accidental surrounding whitespace. The immutable identifier behavior during editing remains unchanged.

### Test through the rendered editor behavior

Extend `src/admin/Rates.test.js` with React Testing Library coverage for initial disabled state, field-level errors, pricing-mode switching, correction enabling Save, loading/duplicate-submit prevention, and server error display. Keep existing pure helper tests. Rendered tests should mock navigation, loader data, and poster/putter requests rather than require a running service.

## Risks / Trade-offs

- [Risk] Existing `FormFieldAndLabel` does not currently model touched state or explicit error semantics. -> [Mitigation] Make the smallest compatible shared-component adjustment, or use the established error display directly if touched tracking is not needed.
- [Risk] Disabling Save based on `isValid` can be misleading if validation is not run after initial values are loaded. -> [Mitigation] Keep `validateOnMount` enabled alongside `enableReinitialize` and verify both new and edit form tests.
- [Risk] Client and server validation can diverge over time. -> [Mitigation] Keep the frontend rules aligned with the existing `rate-definitions` contract while retaining server validation as authoritative.
- [Risk] A server error response may not contain the expected JSON shape. -> [Mitigation] Preserve the existing fallback message when the response cannot provide `error_message`.

## Migration Plan

No data or API migration is required. Deploy the frontend changes with the existing service; rollback consists of reverting the frontend bundle changes. Existing server-side validation continues to protect direct or non-browser API clients.

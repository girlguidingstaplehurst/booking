## Why

The rates editor already has Yup rules, but invalid values are not presented at the fields that need correction. The Save action also remains visually available for an invalid form, making the administrator unsure whether the form is ready to submit.

## What Changes

- Present Yup validation errors beside the relevant rate fields using the existing admin form-field pattern.
- Validate the initial rate form state so an incomplete new rate is visibly invalid from the start.
- Disable Save while the form is invalid or submitting.
- Preserve and distinguish API submission errors such as duplicate identifiers and server-side validation failures.
- Normalize trimmed identifier and description values before creating the request body.
- Add frontend tests covering validation feedback, invalid submission state, pricing-mode-specific rules, and successful submission behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `rate-definitions`: administrators receive immediate, field-level client-side feedback and cannot submit an invalid rate form.

## Impact

- Affects `src/admin/Rates.js` and `src/admin/Rates.test.js`.
- May reuse or minimally extend `src/components/FormFieldAndLabel.js` to match the Create Events error presentation and accessibility behavior.
- No API endpoints, request schemas, database models, or server validation rules change.
- No new dependency is required; Formik and Yup are already installed.

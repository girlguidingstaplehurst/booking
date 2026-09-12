## 1. Form Validation State

- [x] 1.1 Configure the rates Formik instance to validate initial and reinitialized values, then verify a new empty rate form starts with Save disabled.
- [x] 1.2 Review the existing Yup schema against the rate-definitions scenarios and adjust conditional required, numeric, integer, and non-negative rules as needed; verify hourly and progressive pricing cases with tests.
- [x] 1.3 Trim identifier and description values in the rate request builder, then verify the generated create and update bodies contain normalized text.

## 2. Field-Level Feedback

- [x] 2.1 Replace the rates editor's editable native-label fields with the existing admin field-feedback pattern and wire Formik change, blur, error, and touched state; verify invalid fields show actionable messages and invalid styling.
- [x] 2.2 Add validation feedback for pricing-mode-specific fields and ensure inactive pricing fields do not block submission; verify switching between hourly and progressive modes in rendered tests.
- [x] 2.3 Make any minimal shared `FormFieldAndLabel` accessibility or touched-state adjustment required by the rates form, preserving existing consumers; verify the existing admin form tests continue to pass.

## 3. Submission UX

- [x] 3.1 Disable the Save action when the form is invalid or submitting while retaining the loading state; verify valid corrections enable Save and an in-flight request prevents duplicate submission.
- [x] 3.2 Preserve the existing form-level API error handling with a safe fallback message; verify duplicate-identifier or generic server errors remain visible and allow retry.

## 4. Frontend Tests

- [x] 4.1 Extend `src/admin/Rates.test.js` with React Testing Library setup and mocks for loader data, navigation, and admin poster/putter requests; verify the test file runs without a live service.
- [x] 4.2 Add rendered tests for initial disabled state, field-level validation messages, invalid pricing values, correction behavior, loading state, duplicate-submit prevention, and server error display.
- [x] 4.3 Run `npm test -- --watchAll=false Rates.test.js` and verify all rates tests pass.
- [x] 4.4 Run the broader frontend test suite with `npm test -- --watchAll=false` and verify no existing admin form behavior regresses.

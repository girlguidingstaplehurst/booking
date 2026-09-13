## 1. Rate Selection Policy

- [x] 1.1 Add an explicit hourly-only policy to the shared rate selector, classify hourly rates from the `perSession` definition, and verify selector tests exclude progressive rates only when the policy is enabled
- [x] 1.2 Pass the hourly-only policy from individual event creation and `ReviewEvent`, leave event-group creation unrestricted, and verify each usage site exposes the intended rate options
- [x] 1.3 Preserve an existing progressive review rate as a selected disabled option while excluding other progressive rates, and verify the legacy-selection test case

## 2. Event Form Validation and Actions

- [x] 2.1 Update both creation-form schemas so Event Details remains required with a 50,000-character maximum but accepts non-empty values shorter than 50 characters, and verify empty, short, and over-limit cases
- [x] 2.2 Change the individual event submit action to a full-width green `create events` button while retaining its existing bottom spacing and validation/loading behavior, and verify its rendered label and layout props
- [x] 2.3 Change the event-group submit action to the same full-width green layout while retaining `Create Event Group`, existing submission behavior, and bottom spacing, and verify its rendered label and layout props

## 3. Test Coverage and Verification

- [x] 3.1 Extend or add focused React Testing Library coverage for both creation forms, including short valid details, the 50,000-character limit, rate-selector policy props, button labels, and disabled invalid submissions
- [x] 3.2 Run the focused admin frontend tests and verify the changed forms and shared rate selector pass
- [x] 3.3 Run the complete frontend test suite with `npm test -- --watchAll=false` and verify no unrelated admin behavior regresses

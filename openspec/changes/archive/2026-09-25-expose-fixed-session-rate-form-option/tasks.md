## 1. Expose fixed-session mode

- [x] 1.1 Add a descriptive fixed-session pricing radio option to `src/admin/Rates.js` and verify the rate editor renders hourly, fixed-session, and progressive pricing choices.
- [x] 1.2 Confirm the fixed-session choice activates the existing session-price field and mode-specific validation without changing hourly or progressive field visibility; verify with the focused rate editor tests.

## 2. Add regression coverage

- [x] 2.1 Extend `src/admin/Rates.test.js` to verify fixed-session request-body construction, edit-form initialization, and fixed-session summary behavior; verify the focused test file passes.
- [x] 2.2 Add rendered-form coverage for selecting fixed-session pricing, invalid and valid session prices, and submitting the fixed-session mode; verify the submitted body contains `pricingMode: "fixedSession"` and the configured session price.

## 3. Verification and delivery

- [x] 3.1 Run the focused frontend test suite and verify existing hourly/progressive rate editor tests remain green.
- [x] 3.2 Run `npm run build` to refresh the embedded production frontend and verify the production build succeeds.

## 1. Responsive Header Layout

- [x] 1.1 Update `src/admin/components/AdminHeader.js` to keep the existing desktop horizontal header while switching the `base` and `sm` breakpoints to a centered vertical hierarchy with the logo, `Admin` heading, email, and exit link; verify the component renders the expected content at both breakpoint configurations.
- [x] 1.2 Apply narrow-viewport logo and account text sizing plus width and arbitrary-wrap constraints for long email addresses; verify a representative long address remains fully present and does not create horizontal overflow in a narrow viewport.
- [x] 1.3 Preserve the existing authenticated email value and exit link destination while changing only narrow-viewport presentation; verify the exit link continues to navigate to `/` and desktop retains `Booking Administration`.

## 2. Test Coverage

- [x] 2.1 Add focused `AdminHeader` tests covering the compact `Admin` heading, centered mobile content contract, long-email wrapping safeguard, exit link, and desktop heading; verify them with `npm test -- --watchAll=false AdminHeader.test.js`.
- [x] 2.2 Run the existing admin layout tests to confirm the header refinement does not alter drawer navigation or current-route behavior; verify with `npm test -- --watchAll=false AdminLayout.test.js`.

## 3. Frontend Verification

- [x] 3.1 Run the complete frontend test suite and verify no existing admin or public UI tests regress with `npm test -- --watchAll=false`.
- [x] 3.2 Run `npm run build` and verify the production frontend compiles successfully without horizontal-overflow-related markup or style errors.

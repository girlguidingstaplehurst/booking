## 1. Admin Navigation Structure

- [x] 1.1 Refactor `src/admin/AdminLayout.js` to select the desktop horizontal navigation or narrow-viewport menu mode using the same `base`/`sm` breakpoint behavior as `src/Layout.js`; verify the existing admin routes and sticky bar remain unchanged.
- [x] 1.2 Implement the admin desktop navigation for Dashboard and Rates with exact active-route matching, light-background colors, hover treatment, and separators; verify both links render with the correct destinations and current-route indication.
- [x] 1.3 Implement the admin right-side drawer for narrow viewports with only Dashboard and Rates, active-route styling, accessible menu controls, and close-on-navigation behavior; verify unrelated admin routes are absent and selecting a link closes the drawer.

## 2. Verification

- [x] 2.1 Add focused admin navigation tests covering desktop route state, narrow-viewport drawer contents, drawer navigation, and color/state behavior; verify the focused test suite passes with `npm test -- --watchAll=false` and the relevant test file filter.
- [x] 2.2 Run the frontend production build and verify it completes without compilation or accessibility-related errors.

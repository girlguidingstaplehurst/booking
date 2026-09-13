## Context

`src/admin/components/AdminHeader.js` currently renders a dark-blue Chakra `Box` containing a `Container` and a horizontal `Flex`. The 192px logo is followed by a flexible column containing the email, exit link, and right-aligned `Booking Administration` heading. `src/admin/AdminLayout.js` already switches the separate light-blue navigation bar to a right-side drawer at the `base` and `sm` breakpoints. See proposal.md for the motivation and the admin-screen-alignment delta for the observable contract.

## Goals / Non-Goals

**Goals:**

- Make the admin header readable at the existing narrow breakpoints without page-level horizontal scrolling.
- Establish a predictable mobile hierarchy: centered logo, `Admin` heading, email, then exit control.
- Keep long email addresses inside the available header width.
- Preserve the existing desktop header and all navigation, authentication, and routing behavior.
- Add focused component-level tests for the responsive content and overflow safeguards.

**Non-Goals:**

- Changing the light-blue admin navigation bar or its drawer behavior.
- Changing the public site header, footer, routes, authentication payload, or account actions.
- Replacing the logo asset or introducing a responsive-image dependency.

## Decisions

### Use Chakra responsive props in the existing header

The header will use Chakra's existing breakpoint-aware props to change direction, alignment, text size, and logo size at `base`/`sm` versus `md` and above. This matches the breakpoint convention already used by `AdminLayout.js` and `Layout.js`, avoids a second CSS media-query system, and keeps the desktop markup conceptually identical. A separate CSS stylesheet was considered but would duplicate the theme breakpoint and spacing rules.

### Use a vertical mobile hierarchy rather than squeezing the desktop row

On narrow viewports, the header content will switch from the current logo-plus-column row to a centered column. The mobile heading will be `Admin`, with the logo above it. Account controls will be grouped below the heading and arranged so the email and exit action remain independently readable. Retaining `Booking Administration` and the horizontal row on desktop avoids an unnecessary desktop visual change.

### Make email wrapping an explicit layout constraint

The email text will use a compact mobile font size and an arbitrary-break wrapping rule, such as `overflow-wrap: anywhere`, together with width constraints that allow it to shrink within the header. This handles addresses with no convenient line-break characters and protects against the long-address case without truncating account identity. The exit link will remain a separate accessible link rather than being folded into the email text.

### Test observable behavior without coupling tests to generated styles

Focused tests should render `AdminHeader` with the auth provider or a mocked `useAuth` payload and verify the visible `Admin` heading, email, and exit link. They should also verify the long-email text is present and that the relevant wrapping style or responsive element contract is applied. Tests should not assert Chakra-generated class names or exact pixel values; breakpoint-specific visual sizing remains a browser/layout concern.

## Risks / Trade-offs

- [Risk] Arbitrary wrapping can split an email address at visually awkward points. -> [Mitigation] Prefer normal wrapping first where possible and use arbitrary breaking only as the overflow safeguard; preserve the full address so it remains identifiable and copyable.
- [Risk] The 192px logo may make the mobile header taller than necessary. -> [Mitigation] Apply a bounded mobile size while leaving the desktop asset presentation unchanged.
- [Risk] A long email can still collide with controls if the account row remains horizontal. -> [Mitigation] Put the exit control below the email at narrow widths and test with a representative long address.
- [Risk] Responsive style assertions may be brittle in jsdom because media queries are not laid out. -> [Mitigation] Test semantic content and style declarations that are deterministic, and rely on the existing frontend build plus focused browser verification for actual viewport rendering.

## Migration Plan

No data or deployment migration is required. Update the admin header component and its focused tests, run the relevant frontend tests and production build, and roll back by restoring the previous header layout if mobile visual verification identifies a regression.

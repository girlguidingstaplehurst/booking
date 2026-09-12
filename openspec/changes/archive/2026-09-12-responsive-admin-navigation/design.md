## Context

`src/Layout.js` is the established responsive navigation implementation. It switches between a horizontal desktop navigation and a right-side Chakra drawer on `base` and `sm` breakpoints, uses React Router route state for active styling, and closes the drawer after selection. `src/admin/AdminLayout.js` currently has a sticky `brand.300` bar with two inline `NavLink` links and an underline-only active state. The admin header remains separate and is not part of this navigation change.

## Goals / Non-Goals

**Goals:**

- Give the admin navigation the same desktop/mobile interaction model as the public navigation.
- Keep Dashboard and Rates as the only visible admin navigation entries.
- Preserve the existing sticky bar, routes, authentication wrapper, and admin page outlet.
- Adapt the public navigation's contrast rules to the light-blue admin bar.
- Make the responsive states and current-route behavior testable without changing application routes.

**Non-Goals:**

- Adding event, invoice, or other administrative routes to the navigation.
- Changing `AdminHeader`, `RequireAuth`, page content, API behavior, or authentication.
- Creating a new navigation dependency or a global navigation abstraction.

## Decisions

### Reuse the established responsive interaction model

Use the same breakpoint decision as `Layout.js`: `base` and `sm` render a menu control and right-side drawer; larger breakpoints render horizontal links. This keeps admin behavior predictable and avoids introducing a second responsive convention. A shared generic navigation component was considered, but is unnecessary for two route sets with different backgrounds, contrast, and labels; local admin navigation keeps the change small and avoids coupling the public and admin surfaces.

### Keep the admin route set explicit

The desktop and drawer variants both render only `/admin` (Dashboard) and `/admin/rates` (Rates). Existing admin routes remain reachable through page actions and direct links, but are not promoted into this shared navigation. This matches the confirmed scope and prevents the navigation from becoming an unreviewed admin sitemap.

### Use route-aware styling with light-background contrast

Use exact route matching for Dashboard and Rates so `/admin` does not appear active on `/admin/rates`. On the `brand.300` bar, inactive links use `brand.900`, active links use white for stronger contrast, and hover uses a white background with `brand.500` emphasis. Drawer links retain the `brand.500` active color so they remain readable against the drawer surface.

### Close the drawer after navigation

Pass the disclosure close handler to both drawer links. This mirrors the public navigation and ensures the selected admin screen is immediately visible after a route change without requiring a separate close action.

### Test behavior at the navigation boundary

Add focused tests around the admin layout using a router and Chakra provider. Tests should verify the two link destinations, current-route indication, narrow-view menu/drawer contents, drawer closure after selection, and absence of unrelated admin routes from the drawer. Breakpoint behavior should be exercised through the existing Chakra breakpoint mechanism rather than by changing route definitions.

## Risks / Trade-offs

- [Risk] Duplicating the public navigation structure can allow future behavior drift. -> [Mitigation] Keep the admin implementation intentionally parallel to `Layout.js` and test the externally visible behaviors; extract a shared primitive only if a third navigation surface needs the same logic.
- [Risk] Drawer-specific tests may be sensitive to Chakra portal rendering. -> [Mitigation] Query by accessible menu control and link roles, and render tests with the same provider/router pattern used by the application.
- [Risk] The current public drawer's focus reference is not visibly wired to its menu button. -> [Mitigation] Preserve the intended focus behavior where practical for admin navigation, but do not broaden this change into a public navigation refactor.

## Migration Plan

No data or deployment migration is required. Replace the current admin link presentation in the frontend, run the focused frontend tests and build, and roll back by restoring the previous `AdminLayout` navigation if a responsive regression is found.

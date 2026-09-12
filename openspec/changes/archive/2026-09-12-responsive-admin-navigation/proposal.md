## Why

The admin navigation currently presents Dashboard and Rates as inline links at every viewport size, while the public navigation already provides a responsive desktop/mobile experience. Aligning the admin navigation with that established behavior will make narrow-screen administration usable and provide consistent active, hover, and navigation feedback without expanding the admin route surface.

## What Changes

- Add responsive admin navigation behavior matching the public navigation's desktop and narrow-viewport modes.
- Keep Dashboard (`/admin`) and Rates (`/admin/rates`) as the only visible admin navigation items.
- Add a narrow-viewport menu button and right-side drawer containing only Dashboard and Rates.
- Preserve sticky positioning and existing admin routes.
- Apply navigation active, inactive, hover, and separator styling appropriate for the light-blue admin navigation background.
- Add navigation-focused test coverage for route state and responsive drawer behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `admin-screen-alignment`: Require responsive shared admin navigation with consistent current-route indication for Dashboard and Rates.

## Impact

- Affects `src/admin/AdminLayout.js` and potentially small navigation test support files.
- Reuses the existing Chakra UI navigation primitives, React Router route state, breakpoint handling, disclosure state, and menu icon dependencies already used by `src/Layout.js`.
- No API, route, authentication, or database changes.

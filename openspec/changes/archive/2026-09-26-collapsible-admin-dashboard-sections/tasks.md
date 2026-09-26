## 1. Dashboard section model and preference state

- [x] 1.1 Refactor the Dashboard section definitions to include stable identifiers, item collections, total counts, and section-specific red-flag predicates; verify existing workflow filtering tests continue to pass
- [x] 1.2 Add validated cookie read/write helpers for the section-state map, including collapsed defaults, unknown-section handling, malformed values, `/admin` scope, and expiry; verify helper tests cover valid, missing, malformed, and partial preferences
- [x] 1.3 Connect section toggles to local Dashboard state and cookie persistence; verify toggling a section updates visibility immediately and survives a Dashboard reload

## 2. Collapsible section presentation

- [x] 2.1 Replace Dashboard section headings with accessible disclosure controls that expose expanded state and control the corresponding card region; verify keyboard activation and accessibility attributes in component tests
- [x] 2.2 Add always-visible total-count badges and conditional red-flag badges with red background and white text; verify zero red-flag counts are omitted and nonzero counts match each section's existing urgency rule
- [x] 2.3 Render section cards only when expanded while preserving existing card actions, ordering, empty-section behavior, and Event Group Search placement; verify existing Dashboard interaction tests remain green

## 3. Verification and production assets

- [x] 3.1 Add focused Dashboard tests for initial collapsed state, restoration, toggling, malformed-cookie fallback, count badges, and section-specific red-flag calculations; verify with `npm test -- --watchAll=false src/admin/Dashboard.test.js`
- [x] 3.2 Run the complete frontend test suite and verify no existing admin or Dashboard behavior regresses
- [x] 3.3 Regenerate production frontend assets with `npm run build` and verify the build completes successfully

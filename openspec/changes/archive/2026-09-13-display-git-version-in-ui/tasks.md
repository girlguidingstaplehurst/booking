## 1. Frontend Version Resolution

- [x] 1.1 Add the frontend build-version resolver and wire `npm run build` to prefer `REACT_APP_VERSION`, then `git describe --tags --always --dirty`, then `development`; verify supplied, Git-derived, and unavailable-metadata cases
- [x] 1.2 Render the resolved version as a small centered line at the bottom of the shared Footer beneath the existing charity text; verify the Footer displays the compiled version without affecting existing links or layout

## 2. Frontend Coverage

- [x] 2.1 Add focused tests for Footer version rendering and build-version fallback behavior, including an exact production tag and a full Git description
- [x] 2.2 Run the focused Footer/version tests and verify the existing frontend test suite remains green

## 3. Release Build Integration

- [x] 3.1 Update the GitHub release workflow to install frontend dependencies and pass `steps.semver.outputs.next` as `REACT_APP_VERSION` to `npm run build` before `ko build`; verify the workflow ordering and environment wiring
- [x] 3.2 Run `npm run build` locally and verify the generated `build/` assets contain the expected Git-derived version and remain embeddable by the Go service

## 4. Final Verification

- [x] 4.1 Run the complete frontend test suite and production build, then verify no unrelated frontend behavior regresses

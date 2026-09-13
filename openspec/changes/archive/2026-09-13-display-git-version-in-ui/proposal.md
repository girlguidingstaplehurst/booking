## Why

The deployed application currently gives users no visible indication of which release or Git revision they are using. Showing the same Git-derived version information used by the release and container workflow will make support, testing, and deployment verification easier.

## What Changes

- Display the application version at the bottom of the shared UI footer.
- Use the full Git description form for local or development builds, such as `v0.57.0-3-g2b856b6`.
- Use the exact release tag calculated by CI for production builds, such as `v0.58.0`.
- Provide a safe generic fallback when no Git or build version is available.
- Pass the production release version into the frontend build before the Go container embeds the generated frontend.

## Capabilities

### New Capabilities

- `version-display`: expose the build or Git-derived application version in the shared user interface.

### Modified Capabilities

None.

## Impact

- Affects the React footer and frontend build configuration.
- Affects the production GitHub Actions build ordering and environment passed to the frontend build.
- Regenerates the embedded `build/` frontend assets during production builds.
- No API, database, authentication, or runtime service contract changes are expected.

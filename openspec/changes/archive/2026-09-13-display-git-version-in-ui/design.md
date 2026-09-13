## Context

The React application is compiled into `build/` and embedded by `embed.go`; the browser cannot execute Git commands at runtime. Local Git descriptions currently resolve through commands such as `git describe --tags --always --dirty`, while the release workflow already calculates an exact semantic release tag and passes it to the Go binary through linker flags. The workflow does not currently rebuild the frontend before the container build.

## Goals / Non-Goals

**Goals:**

- Show a reliable build identifier in the shared Footer.
- Use the full Git description for local builds and the exact calculated release tag for CI production builds.
- Ensure the version is present in the frontend assets before Go embedding and container creation.
- Provide a non-empty fallback for environments without Git metadata.

**Non-Goals:**

- Adding a runtime version API or network request.
- Changing Go service version reporting, OpenTelemetry metadata, release calculation, or image tag naming.
- Showing branch names, deployment timestamps, or commit messages.

## Decisions

### Resolve version at frontend build time

The frontend will compile a version value into the bundle through the existing `REACT_APP_*` environment convention. A small build wrapper will prefer an explicitly supplied `REACT_APP_VERSION`, otherwise resolve `git describe --tags --always --dirty`, and finally use `development` when the command is unavailable. This keeps the browser independent of the repository and lets CI override local Git state with the authoritative release tag.

An alternative runtime endpoint was rejected because it would add an API dependency to a presentation-only value and would not help identify the exact static assets if the endpoint and frontend were out of sync.

### Render the version in the shared Footer

The Footer will render a small centered version line beneath the existing charity text. Keeping it in the shared Footer makes the value visible across public and admin routes without duplicating UI logic.

### Build frontend assets before container creation

The GitHub workflow will install frontend dependencies and run the frontend build after the semver action has calculated the release tag and before `ko build` embeds `build/`. The release tag will be passed as `REACT_APP_VERSION`; local `npm run build` will use the wrapper's Git-description fallback.

## Risks / Trade-offs

- [Risk] A CI checkout may not have useful Git history for `git describe`. -> Mitigation: CI explicitly supplies the semver action's calculated release tag, so the fallback is not used for production releases.
- [Risk] Running frontend installation and build increases CI duration. -> Mitigation: use the existing lockfile with `npm ci` and build exactly once before the container build.
- [Risk] A stale checked-in `build/` directory could be embedded if the workflow step is skipped. -> Mitigation: place the versioned frontend build immediately before `ko build` and add a workflow task/test verification.
- [Trade-off] The version is a compile-time value and will not change in an already-running browser after deployment. -> Mitigation: this matches the immutable embedded asset model and accurately identifies the loaded bundle.

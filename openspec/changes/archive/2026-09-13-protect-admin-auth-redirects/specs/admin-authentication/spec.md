## Purpose

Provide predictable browser authentication boundaries for the administration area so unauthenticated or rejected sessions reach the login page instead of entering a refresh loop.

## ADDED Requirements

### Requirement: All admin URLs require a session before loading protected data

The application MUST check for an authentication token before loading any route within the `/admin` URL subtree. When no token is present, it MUST redirect to `/login` and MUST NOT invoke protected admin data loaders.

#### Scenario: User opens the admin dashboard without a session

- **WHEN** the user navigates to `/admin` and no authentication token is stored
- **THEN** the application redirects to `/login` without requesting protected dashboard data

#### Scenario: User opens a nested admin URL without a session

- **WHEN** the user navigates to any nested `/admin/...` URL and no authentication token is stored
- **THEN** the application redirects to `/login` without requesting protected admin data for that URL

### Requirement: Rejected admin sessions return to login without reloading

When a protected admin request is rejected as unauthorised, the application MUST clear the stored authentication token and redirect to `/login`. It MUST NOT reload the rejected admin URL or repeatedly retry the request.

#### Scenario: Stored token is invalid or expired

- **WHEN** an authenticated admin request receives an HTTP `401 Unauthorized` response
- **THEN** the application clears the stored token and redirects to `/login` without reloading the current admin URL

#### Scenario: Redirected login page is reached after token rejection

- **WHEN** the application redirects to `/login` because an admin request was unauthorised
- **THEN** the login page remains stable and does not issue protected admin requests or redirect back to an admin URL automatically

### Requirement: Valid sessions retain existing admin behavior

The application MUST continue loading protected admin data and allowing authenticated admin navigation when the stored token is accepted by the server.

#### Scenario: Valid token opens the dashboard

- **WHEN** the user navigates to `/admin` with a server-accepted token
- **THEN** the dashboard data loads and the user remains on the admin dashboard

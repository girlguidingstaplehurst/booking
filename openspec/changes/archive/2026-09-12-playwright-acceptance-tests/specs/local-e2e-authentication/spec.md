## Purpose

Provide a deliberately enabled local authentication path that lets unattended browser tests exercise authenticated application behavior without automating or contacting Google sign-in.

## ADDED Requirements

### Requirement: Google authentication remains the default

The service MUST use the existing Google ID-token validation and hosted-domain checks unless an explicit E2E authentication mode is enabled for the local acceptance environment.

#### Scenario: Normal service startup
- **WHEN** the service starts without E2E authentication configuration
- **THEN** authenticated admin requests continue to require a valid Google bearer token for an allowed hosted domain

#### Scenario: Unknown authentication mode
- **WHEN** the service receives an unsupported authentication-mode value
- **THEN** startup fails closed rather than selecting an insecure fallback

### Requirement: E2E authentication requires explicit configuration

The service MUST enable local E2E authentication only when the dedicated mode is explicitly selected and a configured test credential is present.

#### Scenario: E2E mode is not selected
- **WHEN** the service starts in its default authentication mode
- **THEN** the E2E credential is not accepted for admin authentication

#### Scenario: E2E mode lacks a credential
- **WHEN** E2E authentication mode is selected without its configured test credential
- **THEN** service startup fails rather than accepting unauthenticated admin requests

### Requirement: Configured E2E credentials authenticate a deterministic test identity

In E2E mode, the service MUST accept only the configured test bearer credential, reject other credentials, and associate accepted requests with a deterministic test identity suitable for browser workflows.

#### Scenario: Configured credential is supplied
- **WHEN** an admin request supplies the configured E2E bearer credential
- **THEN** the request proceeds to the normal authenticated admin handler as the deterministic E2E identity

#### Scenario: Different credential is supplied
- **WHEN** an admin request supplies a bearer credential other than the configured E2E credential
- **THEN** the service returns unauthorized and does not invoke the admin handler

### Requirement: E2E credentials preserve the frontend token contract

The E2E bearer credential MUST be JWT-shaped with a browser-decodable payload containing the identity claims required by the frontend authentication state, while its acceptance remains restricted by the server-side configured credential.

#### Scenario: Browser initializes with the E2E credential
- **WHEN** the acceptance test places the credential in the frontend session storage before navigation
- **THEN** the application treats the browser as authenticated and sends the credential on admin API requests

#### Scenario: Malformed browser credential
- **WHEN** the browser receives a credential that cannot be decoded by the frontend authentication state
- **THEN** the acceptance setup rejects it before attempting authenticated workflows

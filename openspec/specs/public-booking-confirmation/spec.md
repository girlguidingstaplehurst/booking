# public-booking-confirmation Specification

## Purpose

Provide public booking users with a clear, content-managed confirmation page after their booking succeeds, while preserving a reliable route back to the main page.

## Requirements

### Requirement: Successful public bookings show the thank-you page

After the public booking request succeeds, the application MUST navigate the user to `/thank-you` and display the published Contentful page identified by `thank-you`.

#### Scenario: Booking submission succeeds

- **WHEN** a user submits a valid public booking and the booking request returns success
- **THEN** the application navigates to `/thank-you` and renders the managed `thank-you` page content

#### Scenario: Thank-you page is refreshed directly

- **WHEN** a user loads or refreshes `/thank-you` directly
- **THEN** the service serves the application and the thank-you page is rendered instead of returning a not-found response

### Requirement: Thank-you page provides a protected return link

The thank-you page MUST render a visible application-owned link that navigates to the main page at `/`, independently of the editable Contentful rich-text content.

#### Scenario: User returns to the main page

- **WHEN** a user activates the return link on the thank-you page
- **THEN** the application navigates to `/`

#### Scenario: Content editors modify thank-you content

- **WHEN** the published `thank-you` Contentful entry is updated without including a return link
- **THEN** the React-rendered thank-you page still provides the return link to `/`

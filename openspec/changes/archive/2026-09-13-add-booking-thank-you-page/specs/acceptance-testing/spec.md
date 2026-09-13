## MODIFIED Requirements

### Requirement: Workflows are exercised through the rendered application

The acceptance suite MUST drive representative public and authenticated admin workflows through the rendered web page and the service HTTP API rather than replacing application requests with mocks.

#### Scenario: Public booking workflow succeeds

- **WHEN** a browser submits a valid public booking through the booking page
- **THEN** the suite observes navigation to the `/thank-you` page, verifies that the page provides a return link to `/`, and verifies the corresponding booking data in PostgreSQL

#### Scenario: Admin management workflow succeeds

- **WHEN** an authenticated browser creates or updates a supported admin resource through its page
- **THEN** the suite observes the updated page behavior and verifies the persisted resource state in PostgreSQL

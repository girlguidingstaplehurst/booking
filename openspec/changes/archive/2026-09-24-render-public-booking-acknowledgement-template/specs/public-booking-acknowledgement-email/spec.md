## MODIFIED Requirements

### Requirement: Successful public bookings send a rendered acknowledgement email

After a valid public booking has been successfully persisted, the system MUST request the published email resource identified by `event-name-booking-in-review`, render its subject and body using the booking event details and formatted booking date, and send the rendered content to the email address supplied with the booking.

#### Scenario: Booking acknowledgement renders event details

- **WHEN** a valid public booking is persisted and the managed email resource is available
- **THEN** the system sends the resource's subject and body with template variables resolved, including the submitted event name, contact, and booking date

#### Scenario: Booking and email delivery succeed

- **WHEN** a valid public booking is persisted and the managed email resource is available
- **THEN** the system sends the rendered resource content to the booker's email address and returns HTTP 200

#### Scenario: Invalid or duplicate booking is rejected

- **WHEN** validation fails or persistence reports that the booking already exists
- **THEN** the system MUST NOT send an acknowledgement email

### Requirement: Acknowledgement email failures do not fail successful bookings

If the managed email resource cannot be loaded or the acknowledgement cannot be rendered or sent after the booking has been persisted, the system MUST log the failure and MUST still return HTTP 200 for the booking request.

#### Scenario: Managed email content cannot be loaded

- **WHEN** the booking is persisted but the `event-name-booking-in-review` resource lookup fails
- **THEN** the failure is logged and the booking request returns HTTP 200

#### Scenario: Email template cannot be rendered

- **WHEN** the booking is persisted but a template variable cannot be rendered
- **THEN** the failure is logged and the booking request returns HTTP 200

#### Scenario: Email delivery fails

- **WHEN** the booking is persisted, email content is rendered, and delivery fails
- **THEN** the failure is logged and the booking request returns HTTP 200

#### Scenario: Email failure is logged without message content

- **WHEN** an acknowledgement lookup, rendering, or delivery failure is logged
- **THEN** the log identifies the failed operation and booking recipient or resource context without logging the email body

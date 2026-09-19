# public-booking-acknowledgement-email Specification

## Purpose

Provide public booking users with a content-managed email acknowledgement after their booking is successfully received, without making email availability a prerequisite for booking success.

## Requirements

### Requirement: Successful public bookings send an acknowledgement email

After a valid public booking has been successfully persisted, the system MUST request the published email resource identified by `event-name-booking-in-review` and send its subject and body to the email address supplied with the booking.

#### Scenario: Booking and email delivery succeed

- **WHEN** a valid public booking is persisted and the managed email resource is available
- **THEN** the system sends the resource's subject and body to the booker's email address and returns HTTP 200

#### Scenario: Invalid or duplicate booking is rejected

- **WHEN** validation fails or persistence reports that the booking already exists
- **THEN** the system MUST NOT send an acknowledgement email

### Requirement: Acknowledgement email failures do not fail successful bookings

If the managed email resource cannot be loaded or the acknowledgement cannot be sent after the booking has been persisted, the system MUST log the failure and MUST still return HTTP 200 for the booking request.

#### Scenario: Managed email content cannot be loaded

- **WHEN** the booking is persisted but the `event-name-booking-in-review` resource lookup fails
- **THEN** the failure is logged and the booking request returns HTTP 200

#### Scenario: Email delivery fails

- **WHEN** the booking is persisted, email content is loaded, and delivery fails
- **THEN** the failure is logged and the booking request returns HTTP 200

#### Scenario: Email failure is logged without message content

- **WHEN** an acknowledgement lookup or delivery failure is logged
- **THEN** the log identifies the failed operation and booking recipient or resource context without logging the email body

# email-delivery-safety Specification

## Purpose

Provide a safe email boundary for test environments so workflows can exercise email-producing behavior without contacting external mail services, while keeping messages observable to automated tests.

## Requirements

### Requirement: Test email actions do not deliver messages externally

The service MUST support an explicitly selected test email implementation that accepts email actions without opening a connection to an external SMTP service or delivering a message.

#### Scenario: E2E email action is reached

- **WHEN** a running E2E service handles an action that sends an email
- **THEN** the action completes using the non-delivering implementation and no external mail service is contacted

#### Scenario: Production email configuration is unchanged

- **WHEN** the service runs with its production email configuration
- **THEN** email actions continue to use the configured SMTP delivery behavior

### Requirement: Test email messages are observable

The non-delivering implementation MUST record each accepted message, including its recipient, subject, body, and attachment filename, MIME type, and content, for assertions performed by automated tests.

#### Scenario: Message without attachments is recorded

- **WHEN** a test email action sends a recipient, subject, and body
- **THEN** the recorder contains one message with those values and no attachments

#### Scenario: Message with attachments is recorded

- **WHEN** a test email action sends one or more attachments
- **THEN** the recorder contains each attachment's filename, MIME type, and complete content

#### Scenario: Email action is repeated

- **WHEN** multiple test email actions are accepted
- **THEN** the recorder retains the messages in send order

### Requirement: Test email failures remain testable without network dependencies

The non-delivering implementation MUST return success for valid messages without requiring SMTP credentials, DNS, or network connectivity, and MUST preserve a deterministic way for Go tests to verify malformed or unreadable attachment handling if such handling is supported.

#### Scenario: SMTP settings are absent in E2E

- **WHEN** the E2E service has no SMTP server, username, or password configured
- **THEN** an email-producing workflow is not failed because of missing SMTP settings

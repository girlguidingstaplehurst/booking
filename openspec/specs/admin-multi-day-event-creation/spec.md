# admin-multi-day-event-creation Specification

## Purpose

This capability allows administrators to create one continuous event interval that begins on one calendar date and ends on a later calendar date, while preserving the existing one-day event workflow.

## Requirements

### Requirement: Administrator can opt into a continuous multi-day interval

The admin Create Events workflow SHALL provide an opt-in control labelled to indicate that the event spans multiple days. The control SHALL be available on the Create Events page and SHALL NOT be available in event-group creation or the public event-creation form.

#### Scenario: Multi-day option is available for admin event creation
- **WHEN** an administrator opens the Create Events page
- **THEN** a control for enabling a multi-day event is displayed

#### Scenario: Multi-day option is unavailable in other creation workflows
- **WHEN** a user opens event-group creation or the public event-creation form
- **THEN** no multi-day option is displayed by the shared date/time control

### Requirement: Administrator can enter separate start and end date-times

When the multi-day option is enabled, the workflow SHALL display separate start date, start time, end date, and end time inputs. The submitted event SHALL contain one continuous interval using the entered start and end date-times.

#### Scenario: Valid multi-day interval is submitted
- **WHEN** an administrator enters a start date-time and a later end date-time with multi-day mode enabled
- **THEN** the event submission contains exactly one instance whose `from` is the start timestamp and whose `to` is the end timestamp

#### Scenario: Cross-day interval has an earlier end clock time
- **WHEN** an administrator enters a start date-time on one date and an end date-time on a later date whose clock time is earlier than the start time
- **THEN** the interval is accepted because the complete end timestamp is later

### Requirement: Multi-day interval validation prevents invalid submissions

The workflow SHALL require all four date/time values in multi-day mode and SHALL reject an end date-time that is equal to or earlier than the start date-time. It SHALL display a validation error and submit no instances while the interval is invalid.

#### Scenario: Multi-day fields are incomplete
- **WHEN** multi-day mode is enabled and any start or end date/time value is missing
- **THEN** the workflow displays a validation error and contributes no event instance

#### Scenario: End date precedes start date
- **WHEN** multi-day mode is enabled and the end date is before the start date
- **THEN** the workflow displays a validation error and contributes no event instance

#### Scenario: End timestamp is not after start timestamp
- **WHEN** multi-day mode is enabled and the complete end timestamp is equal to or earlier than the complete start timestamp
- **THEN** the workflow displays a validation error and contributes no event instance

### Requirement: Existing one-day behavior remains unchanged

When multi-day mode is disabled, the date/time control SHALL continue to accept one event date with a start and end time, requiring the end time to be after the start time. Existing event-group and public creation behavior SHALL remain unchanged.

#### Scenario: One-day mode remains the default
- **WHEN** an administrator opens the Create Events page without enabling multi-day mode
- **THEN** the existing single-date inputs are shown and no end-date input is required

#### Scenario: Valid one-day event is submitted
- **WHEN** an administrator enters one date with a valid start and end time and multi-day mode is disabled
- **THEN** the workflow contributes exactly one instance for that date

#### Scenario: One-day end time is invalid
- **WHEN** multi-day mode is disabled and the end time is equal to or earlier than the start time
- **THEN** the workflow displays a validation error and contributes no event instance

## Purpose

This capability lets administrators create either a single event or an optional fixed-time weekly schedule, remove weeks when no meeting occurs, and submit the resulting concrete event instances through the existing booking workflows.

## ADDED Requirements

### Requirement: Administrator can create a single event by default

The system SHALL open the date control with weekly recurrence disabled and allow an administrator to provide one event date, start time, and end time.

#### Scenario: One-off mode is displayed by default

- **WHEN** an administrator opens an event creation form
- **THEN** the recurrence control is disabled and the one-off date and time fields are available without requiring an end date

#### Scenario: Single event is submitted

- **WHEN** an administrator submits a valid schedule with recurrence disabled
- **THEN** the existing event or event-group workflow receives exactly one concrete `from` and `to` pair

### Requirement: Administrator can toggle weekly recurrence

The system SHALL provide a clearly labelled control that enables or disables weekly recurrence without changing the existing event details or time range.

#### Scenario: Recurrence is enabled

- **WHEN** an administrator enables weekly recurrence
- **THEN** the inclusive recurrence end date and generated occurrence controls are displayed

#### Scenario: Recurrence is disabled after being enabled

- **WHEN** an administrator disables weekly recurrence
- **THEN** the schedule returns to one-off mode and only the first date and configured time range are submitted

### Requirement: Administrator can define a weekly schedule

When weekly recurrence is enabled, the system SHALL allow an administrator to provide a first meeting date, a meeting start time, a meeting end time, and an inclusive schedule end date.

#### Scenario: Schedule uses the first date as its weekly weekday

- **WHEN** an administrator provides a first meeting date and an end date on or after it
- **THEN** the system generates occurrences on the same weekday as the first meeting date at weekly intervals through the inclusive end date

#### Scenario: Schedule uses one fixed time range

- **WHEN** an administrator provides valid start and end times
- **THEN** every generated occurrence has the same local start and end times

### Requirement: Administrator can exclude individual weeks

The system SHALL allow an administrator to exclude any generated weekly occurrence before submitting the schedule.

#### Scenario: Week is skipped

- **WHEN** an administrator marks a generated occurrence as skipped
- **THEN** that occurrence is omitted from the submitted concrete instance list while all other generated occurrences remain

#### Scenario: No weeks are skipped

- **WHEN** an administrator submits a schedule without excluding an occurrence
- **THEN** every generated occurrence in the date range is included in the submitted concrete instance list

### Requirement: Schedule preview reflects submitted occurrences

The system SHALL display the generated occurrences and the count of occurrences that will be submitted.

#### Scenario: Preview updates after exclusion

- **WHEN** an administrator excludes or restores a generated week
- **THEN** the preview and occurrence count update to reflect only the occurrences that will be submitted

### Requirement: Invalid schedules cannot be submitted

The system SHALL prevent submission when the schedule has an invalid date, invalid time range, an invalid recurrence date range, or no remaining occurrences.

#### Scenario: End date precedes first date

- **WHEN** weekly recurrence is enabled and the administrator chooses an end date before the first meeting date
- **THEN** the system displays a validation error and does not submit instances

#### Scenario: End time is not after start time

- **WHEN** the administrator chooses an end time equal to or earlier than the start time
- **THEN** the system displays a validation error and does not submit instances

#### Scenario: All generated weeks are skipped

- **WHEN** the administrator excludes every generated occurrence
- **THEN** the system displays a validation error and does not submit an empty instance list

#### Scenario: One-off date or time is incomplete

- **WHEN** weekly recurrence is disabled and the administrator has not provided a date or valid start/end times
- **THEN** the system displays a validation error and does not submit instances

### Requirement: Submitted occurrences preserve local meeting times

The system SHALL generate each occurrence from its calendar date and configured local time so that weekly meetings retain their configured wall-clock time across daylight-saving transitions.

#### Scenario: Weekly schedule crosses a daylight-saving transition

- **WHEN** the schedule spans a daylight-saving transition
- **THEN** each occurrence represents the configured local start and end times on its generated calendar date

### Requirement: Existing booking workflows receive concrete instances

The system SHALL submit the remaining occurrences using the existing concrete `instances` payload consumed by event and event-group creation.

#### Scenario: Recurring schedule is submitted successfully

- **WHEN** an administrator submits a valid schedule with one or more remaining occurrences
- **THEN** the existing event or event-group workflow receives one concrete `from` and `to` pair for each remaining occurrence

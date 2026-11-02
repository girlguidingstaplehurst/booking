## Purpose

Record when events and event groups are created, using server-assigned times, and let administrators see that history on the relevant review pages.

## ADDED Requirements

### Requirement: New events and event groups record server-assigned creation times
The system SHALL record a creation timestamp for every new event and event group when it is persisted. This SHALL cover public event bookings, admin-created events, event-group creation, and event-group duplication, including every event session created as part of a group. Creation timestamps SHALL be assigned by the server and SHALL NOT be set or overridden by a value supplied by a public or admin form. Editing an event or group after creation SHALL NOT change its creation timestamp. A duplicated event group and its sessions SHALL receive new creation timestamps rather than inheriting timestamps from the source group.

#### Scenario: Public booking records the accepted event's creation time
- **WHEN** a public event booking is successfully persisted
- **THEN** the new event has a server-assigned creation timestamp
- **AND** a client-supplied timestamp cannot set or override it

#### Scenario: Admin event creation timestamps every submitted event
- **WHEN** an administrator successfully creates one or more event instances
- **THEN** each persisted event instance has a server-assigned creation timestamp

#### Scenario: Creating or duplicating a group timestamps the group and its sessions
- **WHEN** an administrator successfully creates or duplicates an event group
- **THEN** the new group and every session event have server-assigned creation timestamps
- **AND** a duplicated group and its sessions do not inherit the source group's creation timestamps

#### Scenario: Editing an event does not change its creation time
- **WHEN** an administrator updates an event's dates, status, or other editable details
- **THEN** the event's creation timestamp remains unchanged

### Requirement: Administrators can see creation times on review pages
The authenticated admin event data SHALL provide an event's creation timestamp, and the authenticated admin event-group data SHALL provide a group's creation timestamp. The individual event review page and event-group review page SHALL display the corresponding creation time. For records whose creation time is unknown, the review page SHALL display an explicit unknown state rather than a fabricated time.

#### Scenario: Review pages display a known creation time
- **WHEN** an administrator reviews an event or event group with a recorded creation timestamp
- **THEN** the corresponding review page displays that creation time

#### Scenario: Review pages identify a missing historical creation time
- **WHEN** an administrator reviews an event or event group whose creation time is unknown
- **THEN** the corresponding review page displays that the creation time is unknown

### Requirement: Creation times remain private to admin views
The system SHALL expose event and event-group creation timestamps only through authenticated admin data and SHALL NOT add them to public event, booking-availability, or public schedule responses.

#### Scenario: Public views do not expose creation times
- **WHEN** a user retrieves public event, booking-availability, or What's On data
- **THEN** the response contains no event or event-group creation timestamp

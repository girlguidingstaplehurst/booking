## Purpose

Provide a clearer public schedule by presenting related event sessions together while retaining accurate visibility, time-period filtering, and chronological ordering.

## ADDED Requirements

### Requirement: Public schedule returns grouped display items

The dedicated What's On API response SHALL represent each publicly visible event group as one display item containing its publicly visible sessions in the requested period. Each publicly visible event without an event group SHALL be represented as its own display item containing that event. A display item SHALL identify whether it represents an event group or a standalone event and SHALL include the event data needed to render its title and session cards. The existing booking availability endpoint SHALL retain its current flat response behavior.

#### Scenario: Grouped public sessions are returned together

- **WHEN** multiple publicly visible events belong to a publicly visible event group and overlap the public events period
- **THEN** the response contains one event-group display item containing those events, rather than one top-level item per event

#### Scenario: Standalone public event is returned as one item

- **WHEN** a publicly visible event has no event-group association and overlaps the public events period
- **THEN** the response contains one standalone display item containing that event

#### Scenario: Private group is excluded

- **WHEN** events belong to an event group whose group-level visibility is false
- **THEN** none of those events are returned in the public schedule

#### Scenario: Private session is excluded from a public group

- **WHEN** an event group is publicly visible but one of its sessions has event-level visibility set to false
- **THEN** that session is omitted and other qualifying sessions from the group remain eligible for the group display item

### Requirement: Public schedule uses interval overlap and the existing period

The dedicated What's On endpoint SHALL retain the existing implicit period when no `from` and `to` parameters are provided. An event SHALL qualify for the period when its time interval overlaps the period, including when it begins before the period and ends after the period. The public What's On page SHALL NOT add period navigation or date-selection controls. The existing booking availability endpoint SHALL retain its current period and response behavior.

#### Scenario: Event overlaps the start of the period

- **WHEN** an event begins before the period ends after the period starts
- **THEN** the event is included in the public schedule if its visibility rules are satisfied

#### Scenario: Event contains the complete period

- **WHEN** an event starts before the period and ends after the period
- **THEN** the event is included in the public schedule

#### Scenario: Event is outside the period

- **WHEN** an event ends before the period starts or begins after the period ends
- **THEN** the event is not included in the public schedule

### Requirement: Public schedule orders display items and sessions

The public schedule SHALL order top-level display items by the start time of their earliest included event. Events within each display item SHALL be ordered by start time, with deterministic end-time and name ordering when start times are equal.

#### Scenario: Groups and standalone events are interleaved chronologically

- **WHEN** public groups and standalone events have different earliest included event start times
- **THEN** their display items are returned in ascending order of those start times

#### Scenario: Sessions within a group are chronological

- **WHEN** a display item contains multiple qualifying events
- **THEN** its events are returned in ascending start-time order

### Requirement: What's On renders nested schedule cards

The What's On page SHALL render one prominent card for each public display item and a smaller event card for each event within that item. A standalone display item SHALL render one smaller event card. The page SHALL continue using the existing implicit period and SHALL render no private events.

#### Scenario: Group card contains session cards

- **WHEN** the public response contains an event-group display item with qualifying sessions
- **THEN** the page renders one large group card containing one smaller card for each returned session

#### Scenario: Empty public schedule

- **WHEN** the public response contains no qualifying display items
- **THEN** the page renders no event cards

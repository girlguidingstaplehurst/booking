# admin-event-notes Specification

## Purpose

Give administrators an internal, attributable note history for each individual booking event or session, available from that event's Review screen throughout its lifecycle.

## Requirements

### Requirement: Administrators can add and view notes on an individual event
The system MUST allow authenticated administrators to add plain-text notes to an individual event or session and view that event's notes on its admin Review screen. Note submission MUST be available regardless of the event's status. Notes MUST NOT be displayed in public event views or on the event-group review page.

#### Scenario: Administrator adds a note in any event status
- **WHEN** an authenticated administrator submits a note for an existing event, including an event in any status
- **THEN** the system stores the note for that individual event and makes it visible on that event's admin Review screen

#### Scenario: Unauthenticated user attempts to add or retrieve notes
- **WHEN** a request to add or retrieve event notes is made without valid admin authentication
- **THEN** the system rejects the request as unauthorized

#### Scenario: Notes remain private to the individual admin review
- **WHEN** an event with notes is viewed through a public event view or an event-group review page
- **THEN** the notes are not included or displayed

### Requirement: Notes record authenticated authorship and submission time
For each note, the system MUST store the submitting administrator's email address from the authenticated request and the server-recorded submission time. The system MUST NOT rely on client-supplied author identity or submission time. The admin Review screen MUST display notes in reverse chronological order by submission time.

#### Scenario: Note metadata comes from the authenticated request
- **WHEN** an authenticated administrator submits a note
- **THEN** the stored author is the email address associated with that authenticated request
- **AND** the stored submission time is assigned by the server

#### Scenario: Notes are shown newest first
- **WHEN** an event has multiple notes with different submission times
- **THEN** the admin Review screen displays them from newest to oldest

### Requirement: Saved notes are append-only
The system MUST NOT provide administrators with the ability to edit or delete a saved note. Adding a note MUST preserve all existing notes for the event.

#### Scenario: Administrator adds another note
- **WHEN** an administrator submits a new note for an event that already has notes
- **THEN** the new note is added to the history without changing or removing existing notes

#### Scenario: Administrator attempts to edit or delete a saved note
- **WHEN** an administrator attempts to modify or delete an existing note
- **THEN** the system does not permit the operation

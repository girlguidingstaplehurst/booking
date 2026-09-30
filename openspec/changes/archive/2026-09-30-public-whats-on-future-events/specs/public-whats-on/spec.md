## MODIFIED Requirements

### Requirement: Public schedule uses interval overlap and the existing period

The dedicated What's On endpoint SHALL retain the existing implicit period when no `from` and `to` parameters are provided. For that implicit default period, an event SHALL qualify only when its start time is later than the current instant and no later than the end of the implicit period. The public schedule SHALL exclude events that have already started, including events that started earlier on the current day and events that are still in progress. When both `from` and `to` parameters are explicitly provided, an event SHALL qualify for the requested period when its time interval overlaps that period, including when it begins before the period and ends after the period. The endpoint SHALL NOT add period navigation or date-selection controls to the public What's On page. The existing booking availability endpoint SHALL retain its current period and response behavior.

#### Scenario: Implicit period excludes events that started before today

- **WHEN** no `from` or `to` parameters are supplied and an event started before the current day
- **THEN** the event is not included in the public schedule

#### Scenario: Implicit period excludes events that started earlier today

- **WHEN** no `from` or `to` parameters are supplied and an event started earlier on the current day
- **THEN** the event is not included in the public schedule, even if it has not ended

#### Scenario: Implicit period includes events that have not started

- **WHEN** no `from` or `to` parameters are supplied and an event starts after the current instant within the implicit period
- **THEN** the event is included in the public schedule if its visibility rules are satisfied

#### Scenario: Explicit period retains interval overlap

- **WHEN** both `from` and `to` parameters are supplied and an event begins before the period and ends after the period starts
- **THEN** the event is included in the public schedule if its visibility rules are satisfied

#### Scenario: Event overlaps the start of the period

- **WHEN** an event begins before the period ends after the period starts
- **THEN** the event is included in the public schedule if its visibility rules are satisfied

#### Scenario: Event contains the complete period

- **WHEN** an event starts before the period and ends after the period
- **THEN** the event is included in the public schedule if its visibility rules are satisfied

#### Scenario: Explicit period includes an event containing the complete period

- **WHEN** both `from` and `to` parameters are supplied and an event starts before the period and ends after the period
- **THEN** the event is included in the public schedule if its visibility rules are satisfied

#### Scenario: Event is outside an explicit period

- **WHEN** both `from` and `to` parameters are supplied and an event ends before the period starts or begins after the period ends
- **THEN** the event is not included in the public schedule

#### Scenario: Event is outside the period

- **WHEN** an event ends before the period starts or begins after the period ends
- **THEN** the event is not included in the public schedule

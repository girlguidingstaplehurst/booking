## ADDED Requirements

### Requirement: Administrators can start invoicing an invoiceable historical group from search

The Dashboard SHALL provide a `Create Invoice` action on a historical event-group search result when the group has at least one invoiceable session. The action SHALL open the existing invoice preparation workflow for that group and SHALL appear alongside the existing `Review` action. The Dashboard SHALL NOT offer `Create Invoice` for a group with no invoiceable sessions. Existing hourly partial-invoice and progressive all-or-nothing rules SHALL remain in effect.

#### Scenario: Start an invoice for a completed group with invoiceable sessions

- **WHEN** an administrator searches for a completed event group that has at least one invoiceable session
- **THEN** the search result provides both `Review` and `Create Invoice` actions
- **AND** activating `Create Invoice` opens invoice preparation for that group
- **AND** the existing group pricing rules determine which sessions can be invoiced

#### Scenario: Do not offer invoicing for a fully invoiced group

- **WHEN** an administrator searches for an event group with no invoiceable sessions
- **THEN** the search result does not provide a `Create Invoice` action
- **AND** the existing `Review` action remains available

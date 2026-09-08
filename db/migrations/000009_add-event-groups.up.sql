create table if not exists booking_event_groups
(
    id              text primary key,
    event_name      text not null,
    details         text not null,
    visible         bool not null,
    email           text not null references booking_contacts,
    standard_rate   text not null references booking_rates,
    per_session_rate text not null references booking_rates
);

alter table booking_events
    add event_group_id text references booking_event_groups;

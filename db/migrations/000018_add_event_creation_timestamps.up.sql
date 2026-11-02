alter table booking_events
    add column created_at timestamp with time zone;

alter table booking_event_groups
    add column created_at timestamp with time zone;

alter table booking_events
    alter column created_at set default now();

alter table booking_event_groups
    alter column created_at set default now();

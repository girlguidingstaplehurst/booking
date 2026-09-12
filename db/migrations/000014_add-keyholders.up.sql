create table if not exists booking_keyholders
(
    id         uuid primary key,
    name       text    not null,
    key_number integer not null unique,
    active     bool    not null default true
);

alter table booking_events
    add keyholder_in_id uuid references booking_keyholders,
    add keyholder_out_id uuid references booking_keyholders;

create index if not exists booking_events_keyholder_in_id on booking_events (keyholder_in_id);
create index if not exists booking_events_keyholder_out_id on booking_events (keyholder_out_id);

drop index if exists booking_events_keyholder_in;
drop index if exists booking_events_keyholder_out;

alter table booking_events
    drop column keyholder_in,
    drop column keyholder_out;

alter table booking_event_groups
    add rate text references booking_rates;

update booking_event_groups
set rate = standard_rate;

alter table booking_event_groups
    alter column rate set not null,
    drop column standard_rate,
    drop column per_session_rate;

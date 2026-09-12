alter table booking_event_groups
    add standard_rate text references booking_rates,
    add per_session_rate text references booking_rates;

update booking_event_groups
set standard_rate = rate,
    per_session_rate = rate;

alter table booking_event_groups
    alter column standard_rate set not null,
    alter column per_session_rate set not null,
    drop column rate;

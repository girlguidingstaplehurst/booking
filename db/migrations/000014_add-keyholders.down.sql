alter table booking_events
    add keyholder_in text,
    add keyholder_out text;

drop index if exists booking_events_keyholder_in_id;
drop index if exists booking_events_keyholder_out_id;

alter table booking_events
    drop column keyholder_in_id,
    drop column keyholder_out_id;

drop table if exists booking_keyholders;

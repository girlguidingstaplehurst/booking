alter table booking_rates
    alter column per_session set default '{}'::jsonb;

update booking_rates
set per_session = '{}'::jsonb
where per_session = '[]'::jsonb;

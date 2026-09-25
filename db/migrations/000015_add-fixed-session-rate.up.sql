alter table booking_rates
    add column session_price money,
    add column pricing_mode text not null default 'hourly';

update booking_rates
set pricing_mode = 'perSession'
where jsonb_array_length(per_session) > 0;

alter table booking_rates
    add constraint booking_rates_pricing_mode_check
    check (pricing_mode in ('hourly', 'fixedSession', 'perSession'));

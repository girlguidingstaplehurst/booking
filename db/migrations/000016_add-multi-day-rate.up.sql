alter table booking_rates
    add column initial_daily_periods integer not null default 1,
    add column initial_daily_rate money not null default 0,
    add column daily_rate money not null default 0;

alter table booking_rates
    drop constraint booking_rates_pricing_mode_check,
    add constraint booking_rates_pricing_mode_check
    check (pricing_mode in ('hourly', 'fixedSession', 'perSession', 'multiDay'));

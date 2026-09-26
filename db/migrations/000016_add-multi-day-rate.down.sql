alter table booking_rates
    drop constraint booking_rates_pricing_mode_check,
    drop column daily_rate,
    drop column initial_daily_rate,
    drop column initial_daily_periods,
    add constraint booking_rates_pricing_mode_check
    check (pricing_mode in ('hourly', 'fixedSession', 'perSession'));
